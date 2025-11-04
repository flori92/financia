import { UserRole } from './roles.guard';

export enum UserProfile {
  EXPERT_COMPTABLE = 'expert_comptable',
  ENTREPRENEUR = 'entrepreneur', 
  BANQUE = 'banque',
  ADMINISTRATION_FISCAL = 'administration_fiscal',
  HR_MANAGER = 'hr_manager',
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  ADMIN = 'admin'
}

// Définition des modules par profil avec typage explicite
const PROFILE_MODULES_BASE: Record<UserProfile, string[]> = {
  [UserProfile.EXPERT_COMPTABLE]: [
    'accounting.dashboard',
    'accounting.chart-of-accounts',
    'accounting.journal',
    'accounting.trial-balance',
    'accounting.profit-loss',
    'accounting.balance-sheet',
    'accounting.aged-balance',
    'accounting.vat',
    'accounting.closure',
    'accounting.bank',
    'accounting.automation'
  ],
  [UserProfile.ENTREPRENEUR]: [
    'dashboard.overview',
    'treasury.overview',
    'treasury.forecast',
    'treasury.alerts',
    'formalization.nif',
    'employees.list',
    'employees.timesheets',
    'employees.leave',
    'employees.payroll',
    'employees.transfers',
    'employees.documents'
  ],
  [UserProfile.BANQUE]: [
    'banking.transactions',
    'banking.reconciliation',
    'banking.transfers',
    'banking.statement-import'
  ],
  [UserProfile.ADMINISTRATION_FISCAL]: [
    'tax.vat-declarations',
    'tax.corporate-tax',
    'tax.annual-returns',
    'tax.audit-logs'
  ],
  [UserProfile.HR_MANAGER]: [
    'hr.employees',
    'hr.timesheets',
    'hr.leave-management',
    'hr.payroll',
    'hr.transfers',
    'hr.documents',
    'hr.analytics'
  ],
  [UserProfile.ACCOUNTANT]: [
    'accounting.dashboard',
    'accounting.chart-of-accounts',
    'accounting.journal',
    'accounting.trial-balance',
    'accounting.profit-loss',
    'accounting.balance-sheet',
    'accounting.vat',
    'accounting.bank',
    'accounting.reports'
  ],
  [UserProfile.MANAGER]: [
    'manager.team',
    'manager.timesheets',
    'manager.leave-approval',
    'manager.team-analytics',
    'manager.reports'
  ],
  [UserProfile.EMPLOYEE]: [
    'employee.profile',
    'employee.timesheets',
    'employee.leave-requests',
    'employee.payslips',
    'employee.documents'
  ],
  [UserProfile.ADMIN]: [
    // Admin a accès à tous les modules des autres profils
    ...Object.values(PROFILE_MODULES_BASE).flat()
  ]
};

export const PROFILE_MODULES: Record<UserProfile, string[]> = PROFILE_MODULES_BASE;

export const PORTAL_ROUTES: Record<UserProfile, string> = {
  [UserProfile.EXPERT_COMPTABLE]: '/expert-comptable',
  [UserProfile.ENTREPRENEUR]: '/entrepreneur',
  [UserProfile.BANQUE]: '/banque',
  [UserProfile.ADMINISTRATION_FISCAL]: '/fiscal',
  [UserProfile.HR_MANAGER]: '/hr',
  [UserProfile.ACCOUNTANT]: '/accounting',
  [UserProfile.MANAGER]: '/manager',
  [UserProfile.EMPLOYEE]: '/employee',
  [UserProfile.ADMIN]: '/admin'
};

export const getPortalByRole = (role: UserRole): string => {
  const roleToPortal: Record<UserRole, string> = {
    [UserRole.ADMIN]: PORTAL_ROUTES[UserProfile.ADMIN],
    [UserRole.TAX_ADMIN]: PORTAL_ROUTES[UserProfile.ADMINISTRATION_FISCAL],
    [UserRole.HR_MANAGER]: PORTAL_ROUTES[UserProfile.HR_MANAGER],
    [UserRole.ACCOUNTANT]: PORTAL_ROUTES[UserProfile.ACCOUNTANT],
    [UserRole.MANAGER]: PORTAL_ROUTES[UserProfile.MANAGER],
    [UserRole.EMPLOYEE]: PORTAL_ROUTES[UserProfile.EMPLOYEE],
    [UserRole.USER]: PORTAL_ROUTES[UserProfile.ENTREPRENEUR] // Default
  };
  
  return roleToPortal[role] || PORTAL_ROUTES[UserProfile.ENTREPRENEUR];
};

export const getModulesByRole = (role: UserRole): string[] => {
  const roleToProfile: Record<UserRole, UserProfile> = {
    [UserRole.ADMIN]: UserProfile.ADMIN,
    [UserRole.TAX_ADMIN]: UserProfile.ADMINISTRATION_FISCAL,
    [UserRole.HR_MANAGER]: UserProfile.HR_MANAGER,
    [UserRole.ACCOUNTANT]: UserProfile.ACCOUNTANT,
    [UserRole.MANAGER]: UserProfile.MANAGER,
    [UserRole.EMPLOYEE]: UserProfile.EMPLOYEE,
    [UserRole.USER]: UserProfile.ENTREPRENEUR
  };
  
  const profile = roleToProfile[role] || UserProfile.ENTREPRENEUR;
  return PROFILE_MODULES[profile];
};
