"use client";

import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Composant Alert simple si non disponible
interface AlertProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function Alert({ className = '', children }: AlertProps) {
  return (
    <div className={`p-4 rounded-lg border ${className}`}>
      {children}
    </div>
  );
}

function AlertDescription({ className = '', children }: AlertDescriptionProps) {
  return <div className={`text-sm ${className}`}>{children}</div>;
}

interface ApiErrorProps {
  error: {
    message?: string;
    status?: number;
    code?: string;
    details?: any;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export function ApiErrorHandler({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false 
}: ApiErrorProps) {
  const getErrorType = (status?: number) => {
    if (!status) return 'unknown';
    
    if (status === 401) return 'auth';
    if (status === 403) return 'permission';
    if (status === 404) return 'notFound';
    if (status >= 400 && status < 500) return 'client';
    if (status >= 500) return 'server';
    
    return 'unknown';
  };

  const getErrorMessage = (error: any) => {
    // Messages personnalisés selon le type d'erreur
    const type = getErrorType(error.status);
    
    const messages = {
      auth: 'Votre session a expiré. Veuillez vous reconnecter.',
      permission: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
      notFound: 'La ressource demandée n\'existe pas ou a été supprimée.',
      client: 'La requête est invalide. Veuillez vérifier vos informations.',
      server: 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques instants.',
      unknown: error.message || 'Une erreur est survenue lors de la communication avec le serveur.'
    };

    return messages[type as keyof typeof messages] || messages.unknown;
  };

  const getErrorColor = (type: string) => {
    const colors = {
      auth: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      permission: 'bg-orange-50 border-orange-200 text-orange-800',
      notFound: 'bg-blue-50 border-blue-200 text-blue-800',
      client: 'bg-purple-50 border-purple-200 text-purple-800',
      server: 'bg-red-50 border-red-200 text-red-800',
      unknown: 'bg-slate-50 border-slate-200 text-slate-800'
    };

    return colors[type as keyof typeof colors] || colors.unknown;
  };

  const errorType = getErrorType(error.status);
  const colorClass = getErrorColor(errorType);

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleContactSupport = () => {
    window.location.href = '/support';
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClass}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {errorType === 'auth' && 'Session expirée'}
              {errorType === 'permission' && 'Accès non autorisé'}
              {errorType === 'notFound' && 'Ressource introuvable'}
              {errorType === 'server' && 'Erreur serveur'}
              {errorType === 'client' && 'Erreur de requête'}
              {errorType === 'unknown' && 'Erreur'}
            </h4>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-2 text-sm hover:opacity-70 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
          
          <p className="mt-1 text-sm">
            {getErrorMessage(error)}
          </p>

          {/* Actions selon le type d'erreur */}
          <div className="mt-3 flex flex-wrap gap-2">
            {errorType === 'auth' && (
              <Button size="sm" onClick={handleLoginRedirect}>
                Se reconnecter
              </Button>
            )}
            
            {(errorType === 'server' || errorType === 'unknown') && onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Réessayer
              </Button>
            )}
            
            {errorType === 'permission' && (
              <Button size="sm" variant="outline" onClick={handleContactSupport}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Contacter l'admin
              </Button>
            )}
            
            {errorType === 'notFound' && (
              <Button size="sm" variant="outline" onClick={() => window.history.back()}>
                Retour
              </Button>
            )}
          </div>

          {/* Détails techniques en développement */}
          {showDetails && process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className="text-xs cursor-pointer hover:underline">
                Détails techniques
              </summary>
              <div className="mt-2 p-2 bg-black/5 rounded text-xs font-mono">
                <div>Status: {error.status}</div>
                <div>Code: {error.code}</div>
                <div>Message: {error.message}</div>
                {error.details && (
                  <div>Details: {JSON.stringify(error.details, null, 2)}</div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant pour les erreurs réseau
export function NetworkErrorHandler({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert className="bg-slate-50 border-slate-200">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Impossible de se connecter au serveur. Vérifiez votre connexion internet.
        </span>
        {onRetry && (
          <Button size="sm" variant="ghost" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Hook pour gérer les erreurs API
export function useApiErrorHandler() {
  const [error, setError] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleError = React.useCallback((error: any) => {
    console.error('API Error:', error);
    setError(error);
    setIsLoading(false);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = React.useCallback(async (
    operation: () => Promise<any>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
    }
  ) => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await operation();
      setIsLoading(false);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      handleError(error);
      options?.onError?.(error);
      throw error;
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
}

export default ApiErrorHandler;
