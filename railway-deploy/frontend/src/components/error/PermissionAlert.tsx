"use client";

import React from 'react';
import { AlertTriangle, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionAlertProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  requiredRole?: string;
  onContactAdmin?: () => void;
}

export function PermissionAlert({
  open,
  onClose,
  feature,
  requiredRole,
  onContactAdmin,
}: PermissionAlertProps) {
  if (!open) return null;

  const handleContactSupport = () => {
    if (onContactAdmin) {
      onContactAdmin();
    } else {
      // Redirection vers support ou admin
      window.location.href = '/support';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Icône et titre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Accès non autorisé
            </h3>
            <p className="text-sm text-gray-600">
              Permissions insuffisantes
            </p>
          </div>
        </div>

        {/* Message explicatif */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            {feature
              ? `Vous n'avez pas les permissions nécessaires pour accéder à : ${feature}`
              : "Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité."}
          </p>
          {requiredRole && (
            <p className="text-sm text-gray-600">
              Rôle requis : <span className="font-medium">{requiredRole}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fermer
          </Button>
          <Button onClick={handleContactSupport} className="flex-1">
            Contacter l'admin
          </Button>
        </div>

        {/* Info supplémentaire */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur système pour qu'il ajuste vos permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook pour gérer l'alerte de permissions
export function usePermissionAlert() {
  const [alert, setAlert] = React.useState<{
    open: boolean;
    feature?: string;
    requiredRole?: string;
  }>({
    open: false,
  });

  const showPermissionAlert = (feature?: string, requiredRole?: string) => {
    setAlert({
      open: true,
      feature,
      requiredRole,
    });
  };

  const hidePermissionAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return {
    alert,
    showPermissionAlert,
    hidePermissionAlert,
  };
}

export default PermissionAlert;
