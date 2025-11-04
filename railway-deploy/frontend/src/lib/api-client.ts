/**
 * Client API professionnel avec gestion d'erreurs avancée
 * Résout les problèmes 401 et standardise les réponses
 */

import { authManager, AuthTokens } from './auth-manager';

export interface ApiResponse<T = any> {
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
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000;

  constructor() {
    // Forcer l'URL backend directe (pas de proxy)
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      timeout?: number;
      skipAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { body, params, headers = {}, timeout = this.defaultTimeout, skipAuth = false } = options;
    
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();
    
    try {
      // Construire l'URL
      const url = new URL(`${this.baseUrl}${path}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      // Préparer les headers
      const requestHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Client-Version': '3.0.0',
        'X-Client-Timestamp': timestamp,
        ...headers
      };

      // Ajouter l'authentification si nécessaire
      if (!skipAuth) {
        const authHeaders = authManager.getAuthHeaders();
        Object.assign(requestHeaders, authHeaders);
      }

      // Configuration de la requête
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Gérer les réponses
      if (!response.ok) {
        await this.handleHttpError(response, requestId);
      }

      const data = await response.json();
      
      // Normaliser la réponse
      return this.normalizeResponse(data, requestId, timestamp);
      
    } catch (error) {
      throw this.enhanceError(error, requestId);
    }
  }

  private async handleHttpError(response: Response, requestId: string): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Si la réponse n'est pas du JSON
    }

    const error: ApiError = new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
    
    error.status = response.status;
    error.code = errorData.code || `HTTP_${response.status}`;
    error.details = errorData.details;

    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      if (authManager.isAuthenticated()) {
        // Token invalide, tentative de rafraîchissement
        try {
          await authManager['refreshTokenIfNeeded']();
          // Relancer la requête (implémentation à suivre)
        } catch {
          await authManager.logout();
        }
      }
      throw error;
    }

    // Gérer les erreurs de permissions
    if (response.status === 403) {
      error.message = 'Accès non autorisé';
      throw error;
    }

    // Gérer les erreurs de ressources
    if (response.status === 404) {
      error.message = 'Ressource introuvable';
      throw error;
    }

    // Gérer les erreurs de serveur
    if (response.status >= 500) {
      error.message = 'Erreur serveur temporaire';
      throw error;
    }

    throw error;
  }

  private normalizeResponse<T>(data: any, requestId: string, timestamp: string): ApiResponse<T> {
    // Si la réponse est déjà au format standard
    if (data && typeof data === 'object' && 'success' in data) {
      return {
        ...data,
        meta: {
          timestamp,
          requestId,
          version: '3.0.0',
          ...data.meta
        }
      };
    }

    // Normaliser les réponses non standardisées
    return {
      success: true,
      data,
      meta: {
        timestamp,
        requestId,
        version: '3.0.0'
      }
    };
  }

  private enhanceError(error: any, requestId: string): ApiError {
    if (error instanceof Error) {
      const enhanced: ApiError = error;
      if (!enhanced.code) {
        enhanced.code = 'UNKNOWN_ERROR';
      }
      return enhanced;
    }

    const enhanced: ApiError = new Error(error?.message || 'Erreur inconnue');
    enhanced.code = error?.code || 'UNKNOWN_ERROR';
    enhanced.details = error?.details;
    return enhanced;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Méthodes HTTP pratiques
  async get<T>(path: string, params?: Record<string, any>, options?: Omit<Parameters<typeof this.request>[2], 'method' | 'body' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, { ...options, params });
  }

  async post<T>(path: string, body?: any, options?: Omit<Parameters<typeof this.request>[2], 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { ...options, body });
  }

  async put<T>(path: string, body?: any, options?: Omit<Parameters<typeof this.request>[2], 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  async patch<T>(path: string, body?: any, options?: Omit<Parameters<typeof this.request>[2], 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  async delete<T>(path: string, options?: Omit<Parameters<typeof this.request>[2], 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }

  // Upload de fichiers
  async upload<T>(path: string, file: File, options?: {
    onProgress?: (progress: number) => void;
    field?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(options?.field || 'file', file);
    
    if (options?.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          ...authManager.getAuthHeaders(),
          'X-Request-ID': requestId,
          'X-Client-Version': '3.0.0',
          'X-Client-Timestamp': timestamp,
        },
        body: formData
      });

      if (!response.ok) {
        await this.handleHttpError(response, requestId);
      }

      const data = await response.json();
      return this.normalizeResponse(data, requestId, timestamp);
      
    } catch (error) {
      throw this.enhanceError(error, requestId);
    }
  }

  // Méthodes utilitaires
  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Exporter une instance singleton
export const apiClient = new ApiClient();
export default apiClient;
