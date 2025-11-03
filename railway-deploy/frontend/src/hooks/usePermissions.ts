// Hook de gestion des permissions par profil BMS
import { useAuth } from './useAuth';

type UserRole = 'expert-comptable' | 'entrepreneur' | 'bank' | 'fiscal';

interface Permission {
  module: string;
  action: 'read' | 'write' | 'configure' | 'admin';
}

// Matrice des permissions
const PERMISSION_MATRIX: Record<UserRole, Record<string, string[]>> = {
  'expert-comptable': {
    accounting: ['read', 'write', 'configure', 'admin'],
    treasury: ['read', 'write', 'configure', 'admin'],
    banking: ['read', 'write', 'configure', 'admin'],
    fiscal: ['read', 'write', 'configure', 'admin'],
    entrepreneur: ['read', 'write', 'configure', 'admin'],
    communications: ['read', 'write', 'configure', 'admin'],
    inventory: ['read', 'write', 'configure', 'admin'],
    invoices: ['read', 'write', 'configure', 'admin'],
    purchases: ['read', 'write', 'configure', 'admin'],
    sales: ['read', 'write', 'configure', 'admin'],
    crm: ['read', 'write', 'configure', 'admin'],
    hr: ['read', 'write', 'configure', 'admin'],
    projects: ['read', 'write', 'configure', 'admin'],
    manufacturing: ['read', 'write', 'configure', 'admin'],
    budget: ['read', 'write', 'configure', 'admin'],
    marketing: ['read', 'write', 'configure', 'admin'],
    settings: ['read', 'write', 'configure', 'admin']
  },
  'entrepreneur': {
    accounting: ['read', 'write'], // Vue simplifiée
    treasury: ['read'], // KPIs seulement
    banking: [], // Interdit
    fiscal: [], // Interdit
    entrepreneur: ['read', 'write'],
    communications: ['read', 'write'], // Envoi limité
    inventory: ['read'], // Consultation
    invoices: ['read', 'write'],
    purchases: ['read', 'write'], // Demandes
    sales: ['read', 'write'], // Devis/commandes
    crm: ['read', 'write'], // Gestion clients
    hr: [], // Interdit
    projects: ['read'], // Consultation
    manufacturing: [], // Interdit
    budget: ['read'], // Consultation
    marketing: ['read', 'write'], // Basique
    settings: ['read'] // Limité
  },
  'bank': {
    accounting: ['read'], // Soldes seulement
    treasury: ['read'], // Flux seulement
    banking: ['read', 'write'], // Vue principale
    fiscal: [], // Interdit
    entrepreneur: [], // Interdit
    communications: [], // Interdit
    inventory: [], // Interdit
    invoices: [], // Interdit
    purchases: [], // Interdit
    sales: [], // Interdit
    crm: [], // Interdit
    hr: [], // Interdit
    projects: [], // Interdit
    manufacturing: [], // Interdit
    budget: [], // Interdit
    marketing: [], // Interdit
    settings: ['read'] // Limité
  },
  'fiscal': {
    accounting: ['read'], // Rapports fiscaux
    treasury: ['read'], // Flux fiscaux
    banking: [], // Interdit
    fiscal: ['read', 'write'], // Vue principale
    entrepreneur: [], // Interdit
    communications: [], // Interdit
    inventory: [], // Interdit
    invoices: [], // Interdit
    purchases: [], // Interdit
    sales: [], // Interdit
    crm: [], // Interdit
    hr: [], // Interdit
    projects: [], // Interdit
    manufacturing: [], // Interdit
    budget: [], // Interdit
    marketing: [], // Interdit
    settings: ['read'] // Limité
  }
};

