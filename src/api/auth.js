/**
 * Attaches the signed login token to every request sent to the Sama backend.
 *
 * installApiAuth() patches window.fetch and the default axios instance once at
 * startup, so pages keep calling the API exactly as before. The token is only
 * sent to Sama backend hosts, never to Apps Script, RMS, S3 or other sites.
 */
import axios from 'axios';

export const AUTH_TOKEN_KEY = '_SamaToken_';
const AUTH_REQUIRED_HEADER = 'x-sama-auth';
const SESSION_KEYS = ['_AuthSama_', 'isLoggedIn', 'role', AUTH_TOKEN_KEY];

const KNOWN_API_HOSTS = ['sama-api.thesama.in', 'backend.thesama.in'];
const LOCAL_API_PORT = '8000';

const toOrigin = (value) => {
  if (!value || typeof value !== 'string' || value.includes('undefined')) return null;
  try {
    return new URL(value, window.location.href).origin;
  } catch {
    return null;
  }
};

const apiOrigins = (() => {
  const origins = new Set(KNOWN_API_HOSTS.map((host) => `https://${host}`));
  [
    process.env.REACT_APP_UserDetailsApis,
    process.env.REACT_APP_NgoInformationApi,
    process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi,
    process.env.REACT_APP_API_BASE_URL,
  ]
    .map(toOrigin)
    .filter(Boolean)
    .forEach((origin) => origins.add(origin));
  return origins;
})();

const isApiUrl = (url) => {
  try {
    const parsed = new URL(url, window.location.href);
    if (apiOrigins.has(parsed.origin)) return true;
    // Local and IP-based deployments serve the API on port 8000 of the page's host.
    return parsed.port === LOCAL_API_PORT && parsed.hostname === window.location.hostname;
  } catch {
    return false;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Storage can be unavailable (private mode); requests then go without a token.
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
};

const isLoggedIn = () => {
  try {
    return Boolean(localStorage.getItem('isLoggedIn'));
  } catch {
    return false;
  }
};

const currentToken = () => {
  try {
    return isLoggedIn() ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  } catch {
    return null;
  }
};

// The backend marks "session missing or expired" 401s with a header, so a
// wrong password on the login form is never mistaken for an expired session.
const handleSessionRejected = () => {
  SESSION_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
  });
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const installFetch = () => {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    const token = currentToken();
    if (!url || !isApiUrl(url)) {
      return originalFetch(input, init);
    }

    // Signed-in calls are sent as normal CORS requests: no-cors would drop the
    // Authorization header and hide a 401, including for sessions started
    // before tokens existed, which then need to be sent back to /login.
    let nextInit = init;
    if (token || isLoggedIn()) {
      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
      if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
      const requestedMode = init.mode || (input instanceof Request ? input.mode : undefined);
      const mode = requestedMode === 'no-cors' ? 'cors' : init.mode;
      nextInit = { ...init, headers, ...(mode ? { mode } : {}) };
    }

    return originalFetch(input, nextInit).then((response) => {
      if (response.status === 401 && response.headers.get(AUTH_REQUIRED_HEADER)) {
        handleSessionRejected();
      }
      return response;
    });
  };
};

const installAxios = () => {
  axios.interceptors.request.use((config) => {
    const token = currentToken();
    let url = config.url;
    try {
      if (config.baseURL) url = new URL(config.url || '', new URL(config.baseURL, window.location.href)).href;
    } catch {
      return config;
    }
    if (token && url && isApiUrl(url)) {
      config.headers = config.headers || {};
      if (typeof config.headers.set === 'function') {
        if (!config.headers.has('Authorization')) config.headers.set('Authorization', `Bearer ${token}`);
      } else if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const response = error?.response;
      if (response?.status === 401 && response.headers?.[AUTH_REQUIRED_HEADER]) {
        handleSessionRejected();
      }
      return Promise.reject(error);
    }
  );
};

let installed = false;

export const installApiAuth = () => {
  if (installed || typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  installed = true;
  installFetch();
  installAxios();
};
