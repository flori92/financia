export type Query = Record<string, string | number | boolean | undefined | null>;

// Import pour les alertes permissions
let showPermissionAlertCallback: ((feature?: string, requiredRole?: string) => void) | null = null;

export function setPermissionAlertCallback(callback: (feature?: string, requiredRole?: string) => void) {
  showPermissionAlertCallback = callback;
}

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

function handleAuthError(status: number, path?: string) {
  if (status === 401) {
    console.debug(`[AUTH] Erreur d'authentification ${status} - Redirection vers login`);
    // Clear auth data
    if (typeof window !== 'undefined') {
      console.log('[AUTH] Nettoyage des données d\'authentification...');
      window.localStorage.removeItem('bms_token');
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user_data');
      window.localStorage.removeItem('user_email');
      window.localStorage.removeItem('user_role');
      window.localStorage.removeItem('user_profile');

      // Redirect to login
      console.log('[AUTH] Redirection vers /login...');
      window.location.href = '/login';
    }
  }

  if (status === 403) {
    console.debug(`[PERM] Erreur de permissions 403 sur ${path || 'endpoint inconnu'}`);
    // Afficher une popup claire pour les permissions manquantes
    if (showPermissionAlertCallback && typeof window !== 'undefined') {
      const featureName = getFeatureNameFromPath(path);
      const requiredRole = getRequiredRoleFromPath(path);
      showPermissionAlertCallback(featureName, requiredRole);
    }
  }
}

function getFeatureNameFromPath(path?: string): string {
  if (!path) return 'cette fonctionnalité';
  
  const mapping: Record<string, string> = {
    '/api/v1/banking/transactions': 'Transactions bancaires',
    '/api/v1/accounting': 'Comptabilité',
    '/api/v1/invoices': 'Facturation',
    '/api/v1/payroll': 'Paie',
    '/api/v1/hr': 'Ressources Humaines',
    '/api/v1/treasury': 'Trésorerie',
    '/api/v1/tax': 'Fiscalité',
    '/api/v1/crm': 'CRM',
    '/api/v1/budget': 'Budget',
    '/api/v1/support': 'Support',
  };

  for (const [key, value] of Object.entries(mapping)) {
    if (path.startsWith(key)) return value;
  }
  
  return 'cette fonctionnalité';
}

function getRequiredRoleFromPath(path?: string): string {
  if (!path) return 'permissions appropriées';
  
  const mapping: Record<string, string> = {
    '/api/v1/banking/transactions': 'Expert comptable, Comptable ou Admin',
    '/api/v1/accounting': 'Expert comptable ou Comptable',
    '/api/v1/invoices': 'Admin ou Comptable',
    '/api/v1/payroll': 'RH Manager ou Admin',
    '/api/v1/hr': 'RH Manager ou Admin',
    '/api/v1/treasury': 'Expert comptable ou Admin',
    '/api/v1/tax': 'Expert comptable ou Admin',
    '/api/v1/crm': 'Manager ou Admin',
    '/api/v1/budget': 'Manager ou Admin',
    '/api/v1/support': 'Admin',
  };

  for (const [key, value] of Object.entries(mapping)) {
    if (path.startsWith(key)) return value;
  }
  
  return 'permissions appropriées';
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
  if (!res.ok) {
    handleAuthError(res.status, path);
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

declare const process: any;

export function getBaseUrl() {
  const env = typeof window === 'undefined' ? (typeof process !== 'undefined' ? process.env : {}) : {};
  return (env as any).NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
}

function getToken() {
  const env = typeof window === 'undefined' ? (typeof process !== 'undefined' ? process.env : {}) : {};
  if ((env as any).NEXT_PUBLIC_API_TOKEN) return (env as any).NEXT_PUBLIC_API_TOKEN;
  if (typeof window !== 'undefined') {
    const t = window.localStorage.getItem('bms_token') || window.localStorage.getItem('token') || '';
    if (t) {
      console.log('[TOKEN] Token trouvé:', t.substring(0, 20) + '...');
    } else {
      console.warn('[TOKEN] Aucun token trouvé dans localStorage');
    }
    return t || undefined;
  }
  return undefined;
}

export function getCompanyId() {
  const env = typeof window === 'undefined' ? (typeof process !== 'undefined' ? process.env : {}) : {};
  if ((env as any).NEXT_PUBLIC_COMPANY_ID) {
    const cid = (env as any).NEXT_PUBLIC_COMPANY_ID as string;
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
  console.log(`[API] GET ${path}`, token ? '(avec token)' : '(sans token)');
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...init,
  } as RequestInit);
  if (!res.ok) {
    console.debug(`[API] Erreur ${res.status} sur GET ${path}`);
    handleAuthError(res.status, path);
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
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
  if (!res.ok) {
    handleAuthError(res.status, path);
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function apiPut(path: string, body: any, params?: Query, init?: RequestInit) {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = `${base}${path}${buildQuery(params)}`;
  const token = getToken();
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    ...init,
  } as RequestInit);
  if (!res.ok) {
    handleAuthError(res.status, path);
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
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
  if (!res.ok) {
    handleAuthError(res.status, path);
    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}
