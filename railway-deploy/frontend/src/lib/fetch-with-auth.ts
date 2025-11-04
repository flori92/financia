/**
 * Utilitaire fetch avec authentification automatique
 * Utilise localStorage pour récupérer le token JWT
 */

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Récupérer le token depuis localStorage
  const token = typeof window !== 'undefined' 
    ? window.localStorage.getItem('bms_token') 
    : null;

  // Construire les headers avec authentification
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Ajouter Authorization header si token disponible
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Fusionner les options avec les headers
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, fetchOptions);
}

/**
 * Version simplifiée pour les requêtes GET
 */
export async function fetchGetWithAuth(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'GET' });
}

/**
 * Version simplifiée pour les requêtes POST
 */
export async function fetchPostWithAuth(url: string, body: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/**
 * Version simplifiée pour les requêtes PUT
 */
export async function fetchPutWithAuth(url: string, body: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/**
 * Version simplifiée pour les requêtes DELETE
 */
export async function fetchDeleteWithAuth(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'DELETE' });
}
