const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

const DEFAULT_RUNS = Number(process.argv.find((arg) => arg.startsWith('--runs='))?.split('=')[1]) || 5;
const DEFAULT_TIMEOUT_MS = Number(process.argv.find((arg) => arg.startsWith('--timeout='))?.split('=')[1]) || 15000;
const DEFAULT_DELAY_MS = Number(process.argv.find((arg) => arg.startsWith('--delay='))?.split('=')[1]) || 200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    value = value.replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }

  return env;
};

const buildUrl = (env, key, query) => {
  const base = env[key];
  if (!base) return null;
  if (!query) return base;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${query}`;
};

const percentile = (values, p) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
};

const statsFor = (values) => {
  if (values.length === 0) {
    return { min: null, max: null, avg: null, p50: null, p95: null };
  }
  const sum = values.reduce((acc, val) => acc + val, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    p50: percentile(values, 50),
    p95: percentile(values, 95),
  };
};

const runRequest = async (endpoint, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const start = performance.now();
  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: endpoint.headers,
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      signal: controller.signal,
    });
    const end = performance.now();
    clearTimeout(timer);

    // Consume body to avoid connection reuse issues for some servers.
    await response.text().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      latencyMs: end - start,
    };
  } catch (error) {
    const end = performance.now();
    clearTimeout(timer);
    return {
      ok: false,
      status: 'ERROR',
      latencyMs: end - start,
      error: error?.name || 'UnknownError',
    };
  }
};

const formatMs = (value) => {
  if (value == null) return '-';
  return `${value.toFixed(1)}ms`;
};

const main = async () => {
  const env = parseEnvFile(ENV_PATH);

  const endpoints = [
    {
      name: 'Laptop Data (getLaptopData)',
      envKey: 'REACT_APP_LaptopAndBeneficiaryDetailsApi',
      query: 'type=getLaptopData',
      method: 'GET',
    },
    {
      name: 'Laptop Audit (audit)',
      envKey: 'REACT_APP_LaptopAndBeneficiaryDetailsApi',
      query: 'type=audit',
      method: 'GET',
    },
    {
      name: 'User Data (getUserData)',
      envKey: 'REACT_APP_LaptopAndBeneficiaryDetailsApi',
      query: 'type=getUserData',
      method: 'GET',
    },
    {
      name: 'Preliminary (getpre)',
      envKey: 'REACT_APP_LaptopAndBeneficiaryDetailsApi',
      query: 'type=getpre',
      method: 'GET',
    },
    {
      name: 'Pickup (pickupget)',
      envKey: 'REACT_APP_LaptopAndBeneficiaryDetailsApi',
      query: 'type=pickupget',
      method: 'GET',
    },
    {
      name: 'NGO Registration (registration)',
      envKey: 'REACT_APP_NgoInformationApi',
      query: 'type=registration',
      method: 'GET',
    },
    {
      name: 'NGO Donor IDs (donorID)',
      envKey: 'REACT_APP_NgoInformationApi',
      query: 'type=donorID',
      method: 'GET',
    },
    {
      name: 'NGO Questions (donorQuestion)',
      envKey: 'REACT_APP_NgoInformationApi',
      query: 'type=donorQuestion',
      method: 'GET',
    },
    {
      name: 'Manage Status (manageStatus)',
      envKey: 'REACT_APP_NgoInformationApi',
      query: 'type=manageStatus',
      method: 'GET',
    },
  ].map((entry) => {
    const url = buildUrl(env, entry.envKey, entry.query);
    return {
      ...entry,
      url,
      headers: entry.headers || { 'Content-Type': 'application/json' },
    };
  });

  const validEndpoints = endpoints.filter((endpoint) => endpoint.url);
  const skipped = endpoints.filter((endpoint) => !endpoint.url);

  if (skipped.length > 0) {
    console.warn('Skipping endpoints (missing env):');
    skipped.forEach((endpoint) => {
      console.warn(`- ${endpoint.name} (env: ${endpoint.envKey})`);
    });
  }

  if (validEndpoints.length === 0) {
    console.error('No endpoints resolved. Check .env values and try again.');
    process.exit(1);
  }

  const report = {
    runs: DEFAULT_RUNS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    delayMs: DEFAULT_DELAY_MS,
    generatedAt: new Date().toISOString(),
    endpoints: [],
  };

  for (const endpoint of validEndpoints) {
    const results = [];
    for (let i = 0; i < DEFAULT_RUNS; i += 1) {
      const result = await runRequest(endpoint, DEFAULT_TIMEOUT_MS);
      results.push(result);
      if (DEFAULT_DELAY_MS > 0 && i < DEFAULT_RUNS - 1) {
        await sleep(DEFAULT_DELAY_MS);
      }
    }

    const latencies = results.map((item) => item.latencyMs);
    const stats = statsFor(latencies);

    report.endpoints.push({
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      results,
      summary: {
        count: results.length,
        successCount: results.filter((item) => item.ok).length,
        failureCount: results.filter((item) => !item.ok).length,
        minMs: stats.min,
        maxMs: stats.max,
        avgMs: stats.avg,
        p50Ms: stats.p50,
        p95Ms: stats.p95,
      },
    });
  }

  const reportPath = path.join(ROOT_DIR, 'api-latency-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('API latency summary');
  console.log('Name | Method | Avg | P95 | Min | Max | OK | Fail');
  console.log('---|---|---|---|---|---|---|---');

  for (const endpoint of report.endpoints) {
    const summary = endpoint.summary;
    console.log(
      `${endpoint.name} | ${endpoint.method} | ${formatMs(summary.avgMs)} | ${formatMs(summary.p95Ms)} | ${formatMs(summary.minMs)} | ${formatMs(summary.maxMs)} | ${summary.successCount} | ${summary.failureCount}`
    );
  }

  console.log(`\nSaved detailed report to ${reportPath}`);
};

main().catch((error) => {
  console.error('Failed to run API latency report:', error);
  process.exit(1);
});
