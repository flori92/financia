import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { BankAccount } from '../../banking/entities/bank-account.entity';
import { Budget } from '../../budget/entities/budget.entity';
import { DirectDebitService } from '../../treasury/services/direct-debit.service';

/**
 * Service de prévisionnel de trésorerie
 */
@Injectable()
export class CashFlowForecastService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    private directDebitService: DirectDebitService,
  ) {}
  
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

  // Méthodes helper (implémentation réelle avec TypeORM)
  
  /**
   * Récupère le solde bancaire actuel réel
   */
  private async getCurrentBalance(companyId: string): Promise<number> {
    const accounts = await this.bankAccountRepository.find({
      where: { companyId, isActive: true },
      select: ['id', 'openingBalance'],
    });

    if (accounts.length === 0) {
      // Si aucun compte, retourner 0 plutôt qu'une erreur
      return 0;
    }

    // Pour l'instant, utiliser openingBalance
    // TODO: Calculer solde réel = openingBalance + sum(transactions)
    return accounts.reduce((sum, account) => sum + Number(account.openingBalance || 0), 0);
  }

  /**
   * Récupère les factures clients à échéance à une date donnée
   */
  private async getInvoicesDueOn(companyId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await this.invoiceRepository.find({
      where: {
        companyId,
        invoiceType: 'sales', // Factures de vente = encaissements
        dueDate: Between(startOfDay, endOfDay),
        paymentStatus: 'unpaid', // Ou 'partially_paid'
      },
      select: ['id', 'invoiceNumber', 'outstandingAmount', 'dueDate'],
    });

    return invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      remainingAmount: Number(inv.outstandingAmount || 0),
      dueDate: inv.dueDate,
    }));
  }

  /**
   * Calcule les revenus récurrents (abonnements) prévus
   */
  private async getRecurringRevenue(companyId: string, date: Date): Promise<number> {
    // Recherche dans budget les lignes de revenus (comptes classe 7)
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const budgetLines = await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.lines', 'line')
      .where('budget.companyId = :companyId', { companyId })
      .andWhere('budget.year = :year', { year })
      .andWhere('line.month = :month', { month })
      .andWhere('line.accountNumber LIKE :pattern', { pattern: '7%' }) // Comptes de produits
      .getMany();

    if (budgetLines.length === 0) return 0;

    // Somme des montants planifiés pour ce mois
    let total = 0;
    for (const budget of budgetLines) {
      for (const line of budget.lines || []) {
        if (line.accountNumber && line.accountNumber.startsWith('7')) {
          total += Number(line.plannedAmount || 0);
        }
      }
    }

    return total;
  }

  /**
   * Récupère les factures fournisseurs à échéance à une date donnée
   */
  private async getBillsDueOn(companyId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bills = await this.invoiceRepository.find({
      where: {
        companyId,
        invoiceType: 'purchase', // Factures d'achat = décaissements
        dueDate: Between(startOfDay, endOfDay),
        paymentStatus: 'unpaid',
      },
      select: ['id', 'invoiceNumber', 'outstandingAmount', 'dueDate'],
    });

    return bills.map(bill => ({
      id: bill.id,
      invoiceNumber: bill.invoiceNumber,
      remainingAmount: Number(bill.outstandingAmount || 0),
      dueDate: bill.dueDate,
    }));
  }

  /**
   * Calcule les charges fixes mensuelles (salaires, loyers, etc.)
   */
  private async getFixedCosts(companyId: string, date: Date): Promise<number> {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Les charges fixes sont généralement payées en début de mois (jour 1-5)
    if (day > 5) return 0;

    const budgetLines = await this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.lines', 'line')
      .where('budget.companyId = :companyId', { companyId })
      .andWhere('budget.year = :year', { year })
      .andWhere('line.month = :month', { month })
      .andWhere('line.accountNumber LIKE :pattern', { pattern: '6%' }) // Comptes de charges
      .getMany();

    if (budgetLines.length === 0) return 0;

    // Somme des charges fixes planifiées pour ce mois
    let total = 0;
    for (const budget of budgetLines) {
      for (const line of budget.lines || []) {
        if (line.accountNumber && line.accountNumber.startsWith('6')) {
          total += Number(line.plannedAmount || 0);
        }
      }
    }

    return total;
  }

  /**
   * Récupère les prélèvements automatiques programmés
   */
  private async getDirectDebits(companyId: string, date: Date): Promise<number> {
    const directDebits = await this.directDebitService.getDirectDebitsForDate(companyId, date);
    return directDebits.reduce((sum, dd) => sum + Number(dd.amount || 0), 0);
  }

  private getStatus(balance: number): string {
    if (balance < 0) return 'critical';
    if (balance < 100000) return 'warning';
    return 'healthy';
  }
}
