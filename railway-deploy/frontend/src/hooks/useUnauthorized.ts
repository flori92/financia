import { useState } from 'react';

interface UnauthorizedState {
  requiredRoles: string[];
  currentRole: string;
  resourceName: string;
}

export function useUnauthorized() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<UnauthorizedState>({
    requiredRoles: [],
    currentRole: '',
    resourceName: 'cette ressource',
  });

  const showUnauthorized = (config: Partial<UnauthorizedState>) => {
    setState(prev => ({
      ...prev,
      ...config,
    }));
    setIsOpen(true);
  };

  const hideUnauthorized = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    ...state,
    showUnauthorized,
    hideUnauthorized,
  };
}

// Hook pour vérifier les permissions
export function useCheckPermission(
  userRoles: string[],
  requiredRoles: string[]
): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

// Hook combiné qui affiche automatiquement le modal si non autorisé
export function useProtectedAction(
  userRoles: string[],
  requiredRoles: string[],
  resourceName: string
) {
  const unauthorized = useUnauthorized();
  const hasPermission = useCheckPermission(userRoles, requiredRoles);

  const executeAction = (action: () => void) => {
    if (hasPermission) {
      action();
    } else {
      unauthorized.showUnauthorized({
        requiredRoles,
        currentRole: userRoles[0] || 'Aucun rôle',
        resourceName,
      });
    }
  };

  return {
    hasPermission,
    executeAction,
    unauthorized,
  };
}
