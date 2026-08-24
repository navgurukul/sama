const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

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

const main = async () => {
  const env = parseEnvFile(ENV_PATH);
  const baseUrl = env.REACT_APP_LaptopAndBeneficiaryDetailsApi;

  if (!baseUrl) {
    console.error('REACT_APP_LaptopAndBeneficiaryDetailsApi is missing in .env');
    process.exit(1);
  }

  const url = `${baseUrl}?type=getLaptopData&page=1&limit=25&includeMeta=1`;
  console.log('Checking endpoint:');
  console.log(url);

  try {
    const start = Date.now();
    const response = await fetch(url);
    const elapsedMs = Date.now() - start;

    if (!response.ok) {
      console.error(`Request failed with status ${response.status}`);
      process.exit(1);
    }

    const json = await response.json();

    const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const total = Number.isFinite(json?.total) ? json.total : rows.length;
    const page = Number.isFinite(json?.page) ? json.page : 1;
    const limit = Number.isFinite(json?.limit) ? json.limit : 25;

    console.log('\nResult:');
    console.log(`Status: OK (${response.status})`);
    console.log(`Latency: ${elapsedMs}ms`);
    console.log(`Rows returned: ${rows.length}`);
    console.log(`Total rows (server): ${total}`);
    console.log(`Page: ${page}`);
    console.log(`Limit: ${limit}`);

    if (rows.length > 0) {
      const sample = rows[0];
      const sampleKeys = Object.keys(sample).slice(0, 10);
      console.log(`Sample row keys: ${sampleKeys.join(', ')}`);
      console.log(`First row ID: ${sample.ID || sample.Id || 'N/A'}`);
    } else {
      console.log('No rows returned on page 1.');
    }
  } catch (error) {
    console.error('Request error:', error.message || error);
    process.exit(1);
  }
};

main();
