/**
 * API v2.0 - Client moderne et professionnel
 * Remplace l'ancien api.ts avec gestion robuste des erreurs
 */

import { apiClient } from './api-client';

// Types réutilisables
export type Query = Record<string, string | number | boolean | undefined | null>;

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
};

export type { ApiResponse };

function buildQuery(params?: Query): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Fonctions wrapper avec compatibilité ascendante
export async function apiGet<T = any>(path: string, params?: Query, init?: RequestInit): Promise<T> {
  try {
    const response = await apiClient.get<T>(`${path}${buildQuery(params)}`, undefined, {
      headers: init?.headers as Record<string, string> || {},
      timeout: 30000
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur API');
    }
    
    return response.data as T;
  } catch (error) {
    console.error(`API GET ${path} error:`, error);
    throw error;
  }
}

export async function apiPost<T = any>(path: string, body: any, params?: Query, init?: RequestInit): Promise<T> {
  try {
    const response = await apiClient.post<T>(`${path}${buildQuery(params)}`, body, {
      headers: init?.headers as Record<string, string> || {},
      timeout: 30000
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur API');
    }
    
    return response.data as T;
  } catch (error) {
    console.error(`API POST ${path} error:`, error);
    throw error;
  }
}

export async function apiPut<T = any>(path: string, body: any, params?: Query, init?: RequestInit): Promise<T> {
  try {
    const response = await apiClient.put<T>(`${path}${buildQuery(params)}`, body, {
      headers: init?.headers as Record<string, string> || {},
      timeout: 30000
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur API');
    }
    
    return response.data as T;
  } catch (error) {
    console.error(`API PUT ${path} error:`, error);
    throw error;
  }
}

export async function apiPatch<T = any>(path: string, body: any, params?: Query, init?: RequestInit): Promise<T> {
  try {
    const response = await apiClient.patch<T>(`${path}${buildQuery(params)}`, body, {
      headers: init?.headers as Record<string, string> || {},
      timeout: 30000
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur API');
    }
    
    return response.data as T;
  } catch (error) {
    console.error(`API PATCH ${path} error:`, error);
    throw error;
  }
}

export async function apiDelete<T = any>(path: string, params?: Query, init?: RequestInit): Promise<T> {
  try {
    const response = await apiClient.delete<T>(`${path}${buildQuery(params)}`, {
      headers: init?.headers as Record<string, string> || {},
      timeout: 30000
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur API');
    }
    
    return response.data as T;
  } catch (error) {
    console.error(`API DELETE ${path} error:`, error);
    throw error;
  }
}

// Upload de fichiers
export async function apiUpload<T = any>(path: string, file: File, options?: {
  onProgress?: (progress: number) => void;
  field?: string;
  metadata?: Record<string, any>;
}): Promise<T> {
  try {
    const response = await apiClient.upload<T>(path, file, options);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur upload');
    }
    
    return response.data as T;
  } catch (error) {
    console.error(`API Upload ${path} error:`, error);
    throw error;
  }
}

// Fonction de fallback pour compatibilité
export async function apiGetWithFallback<T = any>(paths: string[], params?: Query): Promise<T> {
  let lastError: any;
  
  for (const path of paths) {
    try {
      return await apiGet<T>(path, params);
    } catch (error) {
      lastError = error;
      console.warn(`Fallback: ${path} failed, trying next...`);
    }
  }
  
  throw lastError;
}

// Utilitaires
export function getBaseUrl(): string {
  return apiClient.getBaseUrl();
}

export function getCompanyId(): string {
  // Pour le dashboard demo, utiliser un companyId fixe
  const demoCompanyId = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
  
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('companyId');
      if (stored) return stored;
      // Stocker le companyId de demo par défaut
      window.localStorage.setItem('companyId', demoCompanyId);
      return demoCompanyId;
    } catch {
      // Ignorer les erreurs localStorage
    }
  }
  
  return demoCompanyId;
}

// Export du client avancé pour usage direct
export { apiClient };
export default apiGet;
