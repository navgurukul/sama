const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

const RUNS = Number(process.argv.find((arg) => arg.startsWith('--runs='))?.split('=')[1]) || 5;
const TIMEOUT_MS = Number(process.argv.find((arg) => arg.startsWith('--timeout='))?.split('=')[1]) || 15000;
const DELAY_MS = Number(process.argv.find((arg) => arg.startsWith('--delay='))?.split('=')[1]) || 250;

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
    value = value.replace(/^['\"]|['\"]$/g, '');
    env[key] = value;
  }

  return env;
};

const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
};

const summarize = (results) => {
  const latencies = results.map((r) => r.latencyMs);
  const success = results.filter((r) => r.ok).length;
  const failure = results.length - success;

  if (!latencies.length) {
    return { success, failure, min: null, max: null, avg: null, p50: null, p95: null };
  }

  const sum = latencies.reduce((acc, v) => acc + v, 0);
  return {
    success,
    failure,
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    avg: sum / latencies.length,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
  };
};

const fmt = (num) => (num == null ? '-' : `${num.toFixed(1)}ms`);

const runRequest = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const start = performance.now();
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    const body = await response.text();
    const end = performance.now();
    clearTimeout(timer);

    let rows = null;
    try {
      const parsed = JSON.parse(body);
      rows = Array.isArray(parsed?.data)
        ? parsed.data.length
        : Array.isArray(parsed)
          ? parsed.length
          : null;
    } catch (err) {
      rows = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      latencyMs: end - start,
      rows,
    };
  } catch (error) {
    const end = performance.now();
    clearTimeout(timer);
    return {
      ok: false,
      status: 'ERROR',
      latencyMs: end - start,
      error: error?.name || String(error),
      rows: null,
    };
  }
};

const withQuery = (base, query) => {
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${query}`;
};

const runScenario = async (name, url, runs, timeoutMs, delayMs) => {
  const results = [];
  for (let i = 0; i < runs; i += 1) {
    const result = await runRequest(url, timeoutMs);
    results.push(result);
    if (i < runs - 1 && delayMs > 0) await sleep(delayMs);
  }

  return {
    name,
    url,
    results,
    summary: summarize(results),
  };
};

const main = async () => {
  const env = parseEnvFile(ENV_PATH);
  const baseUrl = env.REACT_APP_LaptopAndBeneficiaryDetailsApi;

  if (!baseUrl) {
    console.error('REACT_APP_LaptopAndBeneficiaryDetailsApi is missing in .env');
    process.exit(1);
  }

  const scenarios = [
    {
      name: 'Unfiltered page-1 (cold/warm cache visible)',
      query: 'type=getLaptopData&page=1&limit=25&includeMeta=1',
      runs: RUNS,
    },
    {
      name: 'Unfiltered page-2 (cold/warm cache visible)',
      query: 'type=getLaptopData&page=2&limit=25&includeMeta=1',
      runs: RUNS,
    },
    {
      name: 'Filtered by status+working (server filter path)',
      query: 'type=getLaptopData&page=1&limit=25&includeMeta=1&statusFilter=Laptop%20Assigned&workingFilter=working',
      runs: RUNS,
    },
    {
      name: 'Exact ID search (best-case filtered path)',
      query: 'type=getLaptopData&page=1&limit=25&includeMeta=1&idQuery=SAMA',
      runs: RUNS,
    },
    {
      name: 'Unfiltered page-1 immediate repeat (cache hit check)',
      query: 'type=getLaptopData&page=1&limit=25&includeMeta=1',
      runs: 2,
    },
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    runs: RUNS,
    timeoutMs: TIMEOUT_MS,
    delayMs: DELAY_MS,
    endpoint: baseUrl,
    scenarios: [],
  };

  for (const scenario of scenarios) {
    const url = withQuery(baseUrl, scenario.query);
    const result = await runScenario(scenario.name, url, scenario.runs, TIMEOUT_MS, DELAY_MS);
    report.scenarios.push(result);
  }

  const reportPath = path.join(ROOT_DIR, 'laptop-latency-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('Laptop latency benchmark summary');
  console.log('Scenario | Avg | P95 | Min | Max | OK | Fail');
  console.log('---|---|---|---|---|---|---');

  for (const scenario of report.scenarios) {
    const s = scenario.summary;
    console.log(
      `${scenario.name} | ${fmt(s.avg)} | ${fmt(s.p95)} | ${fmt(s.min)} | ${fmt(s.max)} | ${s.success} | ${s.failure}`
    );
  }

  const repeat = report.scenarios.find((s) => s.name.includes('immediate repeat'));
  if (repeat && repeat.results.length === 2) {
    const first = repeat.results[0].latencyMs;
    const second = repeat.results[1].latencyMs;
    const delta = first - second;
    const pct = first > 0 ? (delta / first) * 100 : 0;
    console.log(`\nCache hint (same query back-to-back): first=${fmt(first)}, second=${fmt(second)}, improvement=${pct.toFixed(1)}%`);
  }

  console.log(`\nSaved detailed report to ${reportPath}`);
};

main().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
