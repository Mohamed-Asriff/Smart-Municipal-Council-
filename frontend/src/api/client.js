// ============================================================================
// KMC — Central fetch wrapper (auth, timeout, error normalisation, 401 handling)
// ============================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const AI_BASE  = import.meta.env.VITE_AI_BASE_URL  || '/ai-api';
const DEFAULT_TIMEOUT = 20000;

export const TOKEN_KEY = 'kmc_auth_token';
export const USER_KEY  = 'kmc_user';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function emitUnauthorized() {
  window.dispatchEvent(new CustomEvent('kmc:unauthorized'));
}

/**
 * @param {string} path
 * @param {object} [opts]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [opts.method]
 * @param {object|FormData} [opts.body]
 * @param {boolean} [opts.ai]      route to FastAPI base
 * @param {boolean} [opts.public]  skip auth header
 * @param {number}  [opts.timeout]
 * @param {object}  [opts.query]
 */
export async function request(path, opts = {}) {
  const {
    method = 'GET',
    body,
    ai = false,
    public: isPublic = false,
    timeout = DEFAULT_TIMEOUT,
    query,
  } = opts;

  const base = ai ? AI_BASE : API_BASE;
  const qs = query
    ? '?' + new URLSearchParams(
        Object.entries(query).filter(([, v]) => v != null)
      ).toString()
    : '';
  const url = `${base}${path}${qs}`;

  const headers = {};
  const isFormData = body instanceof FormData;
  if (!isFormData && body != null) headers['Content-Type'] = 'application/json';
  if (!isPublic) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body == null ? undefined : isFormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new ApiError('Request timed out', 0, null);
    throw new ApiError('Network error — cannot reach server', 0, null);
  }
  clearTimeout(timer);

  if (res.status === 401 && !isPublic) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    emitUnauthorized();
    throw new ApiError('Session expired. Please sign in again.', 401, null);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let payload = null;
  if (res.status !== 204) {
    try { payload = isJson ? await res.json() : await res.text(); }
    catch { payload = null; }
  }

  if (!res.ok) {
    const msg =
      (payload && (payload.error || payload.message || payload.detail)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload;
}

export const get   = (p, o) => request(p, { ...o, method: 'GET' });
export const post  = (p, b, o) => request(p, { ...o, method: 'POST', body: b });
export const put   = (p, b, o) => request(p, { ...o, method: 'PUT', body: b });
export const patch = (p, b, o) => request(p, { ...o, method: 'PATCH', body: b });
export const del   = (p, o) => request(p, { ...o, method: 'DELETE' });
