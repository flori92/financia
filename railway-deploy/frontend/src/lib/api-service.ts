// Service API intelligent avec fallback mode démo
import { demoDashboardData, demoCompanies } from './demo-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bms-api-netlify.netlify.app';
const FORCE_PRODUCTION_MODE = process.env.NODE_ENV === 'production'; // Forcer le backend en production

// Vérifier si le backend est disponible
let isBackendAvailable = true; // Par défaut, on considère le backend disponible en production
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // 60 secondes pour la production

async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // Timeout 5 secondes
    });
    
    isBackendAvailable = response.ok;
    return isBackendAvailable;
  } catch (error) {
    console.log('Backend indisponible, basculement en mode démo:', error.message);
    isBackendAvailable = false;
    return false;
  }
}

// Vérifier la santé du backend avant chaque appel
async function ensureBackendHealth(): Promise<boolean> {
  const now = Date.now();
  if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
    lastHealthCheck = now;
    await checkBackendHealth();
  }
  return isBackendAvailable;
}

// Fonction API générique avec fallback démo
async function apiCall<T>(
  endpoint: string, 
  demoData: T, 
  options: RequestInit = {}
): Promise<T> {
  // En production, on essaie toujours le backend d'abord
  if (!FORCE_PRODUCTION_MODE) {
    const backendAvailable = await ensureBackendHealth();
    
    if (!backendAvailable) {
      console.log(`Mode démo activé pour ${endpoint}`);
      return demoData;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API ${endpoint}:`, error);
    
    // En production, on ne bascule en mode démo qu'en cas d'erreur critique
    if (!FORCE_PRODUCTION_MODE) {
      isBackendAvailable = false; // Forcer le mode démo pour les prochains appels
      return demoData;
    }
    
    // En production, on propage l'erreur pour que l'utilisateur sache qu'il y a un problème
    throw error;
  }
}

// Endpoints spécifiques
export const api = {
  // Health check
  async health() {
    return apiCall('/health', { status: 'ok', service: 'bms-api-gateway-demo' });
  },

  // Companies
  async getCompanies() {
    return apiCall('/api/v1/companies', demoCompanies);
  },

  // Dashboard comptable
  async getDashboardMetrics(companyId: string) {
    return apiCall(`/api/v1/accounting/dashboard/metrics?companyId=${companyId}`, demoDashboardData);
  },

  // Balance âgée
  async getAgedBalance(companyId: string, type: 'receivables' | 'payables', asOfDate?: string) {
    const params = new URLSearchParams({ companyId, type });
    if (asOfDate) params.append('asOfDate', asOfDate);
    
    const demoData = {
      type,
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      items: [],
      totals: { total: 0, current: 0, days30_60: 0, days60_90: 0, over90: 0 }
    };
    
    return apiCall(`/api/v1/accounting/aged-balance?${params}`, demoData);
  },

  // Autres endpoints (à ajouter au besoin)
  async getTrialBalance(companyId: string) {
    return apiCall(`/api/v1/accounting/trial-balance?companyId=${companyId}`, { accounts: [] });
  },

  async getProfitLoss(companyId: string) {
    return apiCall(`/api/v1/accounting/profit-loss?companyId=${companyId}`, { revenues: [], expenses: [], netIncome: 0 });
  },

  async getBalanceSheet(companyId: string) {
    return apiCall(`/api/v1/accounting/balance-sheet?companyId=${companyId}`, { assets: [], liabilities: [], equity: 0 });
  },
};

// Exporter l'état du backend pour l'UI
export const getBackendStatus = () => ({
  available: isBackendAvailable,
  url: API_BASE_URL,
  lastCheck: new Date(lastHealthCheck).toISOString(),
});

// Forcer une vérification de santé
export const forceHealthCheck = () => {
  lastHealthCheck = 0; // Forcer la vérification
  return checkBackendHealth();
};
