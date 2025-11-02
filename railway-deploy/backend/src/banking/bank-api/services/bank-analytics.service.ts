import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { BankAccount } from '../entities/bank-account.entity';

interface AnalyticsData {
  totalTransactions: number;
  totalAmount: number;
  averageTransaction: number;
  topCategories: Array<{ category: string; count: number; amount: number }>;
  monthlyTrend: Array<{ month: string; count: number; amount: number }>;
  riskScore: number;
}

@Injectable()
export class BankAnalyticsService {
  private readonly logger = new Logger(BankAnalyticsService.name);

  constructor(
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepo: Repository<BankTransaction>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>
  ) {}

  async getAccountAnalytics(accountId: string, period: '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const endDate = new Date();
    const startDate = this.getStartDate(period);

    try {
      const transactions = await this.bankTransactionRepo.find({
        where: {
          accountId,
          date: Between(startDate, endDate)
        }
      });

      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const averageTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

      // Analyse par catégories
      const categoryMap = new Map<string, { count: number; amount: number }>();
      transactions.forEach(tx => {
        const category = tx.category || 'Non catégorisé';
        const current = categoryMap.get(category) || { count: 0, amount: 0 };
        categoryMap.set(category, {
          count: current.count + 1,
          amount: current.amount + Math.abs(tx.amount)
        });
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      // Tendance mensuelle
      const monthlyTrend = this.calculateMonthlyTrend(transactions);

      // Calcul du score de risque
      const riskScore = this.calculateRiskScore(transactions);

      this.logger.log(`Analytics générées pour compte ${accountId}: ${totalTransactions} transactions`);

      return {
        totalTransactions,
        totalAmount,
        averageTransaction,
        topCategories,
        monthlyTrend,
        riskScore
      };
    } catch (error) {
      this.logger.error(`Erreur génération analytics: ${error.message}`);
      throw error;
    }
  }

  async getSpendingInsights(accountId: string): Promise<{
    topExpenseCategories: Array<{ category: string; amount: number; percentage: number }>;
    unusualSpending: Array<{ date: Date; description: string; amount: number; reason: string }>;
    savingsOpportunities: Array<{ category: string; potentialSavings: number; recommendation: string }>;
  }> {
    const analytics = await this.getAccountAnalytics(accountId, '90d');
    
    // Top catégories de dépenses
    const topExpenseCategories = analytics.topCategories
      .filter(cat => cat.category !== 'Non catégorisé')
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        percentage: Math.round((cat.amount / analytics.totalAmount) * 100)
      }));

    // Dépenses inhabituelles
    const unusualSpending = await this.findUnusualSpending(accountId);

    // Opportunities d'économie
    const savingsOpportunities = this.identifySavingsOpportunities(analytics);

    return {
      topExpenseCategories,
      unusualSpending,
      savingsOpportunities
    };
  }

  async generateCashFlowReport(accountId: string, period: '30d' | '90d' | '1y' = '90d'): Promise<{
    openingBalance: number;
    closingBalance: number;
    netCashFlow: number;
    inflows: number;
    outflows: number;
    dailyAverages: {
      averageInflow: number;
      averageOutflow: number;
      netDailyAverage: number;
    };
  }> {
    const endDate = new Date();
    const startDate = this.getStartDate(period);

    const transactions = await this.bankTransactionRepo.find({
      where: {
        accountId,
        date: Between(startDate, endDate)
      }
    });

    const inflows = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const outflows = Math.abs(transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0));

    const netCashFlow = inflows - outflows;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      openingBalance: 0, // À calculer depuis le solde précédent
      closingBalance: netCashFlow,
      netCashFlow,
      inflows,
      outflows,
      dailyAverages: {
        averageInflow: inflows / days,
        averageOutflow: outflows / days,
        netDailyAverage: netCashFlow / days
      }
    };
  }

  private getStartDate(period: '30d' | '90d' | '1y'): Date {
    const now = new Date();
    switch (period) {
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateMonthlyTrend(transactions: BankTransaction[]): Array<{ month: string; count: number; amount: number }> {
    const monthlyMap = new Map<string, { count: number; amount: number }>();

    transactions.forEach(tx => {
      const month = tx.date.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyMap.get(month) || { count: 0, amount: 0 };
      monthlyMap.set(month, {
        count: current.count + 1,
        amount: current.amount + Math.abs(tx.amount)
      });
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateRiskScore(transactions: BankTransaction[]): number {
    // Score de risque basé sur plusieurs facteurs
    let riskScore = 0;

    // Volume de transactions élevé
    if (transactions.length > 1000) riskScore += 20;
    else if (transactions.length > 500) riskScore += 10;

    // Montants inhabituels
    const unusualAmounts = transactions.filter(tx => Math.abs(tx.amount) > 10000).length;
    riskScore += Math.min(unusualAmounts * 5, 30);

    // Fréquence de transactions (plusieurs par jour peut être suspect)
    const dailyFrequency = new Map<string, number>();
    transactions.forEach(tx => {
      const day = tx.date.toISOString().slice(0, 10);
      dailyFrequency.set(day, (dailyFrequency.get(day) || 0) + 1);
    });

    const highFrequencyDays = Array.from(dailyFrequency.values()).filter(count => count > 20).length;
    riskScore += Math.min(highFrequencyDays * 10, 25);

    // Variance des montants
    const amounts = transactions.map(tx => Math.abs(tx.amount));
    const variance = this.calculateVariance(amounts);
    if (variance > 1000000) riskScore += 25;

    return Math.min(riskScore, 100);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private async findUnusualSpending(accountId: string): Promise<Array<{ date: Date; description: string; amount: number; reason: string }>> {
    // Implémentation simple de détection de dépenses inhabituelles
    const transactions = await this.bankTransactionRepo.find({
      where: { accountId },
      order: { date: 'DESC' },
      take: 100
    });

    const amounts = transactions.map(tx => Math.abs(tx.amount));
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const threshold = mean * 3; // 3x la moyenne

    return transactions
      .filter(tx => Math.abs(tx.amount) > threshold)
      .slice(0, 5)
      .map(tx => ({
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        reason: 'Montant significativement supérieur à la moyenne'
      }));
  }

  private identifySavingsOpportunities(analytics: AnalyticsData): Array<{ category: string; potentialSavings: number; recommendation: string }> {
    const opportunities = [];

    // Catégories avec dépenses élevées
    const highSpendingCategories = analytics.topCategories
      .filter(cat => cat.amount > analytics.totalAmount * 0.2)
      .slice(0, 3);

    highSpendingCategories.forEach(category => {
      opportunities.push({
        category: category.category,
        potentialSavings: Math.round(category.amount * 0.1), // 10% d'économie potentielle
        recommendation: `Considérez réduire les dépenses dans la catégorie ${category.category} de 10%`
      });
    });

    return opportunities;
  }
}
