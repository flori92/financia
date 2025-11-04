import { authManager } from '../lib/auth-manager';

/**
 * Hook pour obtenir l'ID de l'entreprise à utiliser
 * Prend en compte le mode expert avec client sélectionné
 * 
 * ⚠️ IMPORTANT: Ce hook retourne toujours un companyId valide ou lance une erreur
 * Pour un companyId optionnel, utiliser useOptionalCompanyId()
 */
export function useCompanyId(): string {
  const companyId = useEffectiveCompanyId();
  
  if (!companyId) {
    throw new Error('CompanyId non disponible. Utilisateur non authentifié ou entreprise non sélectionnée.');
  }
  
  return companyId;
}

/**
 * Hook pour obtenir l'ID de l'entreprise (peut être null)
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
  
  // Sinon utiliser l'ID de l'entreprise depuis localStorage
  if (typeof window !== 'undefined') {
    // D'abord essayer company_id directement
    const directCompanyId = localStorage.getItem('company_id');
    if (directCompanyId) {
      return directCompanyId;
    }
    
    // Sinon essayer depuis user_data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.companyId) {
          return user.companyId;
        }
      } catch (e) {
        // Ignore parse error
      }
    }
    
    // Fallback: essayer authManager
    const { user } = authManager.getState();
    return user?.companyId || null;
  }
  
  return null;
}

/**
 * Hook pour obtenir un companyId avec fallback vers demo
 * Utilisé pour les pages de développement/test
 */
export function useCompanyIdWithDemo(): string {
  const companyId = useEffectiveCompanyId();
  return companyId || authManager.getDemoCompanyId();
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
