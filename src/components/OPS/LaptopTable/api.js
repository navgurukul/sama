import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi;
const MEMORY_CACHE = new Map();
const IN_FLIGHT_REQUESTS = new Map();
const CACHE_PREFIX = 'laptopApiCache:';

const safeReadSessionCache = (cacheKey) => {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
      return null;
    }
    return parsed.value;
  } catch (error) {
    return null;
  }
};

const safeWriteSessionCache = (cacheKey, value, ttlMs) => {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify({
      value,
      expiresAt: Date.now() + ttlMs,
    }));
  } catch (error) {
    // Ignore quota and serialization failures.
  }
};

const clearLaptopClientCache = () => {
  MEMORY_CACHE.clear();
  IN_FLIGHT_REQUESTS.clear();
  try {
    const keysToDelete = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    // Ignore sessionStorage access failures.
  }
};

const buildLaptopQuery = (options) => {
  const params = new URLSearchParams({ type: 'getLaptopData' });

  if (options?.idQuery) params.set('idQuery', options.idQuery);
  if (options?.macQuery) params.set('macQuery', options.macQuery);
  if (options?.assignQuery) params.set('assignQuery', options.assignQuery);
  if (options?.workingFilter) params.set('workingFilter', options.workingFilter);
  if (options?.statusFilter) params.set('statusFilter', options.statusFilter);
  if (options?.majorIssueFilter) params.set('majorIssueFilter', options.majorIssueFilter);
  if (options?.minorIssueFilter) params.set('minorIssueFilter', options.minorIssueFilter);
  if (options?.allocatedToFilter) params.set('allocatedToFilter', options.allocatedToFilter);
  if (Number.isFinite(options?.page)) params.set('page', String(options.page));
  if (Number.isFinite(options?.limit)) params.set('limit', String(options.limit));
  if (options?.includeMeta) params.set('includeMeta', '1');
  if (options?.includeBarcode === true) params.set('includeBarcode', '1');
  if (options?.includeBarcode === false) params.set('includeBarcode', '0');
  if (Array.isArray(options?.fields) && options.fields.length > 0) {
    params.set('fields', options.fields.join(','));
  }

  return params.toString();
};

export const fetchLaptopData = async (options = null) => {
  const shouldBypassCache = options?.noCache === true;
  const ttlMs = Number.isFinite(options?.cacheTtlMs)
    ? options.cacheTtlMs
    : 120000;

  try {
    const query = buildLaptopQuery(options);
    const requestUrl = `${API_BASE_URL}?${query}`;

    if (!shouldBypassCache) {
      const memoryHit = MEMORY_CACHE.get(query);
      if (memoryHit && Date.now() < memoryHit.expiresAt) {
        return memoryHit.value;
      }

      const sessionHit = safeReadSessionCache(query);
      if (sessionHit) {
        MEMORY_CACHE.set(query, { value: sessionHit, expiresAt: Date.now() + ttlMs });
        return sessionHit;
      }

      const inFlight = IN_FLIGHT_REQUESTS.get(query);
      if (inFlight) {
        return inFlight;
      }
    }

    console.info('[LaptopAPI] GET', requestUrl);
    const requestPromise = (async () => {
      const response = await fetch(requestUrl);
      const json = await response.json();
      if (!shouldBypassCache) {
        MEMORY_CACHE.set(query, { value: json, expiresAt: Date.now() + ttlMs });
        safeWriteSessionCache(query, json, ttlMs);
      }
      return json;
    })();

    if (!shouldBypassCache) {
      IN_FLIGHT_REQUESTS.set(query, requestPromise);
    }

    return await requestPromise;
  } catch (error) {
    console.error('Error fetching laptop data:', error);
    throw error;
  } finally {
    if (!shouldBypassCache) {
      const query = buildLaptopQuery(options);
      IN_FLIGHT_REQUESTS.delete(query);
    }
  }
};

export const updateLaptopData = async (payload) => {
  try {
    await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });
    clearLaptopClientCache();
    return true;
  } catch (error) {
    console.error('Error updating laptop data:', error);
    throw error;
  }
};