/**
 * Hook pour les appels API avec gestion d'erreurs intégrée
 * Résout les problèmes 401 et standardise la gestion des erreurs
 */

import React, { useState, useCallback, useRef } from 'react';
import { apiClient, type ApiResponse } from '@/lib/api-client';
import { authManager } from '@/lib/auth-manager';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  retryAttempts?: number;
  retryDelay?: number;
  showToast?: boolean;
}

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: any;
  isSuccess: boolean;
  isError: boolean;
}

export function useApiWithErrorHandling<T = any>(options: UseApiOptions = {}) {
  const {
    onSuccess,
    onError,
    retryAttempts = 1,
    retryDelay = 1000,
    showToast = true
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false
  });

  const retryCountRef = useRef(0);
  const operationRef = useRef<(() => Promise<any>) | null>(null);

  const resetState = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
    retryCountRef.current = 0;
  }, []);

  const execute = useCallback(async (
    operation: () => Promise<ApiResponse<T>>,
    customOptions?: UseApiOptions
  ) => {
    const mergedOptions = { ...options, ...customOptions };
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false
    }));

    operationRef.current = operation;

    try {
      const response = await operation();
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Erreur API');
      }

      setState({
        data: response.data,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false
      });

      retryCountRef.current = 0;
      mergedOptions.onSuccess?.(response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Gérer les erreurs 401 (authentification)
      if (error.status === 401) {
        // Tenter de rafraîchir le token
        try {
          await (authManager as any).refreshTokenIfNeeded();
          // Réessayer avec le nouveau token
          if (retryCountRef.current < retryAttempts) {
            retryCountRef.current++;
            setTimeout(() => {
              execute(operation, mergedOptions);
            }, retryDelay);
            return;
          }
        } catch (refreshError) {
          // Le refresh a échoué, déconnecter l'utilisateur
          await authManager.logout();
        }
      }

      // Gérer les erreurs 403 (permissions)
      if (error.status === 403) {
        error.message = 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      }

      // Gérer les erreurs 404 (ressource non trouvée)
      if (error.status === 404) {
        error.message = 'La ressource demandée n\'existe pas.';
      }

      // Gérer les erreurs de serveur
      if (error.status >= 500) {
        error.message = 'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.';
        
        // Réessayer automatiquement pour les erreurs de serveur
        if (retryCountRef.current < retryAttempts) {
          retryCountRef.current++;
          setTimeout(() => {
            execute(operation, mergedOptions);
          }, retryDelay * retryCountRef.current); // Délai progressif
          return;
        }
      }

      setState({
        data: null,
        isLoading: false,
        error,
        isSuccess: false,
        isError: true
      });

      mergedOptions.onError?.(error);
      
      // Afficher une notification (optionnel)
      if (showToast) {
        // Implémenter un système de toast ici
        console.error('Toast error:', error.message);
      }
      
      throw error;
    }
  }, [options, retryAttempts, retryDelay, showToast]);

  // Méthodes pratiques
  const get = useCallback((
    path: string, 
    params?: Record<string, any>, 
    customOptions?: UseApiOptions
  ) => {
    return execute(() => apiClient.get<T>(path, params), customOptions);
  }, [execute]);

  const post = useCallback((
    path: string, 
    body?: any, 
    customOptions?: UseApiOptions
  ) => {
    return execute(() => apiClient.post<T>(path, body), customOptions);
  }, [execute]);

  const put = useCallback((
    path: string, 
    body?: any, 
    customOptions?: UseApiOptions
  ) => {
    return execute(() => apiClient.put<T>(path, body), customOptions);
  }, [execute]);

  const patch = useCallback((
    path: string, 
    body?: any, 
    customOptions?: UseApiOptions
  ) => {
    return execute(() => apiClient.patch<T>(path, body), customOptions);
  }, [execute]);

  const del = useCallback((
    path: string, 
    customOptions?: UseApiOptions
  ) => {
    return execute(() => apiClient.delete<T>(path), customOptions);
  }, [execute]);

  // Réessayer la dernière opération
  const retry = useCallback(() => {
    if (operationRef.current) {
      execute(operationRef.current, options);
    }
  }, [execute, options]);

  return {
    ...state,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    resetState,
    retry
  };
}

// Hook spécialisé pour les requêtes de données (GET)
export function useQuery<T = any>(
  queryFn: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const api = useApiWithErrorHandling<T>(options);

  React.useEffect(() => {
    api.execute(async () => {
      const result = await queryFn();
      return {
        success: true,
        data: result,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'query_' + Date.now(),
          version: '3.0.0'
        }
      } as ApiResponse<T>;
    });
  }, dependencies);

  return api;
}

// Hook spécialisé pour les mutations (POST/PUT/PATCH/DELETE)
export function useMutation<T = any>(options: UseApiOptions = {}) {
  const api = useApiWithErrorHandling<T>(options);
  const [isMutating, setIsMutating] = React.useState(false);

  const mutate = React.useCallback(async (
    mutationFn: () => Promise<T>,
    customOptions?: UseApiOptions
  ) => {
    setIsMutating(true);
    try {
      const result = await api.execute(async () => {
        const data = await mutationFn();
        return {
          success: true,
          data,
          error: null,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: 'mutation_' + Date.now(),
            version: '3.0.0'
          }
        } as ApiResponse<T>;
      }, customOptions);
      return result;
    } finally {
      setIsMutating(false);
    }
  }, [api]);

  return {
    ...api,
    mutate,
    isMutating
  };
}

export default useApiWithErrorHandling;
