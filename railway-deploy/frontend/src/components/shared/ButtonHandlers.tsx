import React from 'react';
import { Button } from '@/components/ui/button';

interface ButtonHandlerProps {
  onClick: () => Promise<void> | void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  confirmationMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Composant de bouton avec handler fonctionnel et gestion des états
 * Assure que tous les boutons ont un comportement cohérent
 */
export const FunctionalButton: React.FC<ButtonHandlerProps> = ({
  onClick,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className = '',
  confirmationMessage,
  successMessage = 'Action réalisée avec succès',
  errorMessage = 'Erreur lors de l\'action',
  ...props
}) => {
  const handleClick = async () => {
    try {
      // Afficher une confirmation si nécessaire
      if (confirmationMessage && !confirm(confirmationMessage)) {
        return;
      }

      // Exécuter l'action
      await onClick();

      // Afficher le message de succès
      if (successMessage) {
        alert(successMessage);
      }
    } catch (error) {
      console.error('Erreur dans le handler du bouton:', error);
      alert(errorMessage);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Chargement...
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

interface ActionButtonConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => Promise<void> | void;
  variant?: ButtonHandlerProps['variant'];
  confirmation?: string;
  success?: string;
  error?: string;
  requiresAuth?: boolean;
  permissions?: string[];
}

/**
 * Hook pour valider et configurer les handlers de boutons
 */
export const useButtonHandlers = (configs: ActionButtonConfig[]) => {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const createHandler = (config: ActionButtonConfig) => {
    return async () => {
      // Vérifier les permissions si nécessaire
      if (config.requiresAuth || config.permissions) {
        // TODO: Implémenter la vérification des permissions
        console.log('Vérification des permissions:', config.permissions);
      }

      setLoadingStates(prev => ({ ...prev, [config.id]: true }));

      try {
        await config.action();
      } finally {
        setLoadingStates(prev => ({ ...prev, [config.id]: false }));
      }
    };
  };

  const handlers = configs.reduce((acc, config) => {
    acc[config.id] = {
      ...config,
      action: createHandler(config),
      loading: loadingStates[config.id] || false
    };
    return acc;
  }, {} as Record<string, ActionButtonConfig & { loading: boolean }>);

  return handlers;
};

/**
 * Validation des handlers requis pour les modules inventory et purchases
 */
export const validateButtonHandlers = (moduleName: string) => {
  const requiredHandlers: Record<string, string[]> = {
    inventory: [
      'createProduct',
      'editProduct', 
      'deleteProduct',
      'adjustStock',
      'createBatch',
      'createPicking',
      'optimizePicking',
      'transferStock',
      'createWarehouse',
      'editWarehouse',
      'deleteWarehouse'
    ],
    purchases: [
      'createSupplier',
      'editSupplier',
      'deleteSupplier', 
      'createOrder',
      'editOrder',
      'deleteOrder',
      'sendOrder',
      'confirmOrder',
      'cancelOrder',
      'createReceipt',
      'completeReceipt',
      'threeWayMatch',
      'createRFQ',
      'sendRFQ'
    ]
  };

  const handlers = requiredHandlers[moduleName];
  if (!handlers) {
    console.warn(`Module ${moduleName} non reconnu pour la validation des handlers`);
    return [];
  }

  return handlers;
};

export default FunctionalButton;
