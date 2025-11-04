/**
 * Service comptable v2.0 avec gestion d'erreurs robuste
 * Remplace l'ancien service avec architecture moderne
 */

import * as React from 'react';
import { apiClient, type ApiResponse } from '@/lib/api-client';

// Types pour la comptabilité
export interface DashboardMetrics {
  kpiMonth: {
    revenue: number;
    expenses: number;
    netIncome: number;
    margin: number;
  };
  evolutionChart: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  topClients: Array<{
    name: string;
    amount: number;
  }>;
  topSuppliers: Array<{
    name: string;
    amount: number;
  }>;
  financialRatios: {
    currentAssets: number;
    currentLiabilities: number;
    equity: number;
    totalLiabilities: number;
    liquidityRatio: number;
    solvencyRatio: number;
  };
  alerts: Array<{
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
  }>;
  recentActivity: {
    entries: Array<{
      date: string;
      description: string;
      amount: number;
      type: string;
    }>;
  };
}

export interface AgedBalance {
  period: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'locked';
  companyId: string;
}

// Service principal
export class AccountingServiceV2 {
  // Dashboard
  static async getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    const response = await apiClient.get<DashboardMetrics>(`/api/v1/accounting/dashboard/metrics`, { companyId });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors du chargement du dashboard');
    }
    
    return response.data;
  }

  // Balance âgée
  static async getAgedBalance(
    companyId: string, 
    type: 'receivables' | 'payables'
  ): Promise<AgedBalance[]> {
    const response = await apiClient.get<AgedBalance[]>(`/api/v1/accounting/aged-balance`, { companyId, type });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors du chargement de la balance âgée');
    }
    
    return response.data;
  }

  // Périodes comptables
  static async getAccountingPeriods(companyId: string): Promise<AccountingPeriod[]> {
    const response = await apiClient.get<AccountingPeriod[]>(`/api/v1/accounting/periods`, { companyId });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors du chargement des périodes');
    }
    
    return response.data;
  }

  static async createAccountingPeriod(
    companyId: string,
    periodData: Partial<AccountingPeriod>
  ): Promise<AccountingPeriod> {
    const response = await apiClient.post<AccountingPeriod>(`/api/v1/accounting/periods`, periodData, { companyId });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la création de la période');
    }
    
    return response.data;
  }

  // Grand livre
  static async getGeneralLedger(
    companyId: string,
    options: {
      startDate?: string;
      endDate?: string;
      accountId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/v1/accounting/general-ledger`, { companyId, ...options });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors du chargement du grand livre');
    }
    
    return response.data;
  }

  // Bilan
  static async getBalanceSheet(
    companyId: string,
    date?: string
  ): Promise<any> {
    const response = await apiClient.get<any>(`/api/v1/accounting/balance-sheet`, { companyId, date });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors du chargement du bilan');
    }
    
    return response.data;
  }

  // Compte de résultat
  static async getIncomeStatement(
    companyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const response = await apiClient.get<any>(`/api/v1/accounting/income-statement`, { companyId, startDate, endDate });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors du chargement du compte de résultat');
    }
    
    return response.data;
  }

  // Export
  static async exportReport(
    companyId: string,
    reportType: string,
    format: 'pdf' | 'excel' | 'csv',
    options?: any
  ): Promise<Blob> {
    const response = await apiClient.post<Blob>(`/api/v1/accounting/export/${reportType}`, options, { companyId, format });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de l\'export');
    }
    
    return response.data;
  }
}

// Hooks React pour une utilisation simplifiée
// import { useApiWithErrorHandling, useQuery, useMutation } from '@/hooks/useApiWithErrorHandling';

// Simplifié pour éviter les imports circulaires
import * as React from 'react';
import { apiClient, type ApiResponse } from '@/lib/api-client';

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: any;
  isSuccess: boolean;
  isError: boolean;
}

function useQuery<T = any>(
  queryFn: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseQueryResult<T> {
  const [state, setState] = React.useState<UseQueryResult<T>>({
    data: null,
    isLoading: true,
    error: null,
    isSuccess: false,
    isError: false
  });

  React.useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const result = await queryFn();
        
        if (isMounted) {
          setState({
            data: result,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error,
            isSuccess: false,
            isError: true
          });
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}

export function useDashboardMetrics(companyId: string) {
  return useQuery<DashboardMetrics>(
    async () => {
      const response = await apiClient.get<DashboardMetrics>(`/api/v1/accounting/dashboard/metrics`, { companyId });
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erreur lors du chargement du dashboard');
      }
      
      return response.data;
    },
    [companyId]
  );
}

export function useAgedBalance(companyId: string, type: 'receivables' | 'payables') {
  return useQuery<AgedBalance[]>(
    async () => {
      const response = await apiClient.get<AgedBalance[]>(`/api/v1/accounting/aged-balance`, { companyId, type });
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erreur lors du chargement de la balance âgée');
      }
      
      return response.data;
    },
    [companyId, type]
  );
}

export function useAccountingPeriods(companyId: string) {
  const [periods, setPeriods] = React.useState<AccountingPeriod[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  
  const loadPeriods = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<AccountingPeriod[]>(`/api/v1/accounting/periods`, { companyId });
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erreur lors du chargement des périodes');
      }
      
      setPeriods(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const createPeriod = React.useCallback(async (
    periodData: Partial<AccountingPeriod>
  ): Promise<AccountingPeriod> => {
    const response = await apiClient.post<AccountingPeriod>(`/api/v1/accounting/periods`, periodData, { companyId });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la création de la période');
    }
    
    // Recharger la liste
    await loadPeriods();
    return response.data;
  }, [companyId, loadPeriods]);

  React.useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  return {
    periods,
    isLoading,
    error,
    loadPeriods,
    createPeriod,
    isCreating: isLoading
  };
}

export function useAccountingReports(companyId: string) {
  const [isExporting, setIsExporting] = React.useState(false);

  const exportReport = React.useCallback(async (
    reportType: string,
    format: 'pdf' | 'excel' | 'csv',
    options?: any
  ) => {
    setIsExporting(true);
    
    try {
      const response = await apiClient.post<Blob>(`/api/v1/accounting/export/${reportType}`, options, { companyId, format });
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erreur lors de l\'export');
      }
      
      const blob = response.data;
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [companyId]);

  return {
    exportReport,
    isExporting
  };
}

export default AccountingServiceV2;
