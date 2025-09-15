// Cliente minimalista centralizado con Bearer automático.
// Usa el mismo TOKEN_KEY que tu AuthCallback.tsx / core/session.ts.
const TOKEN_KEY = 'auth_token';

const BASE_URL =
  (import.meta as any)?.env?.VITE_BACKEND_URL ||
  (process as any)?.env?.REACT_APP_BACKEND_URL ||
  (typeof window !== 'undefined' ? (window as any).REACT_APP_BACKEND_URL : null) ||
  '';

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  auth?: boolean; // si true, inyecta Authorization: Bearer
};

async function http(path: string, opts: FetchOptions = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  if (opts.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...opts, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = (isJson && (body?.error || body?.message)) || res.statusText;
    const err: any = new Error(message || 'HTTP error');
    err.status = res.status;
    err.payload = body;
    throw err;
  }

  return body;
}

export const api = {
  get: (path: string, auth = true) => http(path, { method: 'GET', auth }),
  post: (path: string, data?: any, auth = true) =>
    http(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined, auth }),
  put: (path: string, data?: any, auth = true) =>
    http(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined, auth }),
  del: (path: string, auth = true) => http(path, { method: 'DELETE', auth }),

  // helpers de dominio
  me: () => http('/me', { method: 'GET', auth: true }),
  profile: () => http('/profile', { method: 'GET', auth: false }),
  health: () => http('/health', { method: 'GET', auth: false }),
  version: () => http('/version', { method: 'GET', auth: false }),
};

export default api;
