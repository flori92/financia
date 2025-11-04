export type Query = Record<string, string | number | boolean | undefined | null>;

function buildQuery(params?: Query) {
  const p = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export async function apiDelete(path: string, params?: Query, init?: RequestInit) {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = `${base}${path}${buildQuery(params)}`;
  const token = getToken();
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...init,
  } as RequestInit);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export function getBaseUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'https://bms-production-d9e9.up.railway.app';
}

function getToken() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_TOKEN) return process.env.NEXT_PUBLIC_API_TOKEN;
  if (typeof window !== 'undefined') {
    const t = window.localStorage.getItem('bms_token') || window.localStorage.getItem('token') || '';
    return t || undefined;
  }
  return undefined;
}

export function getCompanyId() {
  if (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_COMPANY_ID) {
    const cid = (process as any).env.NEXT_PUBLIC_COMPANY_ID as string;
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('companyId', cid); } catch {}
    }
    return cid;
  }
  if (typeof window !== 'undefined') return window.localStorage.getItem('companyId') || undefined;
  return undefined;
}

export async function apiGet(path: string, params?: Query, init?: RequestInit) {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = `${base}${path}${buildQuery(params)}`;
  const token = getToken();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...init,
  } as RequestInit);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function apiGetWithFallback(paths: string[], params?: Query) {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await apiGet(p, params);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function apiPost(path: string, body: any, params?: Query, init?: RequestInit) {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = `${base}${path}${buildQuery(params)}`;
  const token = getToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    ...init,
  } as RequestInit);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function apiPatch(path: string, body: any, params?: Query, init?: RequestInit) {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = `${base}${path}${buildQuery(params)}`;
  const token = getToken();
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    ...init,
  } as RequestInit);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}
