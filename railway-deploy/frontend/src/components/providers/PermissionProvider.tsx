"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setPermissionAlertCallback } from '@/lib/api';
import { PermissionAlert, usePermissionAlert } from '@/components/error/PermissionAlert';

interface PermissionContextType {
  showPermissionAlert: (feature?: string, requiredRole?: string) => void;
  hidePermissionAlert: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}

interface PermissionProviderProps {
  children: React.ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { alert, showPermissionAlert, hidePermissionAlert } = usePermissionAlert();

  useEffect(() => {
    // Enregistrer le callback global pour les alertes de permissions
    setPermissionAlertCallback(showPermissionAlert);
  }, [showPermissionAlert]);

  const handleContactAdmin = () => {
    // Rediriger vers la page support ou admin
    window.location.href = '/support';
  };

  return (
    <PermissionContext.Provider
      value={{
        showPermissionAlert,
        hidePermissionAlert,
      }}
    >
      {children}
      <PermissionAlert
        open={alert.open}
        onClose={hidePermissionAlert}
        feature={alert.feature}
        requiredRole={alert.requiredRole}
        onContactAdmin={handleContactAdmin}
      />
    </PermissionContext.Provider>
  );
}

export default PermissionProvider;
