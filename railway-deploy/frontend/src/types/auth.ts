// Types d'authentification pour le BMS
export type UserRole = 'expert-comptable' | 'entrepreneur' | 'bank' | 'fiscal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
}
