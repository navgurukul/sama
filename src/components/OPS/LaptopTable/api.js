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

const parseApiError = async (response) => {
  let detail = `HTTP ${response.status}`;
  try {
    const payload = await response.json();
    if (payload?.detail) {
      detail = typeof payload.detail === 'string' ? payload.detail : JSON.stringify(payload.detail);
    } else {
      detail = JSON.stringify(payload);
    }
  } catch (error) {
    // ignore parse failures and keep fallback detail
  }
  throw new Error(detail);
};

const execGet = async (queryParams) => {
  const params = new URLSearchParams(queryParams);
  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    await parseApiError(response);
  }
  return response.json();
};

const execPost = async (payload) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await parseApiError(response);
  }
  return response.json();
};

const buildEvidenceUploadUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }
  if (API_BASE_URL.endsWith('/exec')) {
    return API_BASE_URL.replace(/\/exec$/, '/evidence-upload');
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/evidence-upload`;
};

export const fetchStageTemplate = async ({ stageId = null, stageCode = null } = {}) => {
  const params = { type: 'getStageTemplate' };
  if (stageId !== null && stageId !== undefined) params.stageId = String(stageId);
  if (stageCode) params.stageCode = stageCode;
  return execGet(params);
};

export const fetchStageMap = async ({ includeInactive = false } = {}) => {
  const params = { type: 'getStageMap' };
  if (includeInactive) params.includeInactive = '1';
  return execGet(params);
};

export const fetchLaptopStageRuns = async (laptopId) => {
  return execGet({ type: 'getLaptopStageRuns', laptopId });
};

export const fetchStageRunResponses = async (runId) => {
  return execGet({ type: 'getStageRunResponses', runId: String(runId) });
};

export const fetchStageGateLogs = async ({ runId = null, laptopId = null } = {}) => {
  const params = { type: 'getStageGateLogs' };
  if (runId !== null && runId !== undefined) params.runId = String(runId);
  if (laptopId) params.laptopId = String(laptopId);
  return execGet(params);
};

export const startStageRun = async ({ laptopId, stageId, stageCode, startedBy, notes }) => {
  return execPost({
    type: 'startStageRun',
    laptopId,
    stageId,
    stageCode,
    startedBy,
    notes,
  });
};

export const submitChecklistResponses = async ({ runId, responses, respondedBy }) => {
  return execPost({
    type: 'submitChecklistResponses',
    runId,
    responses,
    respondedBy,
  });
};

export const evaluateStageRun = async (runId) => {
  return execPost({
    type: 'evaluateStageRun',
    runId,
  });
};

export const completeStageRun = async ({ runId, completedBy, verifierName, notes }) => {
  return execPost({
    type: 'completeStageRun',
    runId,
    completedBy,
    verifierName,
    notes,
  });
};

export const uploadEvidenceFile = async (file) => {
  if (!file) {
    throw new Error('file is required');
  }
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(buildEvidenceUploadUrl(), {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    await parseApiError(response);
  }
  return response.json();
};