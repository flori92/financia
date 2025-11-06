import { getCompanyId } from '@/lib/api';

export function getEffectiveCompanyId(): string | null {
  if (typeof window !== 'undefined') {
    const selectedClientId = window.localStorage.getItem('expert_selected_client_id');
    if (selectedClientId) {
      return selectedClientId;
    }
  }

  return getCompanyId() || null;
}

/**
 * Hook pour obtenir l'ID de l'entreprise à utiliser
 * Prend en compte le mode expert avec client sélectionné
 */
export function useEffectiveCompanyId(): string | null {
  return getEffectiveCompanyId();
}

/**
 * Hook pour obtenir le nom du client sélectionné (mode expert)
 */
export function useSelectedClientName(): string | null {
  return typeof window !== 'undefined' 
    ? localStorage.getItem('expert_selected_client_name') || null
    : null;
}

/**
 * Vérifie si on est en mode expert avec un client sélectionné
 */
export function isExpertClientMode(): boolean {
  return typeof window !== 'undefined' 
    ? !!localStorage.getItem('expert_selected_client_id') 
    : false;
}
