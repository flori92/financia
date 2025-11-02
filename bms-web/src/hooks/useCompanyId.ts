import { getCompanyId } from '@/lib/api';

/**
 * Hook pour obtenir l'ID de l'entreprise à utiliser
 * Prend en compte le mode expert avec client sélectionné
 */
export function useEffectiveCompanyId(): string | null {
  // Vérifier si on est en mode expert avec un client sélectionné
  const selectedClientId = typeof window !== 'undefined' 
    ? localStorage.getItem('expert_selected_client_id') 
    : null;
  
  // Si un client expert est sélectionné, utiliser son ID
  if (selectedClientId) {
    return selectedClientId;
  }
  
  // Sinon utiliser l'ID de l'entreprise connectée
  return getCompanyId();
}

/**
 * Hook pour obtenir le nom du client sélectionné (mode expert)
 */
export function useSelectedClientName(): string | null {
  return typeof window !== 'undefined' 
    ? localStorage.getItem('expert_selected_client_name') 
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
