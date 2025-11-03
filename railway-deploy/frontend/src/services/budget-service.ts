import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";

export interface BudgetItem {
  id: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  type: "revenue" | "expense";
  department?: string;
  responsible?: string;
  status: "on-track" | "warning" | "critical" | "completed";
  lastUpdated: string;
}

export interface BudgetMetrics {
  totalBudgeted: number;
  totalActual: number;
  overallVariance: number;
  overallVariancePercent: number;
  period: string;
  budgetItems: BudgetItem[];
  departmentBreakdown: Array<{
    name: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
  alerts: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    itemId?: string;
  }>;
}

export class BudgetService {
  /**
   * Récupère les métriques budgétaires
   */
  static async getBudgetMetrics(
    companyId?: string, 
    period?: string, 
    department?: string
  ): Promise<BudgetMetrics> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiGet(`/api/v1/budget/metrics`, { 
        companyId: cid, 
        period: period || '2024-11',
        department: department || 'all'
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des métriques budgétaires:', error);
      return this.getMockMetrics();
    }
  }

  /**
   * Crée une nouvelle catégorie budgétaire
   */
  static async createBudgetItem(
    itemData: Omit<BudgetItem, 'id' | 'variance' | 'variancePercent' | 'status' | 'lastUpdated'>,
    companyId?: string
  ): Promise<BudgetItem> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/budget/items`, {
        ...itemData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie budgétaire:', error);
      throw error;
    }
  }

  /**
   * Met à jour une catégorie budgétaire
   */
  static async updateBudgetItem(
    id: string, 
    itemData: Partial<BudgetItem>, 
    companyId?: string
  ): Promise<BudgetItem> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPut(`/api/v1/budget/items/${id}`, {
        ...itemData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie budgétaire:', error);
      throw error;
    }
  }

  /**
   * Supprime une catégorie budgétaire
   */
  static async deleteBudgetItem(id: string, companyId?: string): Promise<void> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      await apiDelete(`/api/v1/budget/items/${id}`, { companyId: cid });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie budgétaire:', error);
      throw error;
    }
  }

  /**
   * Exporte les données budgétaires en CSV
   */
  static async exportBudgetData(
    companyId?: string, 
    period?: string, 
    department?: string
  ): Promise<Blob> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/budget/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bms_token')}`,
        },
        body: JSON.stringify({ companyId: cid, period, department }),
      });

      if (!response.ok) {
        throw new Error(`Erreur d'export: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Erreur lors de l\'export des données budgétaires:', error);
      throw error;
    }
  }

  /**
   * Génère les prévisions budgétaires avec IA
   */
  static async generateForecast(
    companyId?: string, 
    horizon?: number
  ): Promise<BudgetMetrics['monthlyTrend']> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/budget/forecast`, {
        companyId: cid,
        horizon: horizon || 6
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération des prévisions:', error);
      return this.getMockForecast();
    }
  }

  /**
   * Analyse les écarts budgétaires
   */
  static analyzeVariance(items: BudgetItem[]): {
    criticalItems: BudgetItem[];
    warningItems: BudgetItem[];
    totalVariance: number;
    recommendations: string[];
  } {
    const criticalItems = items.filter(item => item.status === 'critical');
    const warningItems = items.filter(item => item.status === 'warning');
    const totalVariance = items.reduce((sum, item) => sum + Math.abs(item.variance), 0);
    
    const recommendations: string[] = [];
    
    if (criticalItems.length > 0) {
      recommendations.push(`${criticalItems.length} catégorie(s) en dépassement critique - action immédiate requise`);
    }
    if (warningItems.length > 0) {
      recommendations.push(`${warningItems.length} catégorie(s) nécessitent une attention particulière`);
    }
    if (totalVariance > 1000000) {
      recommendations.push('L\'écart total dépasse 1M FCFA - une révision budgétaire est recommandée');
    }

    return {
      criticalItems,
      warningItems,
      totalVariance,
      recommendations
    };
  }

  /**
   * Calcule le pourcentage de réalisation du budget
   */
  static calculateBudgetPerformance(metrics: BudgetMetrics): {
    overallPerformance: number;
    revenuePerformance: number;
    expensePerformance: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  } {
    const overallPerformance = 100 - Math.abs(metrics.overallVariancePercent);
    
    const revenueItems = metrics.budgetItems.filter(item => item.type === 'revenue');
    const expenseItems = metrics.budgetItems.filter(item => item.type === 'expense');
    
    const revenuePerformance = revenueItems.length > 0 
      ? 100 - (revenueItems.reduce((sum, item) => sum + Math.abs(item.variancePercent), 0) / revenueItems.length)
      : 100;
      
    const expensePerformance = expenseItems.length > 0
      ? 100 - (expenseItems.reduce((sum, item) => sum + Math.abs(item.variancePercent), 0) / expenseItems.length)
      : 100;

    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (overallPerformance >= 95) status = 'excellent';
    else if (overallPerformance >= 85) status = 'good';
    else if (overallPerformance >= 70) status = 'warning';
    else status = 'critical';

    return {
      overallPerformance: Math.round(overallPerformance * 10) / 10,
      revenuePerformance: Math.round(revenuePerformance * 10) / 10,
      expensePerformance: Math.round(expensePerformance * 10) / 10,
      status
    };
  }

  /**
   * Données mockées pour fallback
   */
  private static getMockMetrics(): BudgetMetrics {
    return {
      totalBudgeted: 5000000,
      totalActual: 4800000,
      overallVariance: 200000,
      overallVariancePercent: 4.0,
      period: "2024-11",
      budgetItems: [
        {
          id: "1",
          category: "Ventes",
          budgeted: 2000000,
          actual: 2200000,
          variance: 200000,
          variancePercent: 10.0,
          type: "revenue",
          department: "Commercial",
          responsible: "Directeur Commercial",
          status: "on-track",
          lastUpdated: "2024-11-03T10:30:00Z"
        },
        {
          id: "2",
          category: "Marketing",
          budgeted: 800000,
          actual: 950000,
          variance: -150000,
          variancePercent: -18.75,
          type: "expense",
          department: "Marketing",
          responsible: "Directeur Marketing",
          status: "warning",
          lastUpdated: "2024-11-03T09:15:00Z"
        },
        {
          id: "3",
          category: "Salaires",
          budgeted: 1500000,
          actual: 1450000,
          variance: 50000,
          variancePercent: 3.33,
          type: "expense",
          department: "RH",
          responsible: "Directeur RH",
          status: "on-track",
          lastUpdated: "2024-11-02T16:45:00Z"
        },
        {
          id: "4",
          category: "Frais Généraux",
          budgeted: 700000,
          actual: 200000,
          variance: 500000,
          variancePercent: 71.43,
          type: "expense",
          department: "Admin",
          responsible: "Directeur Admin",
          status: "completed",
          lastUpdated: "2024-11-01T14:20:00Z"
        }
      ],
      departmentBreakdown: [
        { name: "Commercial", budgeted: 2000000, actual: 2200000, variance: 200000 },
        { name: "Marketing", budgeted: 800000, actual: 950000, variance: -150000 },
        { name: "RH", budgeted: 1500000, actual: 1450000, variance: 50000 },
        { name: "Admin", budgeted: 700000, actual: 200000, variance: 500000 }
      ],
      monthlyTrend: [
        { month: "Août", budgeted: 4800000, actual: 4900000, variance: -100000 },
        { month: "Sept", budgeted: 4900000, actual: 4850000, variance: 50000 },
        { month: "Oct", budgeted: 4950000, actual: 4750000, variance: 200000 },
        { month: "Nov", budgeted: 5000000, actual: 4800000, variance: 200000 }
      ],
      alerts: [
        {
          type: "warning",
          title: "Dépassement Budget Marketing",
          message: "Le budget marketing est dépassé de 18.75%",
          itemId: "2"
        },
        {
          type: "info",
          title: "Performance Commerciale Excellente",
          message: "Les ventes dépassent le budget de 10%"
        }
      ]
    };
  }

  private static getMockForecast(): BudgetMetrics['monthlyTrend'] {
    return [
      { month: "Déc", budgeted: 5100000, actual: 0, variance: 0 },
      { month: "Jan", budgeted: 5200000, actual: 0, variance: 0 },
      { month: "Fév", budgeted: 5150000, actual: 0, variance: 0 },
      { month: "Mar", budgeted: 5250000, actual: 0, variance: 0 },
      { month: "Avr", budgeted: 5300000, actual: 0, variance: 0 },
      { month: "Mai", budgeted: 5350000, actual: 0, variance: 0 }
    ];
  }

  /**
   * Valide les données budgétaires
   */
  static validateMetrics(metrics: BudgetMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof metrics.totalBudgeted !== 'number' || metrics.totalBudgeted < 0) {
      errors.push('Le budget total est invalide');
    }
    if (typeof metrics.totalActual !== 'number' || metrics.totalActual < 0) {
      errors.push('Le réalisé total est invalide');
    }
    if (!Array.isArray(metrics.budgetItems)) {
      errors.push('La liste des catégories est invalide');
    }
    if (!Array.isArray(metrics.departmentBreakdown)) {
      errors.push('La ventilation par département est invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formate le montant en FCFA
   */
  static formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  /**
   * Détermine le statut basé sur le pourcentage de variance
   */
  static getVarianceStatus(variancePercent: number): "on-track" | "warning" | "critical" | "completed" {
    if (Math.abs(variancePercent) <= 10) return "on-track";
    if (Math.abs(variancePercent) <= 20) return "warning";
    if (Math.abs(variancePercent) > 20) return "critical";
    return "on-track";
  }
}
