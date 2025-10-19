import { Injectable } from '@nestjs/common';

/**
 * Service de prévisionnel de trésorerie
 */
@Injectable()
export class CashFlowForecastService {
  
  /**
   * Génère le prévisionnel sur N jours
   */
  async generateForecast(companyId: string, days: number = 90): Promise<any[]> {
    const forecast = [];
    const today = new Date();
    let runningBalance = await this.getCurrentBalance(companyId);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const inflows = await this.getExpectedInflows(companyId, date);
      const outflows = await this.getExpectedOutflows(companyId, date);
      
      const netFlow = inflows - outflows;
      runningBalance += netFlow;

      forecast.push({
        date: date.toISOString().split('T')[0],
        inflows,
        outflows,
        netFlow,
        balance: runningBalance,
        status: this.getStatus(runningBalance)
      });
    }

    return forecast;
  }

  /**
   * Calcule les encaissements prévus
   */
  private async getExpectedInflows(companyId: string, date: Date): Promise<number> {
    let total = 0;

    // Factures clients à échéance
    const invoices = await this.getInvoicesDueOn(companyId, date);
    total += invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

    // Revenus récurrents (abonnements)
    const recurring = await this.getRecurringRevenue(companyId, date);
    total += recurring;

    return total;
  }

  /**
   * Calcule les décaissements prévus
   */
  private async getExpectedOutflows(companyId: string, date: Date): Promise<number> {
    let total = 0;

    // Factures fournisseurs à échéance
    const bills = await this.getBillsDueOn(companyId, date);
    total += bills.reduce((sum, bill) => sum + bill.remainingAmount, 0);

    // Charges fixes (salaires, loyers, etc.)
    const fixedCosts = await this.getFixedCosts(companyId, date);
    total += fixedCosts;

    // Prélèvements programmés
    const directDebits = await this.getDirectDebits(companyId, date);
    total += directDebits;

    return total;
  }

  /**
   * Analyse les scenarii (optimiste, réaliste, pessimiste)
   */
  async analyzeScenarios(companyId: string, days: number = 90): Promise<any> {
    const realistic = await this.generateForecast(companyId, days);
    
    const optimistic = realistic.map(day => ({
      ...day,
      inflows: day.inflows * 1.2, // +20% encaissements
      outflows: day.outflows * 0.9, // -10% décaissements
      balance: day.balance * 1.15
    }));

    const pessimistic = realistic.map(day => ({
      ...day,
      inflows: day.inflows * 0.8, // -20% encaissements
      outflows: day.outflows * 1.1, // +10% décaissements
      balance: day.balance * 0.85
    }));

    return {
      realistic,
      optimistic,
      pessimistic,
      alerts: this.generateAlerts(realistic)
    };
  }

  /**
   * Génère des alertes trésorerie
   */
  private generateAlerts(forecast: any[]): any[] {
    const alerts = [];

    // Alerte solde négatif
    const negativeBalances = forecast.filter(day => day.balance < 0);
    if (negativeBalances.length > 0) {
      alerts.push({
        type: 'danger',
        title: 'Risque de découvert',
        message: `Solde négatif prévu le ${negativeBalances[0].date}`,
        date: negativeBalances[0].date
      });
    }

    // Alerte solde faible
    const lowBalances = forecast.filter(day => day.balance < 100000 && day.balance > 0);
    if (lowBalances.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Trésorerie faible',
        message: `Solde inférieur à 100K FCFA le ${lowBalances[0].date}`,
        date: lowBalances[0].date
      });
    }

    return alerts;
  }

  /**
   * Recommandations d'actions
   */
  async getRecommendations(companyId: string): Promise<any[]> {
    const forecast = await this.generateForecast(companyId, 30);
    const recommendations = [];

    const minBalance = Math.min(...forecast.map(d => d.balance));
    
    if (minBalance < 0) {
      recommendations.push({
        priority: 'high',
        action: 'Relancer les clients en retard',
        impact: 'Améliorer les encaissements',
        urgency: 'Immédiate'
      });
      
      recommendations.push({
        priority: 'high',
        action: 'Négocier délais de paiement fournisseurs',
        impact: 'Reporter les décaissements',
        urgency: 'Cette semaine'
      });
    }

    return recommendations;
  }

  // Méthodes helper (à implémenter avec vraies données)
  private async getCurrentBalance(companyId: string): Promise<number> {
    return 5000000; // Mock
  }

  private async getInvoicesDueOn(companyId: string, date: Date): Promise<any[]> {
    return []; // Mock
  }

  private async getRecurringRevenue(companyId: string, date: Date): Promise<number> {
    return 0; // Mock
  }

  private async getBillsDueOn(companyId: string, date: Date): Promise<any[]> {
    return []; // Mock
  }

  private async getFixedCosts(companyId: string, date: Date): Promise<number> {
    return 0; // Mock
  }

  private async getDirectDebits(companyId: string, date: Date): Promise<number> {
    return 0; // Mock
  }

  private getStatus(balance: number): string {
    if (balance < 0) return 'critical';
    if (balance < 100000) return 'warning';
    return 'healthy';
  }
}
