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
  // SOLUTION FORTE : Forcer l'URL backend en production
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
  
  // Debug log
  if (typeof window !== 'undefined') {
    console.log('🔗 API Base URL:', backendUrl);
  }
  
  return backendUrl;
}

function getToken() {
  // Next.js injecte NEXT_PUBLIC_* au build time
  if (process.env.NEXT_PUBLIC_API_TOKEN) return process.env.NEXT_PUBLIC_API_TOKEN;
  if (typeof window !== 'undefined') {
    const t = window.localStorage.getItem('bms_token') || window.localStorage.getItem('token') || '';
    return t || undefined;
  }
  return undefined;
}

export function getCompanyId() {
  // Pour le dashboard demo, utiliser un companyId fixe
  const demoCompanyId = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
  
  // Next.js injecte NEXT_PUBLIC_* au build time
  if (process.env.NEXT_PUBLIC_COMPANY_ID) {
    const cid = process.env.NEXT_PUBLIC_COMPANY_ID;
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('companyId', cid); } catch {}
    }
    return cid;
  }
  if (typeof window !== 'undefined') {
    try { 
      const stored = window.localStorage.getItem('companyId');
      if (stored) return stored;
      // Stocker le companyId de demo par défaut
      window.localStorage.setItem('companyId', demoCompanyId);
      return demoCompanyId;
    } catch {}
  }
  return demoCompanyId;
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
