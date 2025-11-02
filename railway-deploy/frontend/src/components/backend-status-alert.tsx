'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { getBackendStatus, forceHealthCheck } from '../lib/api-service';

interface BackendStatusAlertProps {
  className?: string;
}

export function BackendStatusAlert({ className = '' }: BackendStatusAlertProps) {
  const [backendStatus, setBackendStatus] = useState(getBackendStatus());
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(() => {
      setBackendStatus(getBackendStatus());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await forceHealthCheck();
    setBackendStatus(getBackendStatus());
    setIsRetrying(false);
  };

  if (backendStatus.available) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 ${className}`}>
        <Wifi className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-800">
          Backend connecté - Mode complet activé
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <WifiOff className="w-4 h-4 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-amber-800">
              Mode Démo Activé
            </h4>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-xs text-amber-600 hover:text-amber-800 underline disabled:opacity-50"
            >
              {isRetrying ? 'Vérification...' : 'Réessayer'}
            </button>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Le backend BMS n'est pas accessible. L'application fonctionne en mode démo avec des données fictives.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            URL: {backendStatus.url} | Dernière vérification: {new Date(backendStatus.lastCheck).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}
