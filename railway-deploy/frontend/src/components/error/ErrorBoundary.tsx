"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Logger l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Envoyer à un service de monitoring (optionnel)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En production, envoyer à un service comme Sentry
    if (process.env.NODE_ENV === 'production') {
      // Ex: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback personnalisé
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              {/* Icône d'erreur */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h1 className="text-xl font-semibold text-slate-900 mb-2">
                Une erreur est survenue
              </h1>
              
              <p className="text-slate-600 mb-6">
                L'application a rencontré une erreur inattendue. 
                {process.env.NODE_ENV === 'development' && ' Vérifiez la console pour plus de détails.'}
              </p>

              {/* Détails de l'erreur en développement */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                    Détails techniques
                  </summary>
                  <div className="mt-2 p-3 bg-slate-100 rounded text-xs font-mono text-slate-700 overflow-auto max-h-32">
                    <div className="font-semibold mb-1">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    <div className="font-semibold mb-1">Stack:</div>
                    <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                    {this.state.errorInfo && (
                      <>
                        <div className="font-semibold mb-1 mt-2">Component Stack:</div>
                        <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  Réessayer
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReload}
                  className="w-full"
                >
                  Recharger la page
                </Button>
              </div>

              {/* Actions additionnelles */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.history.back()}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    ← Retour
                  </button>
                  <a 
                    href="/support" 
                    className="text-sm text-app-primary hover:text-app-primary-dark transition-colors"
                  >
                    Contacter le support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour gérer les erreurs asynchrones
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Async error captured:', error);
    setError(error);
    
    // Envoyer à un service de monitoring en production
    if (process.env.NODE_ENV === 'production') {
      // Ex: Sentry.captureException(error);
    }
  }, []);

  // Effet pour logger les erreurs
  React.useEffect(() => {
    if (error) {
      // Logger ou envoyer à un service externe
    }
  }, [error]);

  return { error, captureError, resetError };
}

export default ErrorBoundary;
