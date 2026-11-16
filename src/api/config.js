/**
 * Resolves the Sama backend URL for an endpoint.
 *
 * Uses the REACT_APP_* URL when it is set. A build that points at
 * localhost:8000 but is served from another host (an EC2 IP, for example)
 * calls port 8000 on that host instead. Without a configured URL it falls back
 * to localhost in development, port 8000 on IP hosts, and backend.thesama.in.
 */
const trimLeadingSlashes = (endpoint) => endpoint.replace(/^\/+/, '');

export const resolveApiUrl = (envUrl, endpoint) => {
  const path = trimLeadingSlashes(endpoint);
  if (envUrl && typeof envUrl === 'string' && !envUrl.includes('undefined')) {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      envUrl.includes('localhost:8000')
    ) {
      return `${window.location.protocol}//${window.location.hostname}:8000/${path}`;
    }
    return envUrl;
  }
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:8000/${path}`;
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `${window.location.protocol}//${hostname}:8000/${path}`;
    }
    return `https://backend.thesama.in/${path}`;
  }
  return `http://localhost:8000/${path}`;
};
