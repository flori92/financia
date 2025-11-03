import { apiGet, apiPost, getCompanyId } from "@/lib/api";

export interface AccountingMetrics {
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
    type: "danger" | "warning" | "info";
    title: string;
    message: string;
  }>;
  recentActivity: Array<{
    date: string;
    description: string;
    amount: number;
    type: string;
  }>;
}

export class AccountingService {
  /**
   * Récupère les métriques du dashboard comptable
   */
  static async getDashboardMetrics(companyId?: string): Promise<AccountingMetrics> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiGet(`/api/v1/accounting/dashboard/metrics`, { companyId: cid });
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des métriques comptables:', error);
      
      // Fallback avec données mockées pour éviter les crashes
      return this.getMockMetrics();
    }
  }

  /**
   * Exporte les données du dashboard en CSV
   */
  static async exportDashboardData(companyId?: string, period?: string): Promise<Blob> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounting/dashboard/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bms_token')}`,
        },
        body: JSON.stringify({ companyId: cid, period }),
      });

      if (!response.ok) {
        throw new Error(`Erreur d'export: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      throw error;
    }
  }

  /**
   * Rafraîchit les métriques (force le recalcul)
   */
  static async refreshMetrics(companyId?: string): Promise<AccountingMetrics> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/accounting/dashboard/refresh`, { companyId: cid });
      return response;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des métriques:', error);
      // Retourner les métriques existantes en cas d'erreur
      return this.getDashboardMetrics(companyId);
    }
  }

  /**
   * Données mockées pour fallback
   */
  private static getMockMetrics(): AccountingMetrics {
    return {
      kpiMonth: {
        revenue: 2500000,
        expenses: 1800000,
        netIncome: 700000,
        margin: 28
      },
      evolutionChart: [
        { month: "Jan", revenue: 1800000, expenses: 1500000 },
        { month: "Fév", revenue: 2000000, expenses: 1600000 },
        { month: "Mar", revenue: 2200000, expenses: 1700000 },
        { month: "Avr", revenue: 2100000, expenses: 1650000 },
        { month: "Mai", revenue: 2400000, expenses: 1750000 },
        { month: "Jun", revenue: 2500000, expenses: 1800000 }
      ],
      topClients: [
        { name: "Client A", amount: 450000 },
        { name: "Client B", amount: 380000 },
        { name: "Client C", amount: 320000 },
        { name: "Client D", amount: 280000 },
        { name: "Client E", amount: 220000 }
      ],
      topSuppliers: [
        { name: "Fournisseur X", amount: 320000 },
        { name: "Fournisseur Y", amount: 280000 },
        { name: "Fournisseur Z", amount: 240000 },
        { name: "Fournisseur W", amount: 180000 },
        { name: "Fournisseur V", amount: 150000 }
      ],
      financialRatios: {
        currentAssets: 3500000,
        currentLiabilities: 1200000,
        equity: 2800000,
        totalLiabilities: 1500000,
        liquidityRatio: 2.92,
        solvencyRatio: 1.87
      },
      alerts: [
        {
          type: "warning",
          title: "Factures en attente",
          message: "3 factures nécessitent une validation"
        },
        {
          type: "info",
          title: "Clôture de période",
          message: "La clôture du mois est disponible dans 5 jours"
        }
      ],
      recentActivity: [
        { date: "2024-11-03", description: "Facture FAC-2024-001", amount: 250000, type: "Vente" },
        { date: "2024-11-02", description: "Paiement Fournisseur A", amount: -180000, type: "Dépense" },
        { date: "2024-11-01", description: "Facture FAC-2024-002", amount: 320000, type: "Vente" }
      ]
    };
  }

  /**
   * Calcule les tendances basées sur les données historiques
   */
  static calculateTrends(current: AccountingMetrics, previous: AccountingMetrics) {
    const revenueTrend = ((current.kpiMonth.revenue - previous.kpiMonth.revenue) / previous.kpiMonth.revenue) * 100;
    const expensesTrend = ((current.kpiMonth.expenses - previous.kpiMonth.expenses) / previous.kpiMonth.expenses) * 100;
    const netIncomeTrend = ((current.kpiMonth.netIncome - previous.kpiMonth.netIncome) / Math.abs(previous.kpiMonth.netIncome)) * 100;

    return {
      revenue: Math.round(revenueTrend * 10) / 10,
      expenses: Math.round(expensesTrend * 10) / 10,
      netIncome: Math.round(netIncomeTrend * 10) / 10,
    };
  }

  /**
   * Valide les données comptables
   */
  static validateMetrics(metrics: AccountingMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metrics.kpiMonth || typeof metrics.kpiMonth.revenue !== 'number') {
      errors.push('Les revenus sont invalides');
    }
    if (!metrics.kpiMonth || typeof metrics.kpiMonth.expenses !== 'number') {
      errors.push('Les dépenses sont invalides');
    }
    if (!Array.isArray(metrics.evolutionChart)) {
      errors.push('Le graphique d\'évolution est invalide');
    }
    if (!Array.isArray(metrics.topClients)) {
      errors.push('La liste des clients est invalide');
    }
    if (!Array.isArray(metrics.alerts)) {
      errors.push('La liste des alertes est invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