export const usePermissions = () => {
  // Simulation - à remplacer avec vrai auth
  const userRole: UserRole = 'expert-comptable'; // Temporaire
  
  const canAccess = (module: string, action: string = 'read'): boolean => {
    const permissions = PERMISSION_MATRIX[userRole]?.[module] || [];
    return permissions.includes(action) || permissions.includes('admin');
  };
  
  const canRead = (module: string): boolean => canAccess(module, 'read');
  const canWrite = (module: string): boolean => canAccess(module, 'write');
  const canConfigure = (module: string): boolean => canAccess(module, 'configure');
  const isAdmin = (module: string): boolean => canAccess(module, 'admin');
  
  // Sidebar items autorisés
  const getAuthorizedMenu = () => {
    const allMenuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'Layout', module: 'entrepreneur', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'accounting', label: 'Comptabilité', icon: 'Calculator', module: 'accounting', roles: ['expert-comptable', 'entrepreneur', 'bank', 'fiscal'] },
      { id: 'treasury', label: 'Trésorerie', icon: 'TrendingUp', module: 'treasury', roles: ['expert-comptable', 'entrepreneur', 'bank', 'fiscal'] },
      { id: 'banking', label: 'Banque', icon: 'Building2', module: 'banking', roles: ['expert-comptable'] },
      { id: 'fiscal', label: 'Fiscal', icon: 'FileText', module: 'fiscal', roles: ['expert-comptable', 'fiscal'] },
      { id: 'communications', label: 'Communications', icon: 'Mail', module: 'communications', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'inventory', label: 'Stock', icon: 'Package', module: 'inventory', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'invoices', label: 'Factures', icon: 'FileText', module: 'invoices', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'purchases', label: 'Achats', icon: 'ShoppingCart', module: 'purchases', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'sales', label: 'Ventes', icon: 'TrendingUp', module: 'sales', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'crm', label: 'CRM', icon: 'Users', module: 'crm', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'hr', label: 'RH', icon: 'UserCheck', module: 'hr', roles: ['expert-comptable'] },
      { id: 'projects', label: 'Projets', icon: 'FolderOpen', module: 'projects', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'manufacturing', label: 'Production', icon: 'Cpu', module: 'manufacturing', roles: ['expert-comptable'] },
      { id: 'budget', label: 'Budget', icon: 'PieChart', module: 'budget', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'marketing', label: 'Marketing', icon: 'Megaphone', module: 'marketing', roles: ['expert-comptable', 'entrepreneur'] },
      { id: 'settings', label: 'Paramètres', icon: 'Settings', module: 'settings', roles: ['expert-comptable', 'entrepreneur', 'bank', 'fiscal'] }
    ];
    
    return allMenuItems.filter(item => item.roles.includes(userRole));
  };
  
  // Messages d'accès limité
  const getAccessMessage = (module: string): string => {
    if (canAccess(module)) return '';
    
    const messages: Record<UserRole, string> = {
      'expert-comptable': '',
      'entrepreneur': 'Cette fonctionnalité est réservée aux experts-comptables',
      'bank': 'Cette fonctionnalité n\'est pas accessible aux partenaires bancaires',
      'fiscal': 'Cette fonctionnalité n\'est pas accessible à l\'administration fiscale'
    };
    
    return messages[userRole] || 'Accès non autorisé';
  };
  
  return {
    userRole,
    canAccess,
    canRead,
    canWrite,
    canConfigure,
    isAdmin,
    getAuthorizedMenu,
    getAccessMessage
  };
};

// Composant de protection
interface ProtectedComponentProps {
  module: string;
  action?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  module,
  action = 'read',
  children,
  fallback
}) => {
  const { canAccess } = usePermissions();
  const defaultFallback = <div className="text-gray-500 text-sm">Accès limité</div>;
  
  if (!canAccess(module, action)) {
    return <>{fallback || defaultFallback}</>;
  }
  
  return <>{children}</>;
};

// Hook pour vérifier et rediriger
export const useRequireAuth = (module: string, action: string = 'read') => {
  const { canAccess, getAccessMessage } = usePermissions();
  
  if (!canAccess(module, action)) {
    throw new Error(getAccessMessage(module));
  }
};
