const TOKEN_KEY = 'auth_token';

const BASE_URL =
  (import.meta as any)?.env?.VITE_BACKEND_URL ||
  (process as any)?.env?.REACT_APP_BACKEND_URL ||
  (typeof window !== 'undefined' ? (window as any).REACT_APP_BACKEND_URL : null) ||
  '';

function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(t: string) {
  try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
}
function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  auth?: boolean;
};

async function rawFetch(path: string, opts: FetchOptions = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers || {}) };

  if (opts.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...opts, headers, credentials: 'include' });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => ({})) : await res.text();

  return { res, body, isJson };
}

async function http(path: string, opts: FetchOptions = {}) {
  // 1º intento
  let { res, body, isJson } = await rawFetch(path, opts);

  if (res.status === 401 || res.status === 403) {
    // Intento de refresh: si hay cookie 'rt' válida el backend devolverá nuevo token
    const refresh = await rawFetch('/auth/refresh', { method: 'POST' });
    if (refresh.res.ok && refresh.body?.token) {
      setToken(refresh.body.token);
      // Reintentar request original con nuevo token
      ({ res, body, isJson } = await rawFetch(path, opts));
    } else {
      clearToken();
      if (typeof window !== 'undefined') {
        const loginUrl = '/login';
        const from = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace(`${loginUrl}?from=${from}`);
      }
      const err: any = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
  }

  if (!res.ok) {
    const message = (isJson && (body?.error || body?.message)) || res.statusText || 'HTTP error';
    const err: any = new Error(message);
    err.status = res.status;
    err.payload = body;
    throw err;
  }

  return body;
}

export const api = {
  get: (path: string, auth = true) => http(path, { method: 'GET', auth }),
  post: (path: string, data?: any, auth = true) => http(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined, auth }),
  put: (path: string, data?: any, auth = true) => http(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined, auth }),
  del: (path: string, auth = true) => http(path, { method: 'DELETE', auth }),

  me: () => http('/me', { method: 'GET', auth: true }),
  profile: () => http('/profile', { method: 'GET', auth: false }),
  health: () => http('/health', { method: 'GET', auth: false }),
  ready: () => http('/ready', { method: 'GET', auth: false }),
  version: () => http('/version', { method: 'GET', auth: false }),
};

export default api;
