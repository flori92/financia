import { apiGet, apiPost, getCompanyId } from "@/lib/api";

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  currency: string;
  status: "Connecté" | "Manuel";
  lastUpdated: string;
  trend?: number;
}

export interface TreasuryForecast {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  confidence?: number;
}

export interface TreasuryMetrics {
  totalBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  runway: number;
  criticalThreshold: number;
  warningThreshold: number;
  accounts: BankAccount[];
  forecast: TreasuryForecast[];
  alerts: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
}

export class TreasuryService {
  /**
   * Récupère les métriques de trésorerie
   */
  static async getTreasuryMetrics(companyId?: string, period?: string): Promise<TreasuryMetrics> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiGet(`/api/v1/treasury/metrics`, { 
        companyId: cid, 
        period: period || '30' 
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des métriques de trésorerie:', error);
      return this.getMockMetrics();
    }
  }

  /**
   * Récupère les prévisions de trésorerie
   */
  static async getTreasuryForecast(companyId?: string, horizon?: number): Promise<TreasuryForecast[]> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiGet(`/api/v1/treasury/forecast`, { 
        companyId: cid, 
        horizon: horizon || 30 
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des prévisions:', error);
      return this.getMockForecast();
    }
  }

  /**
   * Crée un nouveau compte bancaire
   */
  static async createBankAccount(accountData: Partial<BankAccount>, companyId?: string): Promise<BankAccount> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/treasury/accounts`, {
        ...accountData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du compte bancaire:', error);
      throw error;
    }
  }

  /**
   * Effectue un virement bancaire
   */
  static async makeTransfer(transferData: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
  }, companyId?: string): Promise<{ success: boolean; reference: string }> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/treasury/transfer`, {
        ...transferData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du virement:', error);
      throw error;
    }
  }

  /**
   * Exporte les données de trésorerie en CSV
   */
  static async exportTreasuryData(companyId?: string, period?: string): Promise<Blob> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/treasury/export`, {
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
      console.error('Erreur lors de l\'export des données de trésorerie:', error);
      throw error;
    }
  }

  /**
   * Récupère les alertes de trésorerie
   */
  static async getTreasuryAlerts(companyId?: string): Promise<TreasuryMetrics['alerts']> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiGet(`/api/v1/treasury/alerts`, { companyId: cid });
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      return [];
    }
  }

  /**
   * Calcule le runway (jours de trésorerie disponible)
   */
  static calculateRunway(
    currentBalance: number, 
    monthlyBurnRate: number, 
    monthlyInflow: number = 0
  ): number {
    const netBurnRate = monthlyBurnRate - monthlyInflow;
    if (netBurnRate <= 0) {
      return 999; // Infini si pas de burn rate
    }
    return Math.floor(currentBalance / netBurnRate * 30);
  }

  /**
   * Données mockées pour fallback
   */
  private static getMockMetrics(): TreasuryMetrics {
    return {
      totalBalance: 2500000,
      totalInflow: 1800000,
      totalOutflow: 1200000,
      netCashFlow: 600000,
      runway: 45,
      criticalThreshold: 1000000,
      warningThreshold: 2000000,
      accounts: [
        {
          id: "1",
          name: "Compte Principal",
          bank: "ECOBANK",
          balance: 1500000,
          currency: "FCFA",
          status: "Connecté",
          lastUpdated: "2024-11-03T10:30:00Z",
          trend: 5.2
        },
        {
          id: "2", 
          name: "Compte Secondaire",
          bank: "UBA",
          balance: 1000000,
          currency: "FCFA",
          status: "Manuel",
          lastUpdated: "2024-11-03T09:15:00Z",
          trend: -2.1
        }
      ],
      forecast: [
        { date: "Sem 1", inflow: 450000, outflow: 300000, balance: 2650000, confidence: 95 },
        { date: "Sem 2", inflow: 380000, outflow: 350000, balance: 2680000, confidence: 90 },
        { date: "Sem 3", inflow: 520000, outflow: 400000, balance: 2800000, confidence: 85 },
        { date: "Sem 4", inflow: 450000, outflow: 380000, balance: 2870000, confidence: 80 }
      ],
      alerts: [
        {
          type: "warning",
          title: "Runway faible",
          message: "Votre trésorerie couvre seulement 45 jours d'exploitation",
          action: {
            label: "Voir les solutions",
            onClick: () => console.log("Solutions de trésorerie")
          }
        }
      ]
    };
  }

  private static getMockForecast(): TreasuryForecast[] {
    return [
      { date: "Sem 1", inflow: 450000, outflow: 300000, balance: 2650000, confidence: 95 },
      { date: "Sem 2", inflow: 380000, outflow: 350000, balance: 2680000, confidence: 90 },
      { date: "Sem 3", inflow: 520000, outflow: 400000, balance: 2800000, confidence: 85 },
      { date: "Sem 4", inflow: 450000, outflow: 380000, balance: 2870000, confidence: 80 }
    ];
  }

  /**
   * Valide les données de trésorerie
   */
  static validateMetrics(metrics: TreasuryMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof metrics.totalBalance !== 'number' || metrics.totalBalance < 0) {
      errors.push('Le solde total est invalide');
    }
    if (typeof metrics.runway !== 'number' || metrics.runway < 0) {
      errors.push('Le runway est invalide');
    }
    if (!Array.isArray(metrics.accounts)) {
      errors.push('La liste des comptes est invalide');
    }
    if (!Array.isArray(metrics.forecast)) {
      errors.push('Les prévisions sont invalides');
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
   * Détermine le niveau d'alerte basé sur le runway
   */
  static getAlertLevel(runway: number, criticalThreshold: number, warningThreshold: number): 'critical' | 'warning' | 'info' {
    if (runway < criticalThreshold) return 'critical';
    if (runway < warningThreshold) return 'warning';
    return 'info';
  }
}
