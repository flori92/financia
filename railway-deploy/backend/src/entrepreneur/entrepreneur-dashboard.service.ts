import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class EntrepreneurDashboardService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  /**
   * Récupère les métriques du dashboard Entrepreneur
   */
  async getDashboardMetrics(companyId: string): Promise<any> {
    try {
      const [
        revenueVsTarget,
        cashflowRunway,
        profitability,
        burnRate,
        growthMetrics,
        alerts,
      ] = await Promise.all([
        this.getRevenueVsTarget(companyId),
        this.getCashflowRunway(companyId),
        this.getProfitability(companyId),
        this.getBurnRate(companyId),
        this.getGrowthMetrics(companyId),
        this.getStrategicAlerts(companyId),
      ]);

      return {
        kpis: {
          revenueVsTarget,
          cashflowRunway,
          profitability,
          burnRate,
        },
        growthMetrics,
        alerts,
        evolutionChart: await this.getEvolutionChart(companyId),
        productAnalysis: await this.getProductAnalysis(companyId),
      };
    } catch (error) {
      console.error('[EntrepreneurDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * CA vs Objectifs (% réalisation)
   */
  private async getRevenueVsTarget(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Calculer le CA du mois
      const revenueAccounts = await this.accountRepository.find({
        where: { accountNumber: { $like: '7%' } as any, companyId },
      });

      let actualRevenue = 0;
      for (const account of revenueAccounts) {
        const entries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .andWhere('entry.entry_date >= :start', { start: startOfMonth })
          .andWhere('entry.entry_date <= :end', { end: endOfMonth })
          .select('SUM(line.credit)', 'total')
          .getRawOne();

        actualRevenue += Number(entries?.total || 0);
      }

      // Objectif simulé : 100 000 000 FCFA/mois
      // TODO: Récupérer depuis les objectifs de l'entreprise
      const targetRevenue = 100000000;
      const achievementRate = targetRevenue > 0 ? (actualRevenue / targetRevenue) * 100 : 0;

      return {
        actual: actualRevenue,
        target: targetRevenue,
        achievementRate: Math.round(achievementRate * 10) / 10,
        status: achievementRate >= 100 ? 'achieved' : achievementRate >= 80 ? 'on-track' : 'at-risk',
      };
    } catch (error) {
      return { actual: 0, target: 0, achievementRate: 0, status: 'unknown' };
    }
  }

  /**
   * Cash-flow runway (mois restants)
   */
  private async getCashflowRunway(companyId: string): Promise<any> {
    try {
      // Calculer la trésorerie actuelle (comptes classe 5)
      const treasuryAccounts = await this.accountRepository.find({
        where: { accountNumber: { $like: '5%' } as any, companyId },
      });

      let currentCash = 0;
      for (const account of treasuryAccounts) {
        const entries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .select('SUM(line.debit - line.credit)', 'balance')
          .getRawOne();

        currentCash += Number(entries?.balance || 0);
      }

      // Calculer le burn rate mensuel moyen (3 derniers mois)
      const burnRate = await this.getBurnRate(companyId);
      const monthlyBurn = burnRate.monthlyAverage;

      // Calculer le runway
      const runway = monthlyBurn > 0 ? currentCash / monthlyBurn : 999;

      return {
        currentCash,
        monthlyBurn,
        runwayMonths: Math.round(runway * 10) / 10,
        status: runway < 3 ? 'critical' : runway < 6 ? 'warning' : 'healthy',
      };
    } catch (error) {
      return { currentCash: 0, monthlyBurn: 0, runwayMonths: 0, status: 'unknown' };
    }
  }

  /**
   * Profitabilité (EBITDA, marges nettes et brutes)
   */
  private async getProfitability(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Produits (classe 7)
      const revenueAccounts = await this.accountRepository.find({
        where: { accountNumber: { $like: '7%' } as any, companyId },
      });

      let revenue = 0;
      for (const account of revenueAccounts) {
        const entries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .andWhere('entry.entry_date >= :start', { start: startOfMonth })
          .andWhere('entry.entry_date <= :end', { end: endOfMonth })
          .select('SUM(line.credit)', 'total')
          .getRawOne();

        revenue += Number(entries?.total || 0);
      }

      // Charges (classe 6)
      const expenseAccounts = await this.accountRepository.find({
        where: { accountNumber: { $like: '6%' } as any, companyId },
      });

      let expenses = 0;
      for (const account of expenseAccounts) {
        const entries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .andWhere('entry.entry_date >= :start', { start: startOfMonth })
          .andWhere('entry.entry_date <= :end', { end: endOfMonth })
          .select('SUM(line.debit)', 'total')
          .getRawOne();

        expenses += Number(entries?.total || 0);
      }

      const netIncome = revenue - expenses;
      const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
      const grossMargin = revenue > 0 ? ((revenue - (expenses * 0.6)) / revenue) * 100 : 0; // Estimation

      return {
        revenue,
        expenses,
        netIncome,
        netMargin: Math.round(netMargin * 10) / 10,
        grossMargin: Math.round(grossMargin * 10) / 10,
        ebitda: netIncome * 1.15, // Estimation simplifiée
      };
    } catch (error) {
      return { revenue: 0, expenses: 0, netIncome: 0, netMargin: 0, grossMargin: 0, ebitda: 0 };
    }
  }

  /**
   * Burn rate mensuel
   */
  private async getBurnRate(companyId: string): Promise<any> {
    try {
      const months = [];
      const now = new Date();

      for (let i = 0; i < 3; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(month.getFullYear(), month.getMonth(), 1);
        const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        // Charges du mois
        const expenseAccounts = await this.accountRepository.find({
          where: { accountNumber: { $like: '6%' } as any, companyId },
        });

        let monthExpenses = 0;
        for (const account of expenseAccounts) {
          const entries = await this.journalEntryRepository
            .createQueryBuilder('entry')
            .leftJoin('entry.lines', 'line')
            .where('line.account_id = :accountId', { accountId: account.id })
            .andWhere('entry.status = :status', { status: 'posted' })
            .andWhere('entry.entry_date >= :start', { start })
            .andWhere('entry.entry_date <= :end', { end })
            .select('SUM(line.debit)', 'total')
            .getRawOne();

          monthExpenses += Number(entries?.total || 0);
        }

        months.push(monthExpenses);
      }

      const average = months.reduce((a, b) => a + b, 0) / months.length;

      return {
        monthlyAverage: average,
        lastMonth: months[0],
        trend: months[0] > months[1] ? 'increasing' : 'decreasing',
      };
    } catch (error) {
      return { monthlyAverage: 0, lastMonth: 0, trend: 'stable' };
    }
  }

  /**
   * Métriques de croissance
   */
  private async getGrowthMetrics(companyId: string): Promise<any> {
    try {
      // Comparer le mois en cours vs le même mois l'année dernière
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastYearMonthStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const lastYearMonthEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);

      const revenueAccounts = await this.accountRepository.find({
        where: { accountNumber: { $like: '7%' } as any, companyId },
      });

      let currentRevenue = 0;
      let lastYearRevenue = 0;

      for (const account of revenueAccounts) {
        // Mois en cours
        const currentEntries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .andWhere('entry.entry_date >= :start', { start: currentMonthStart })
          .andWhere('entry.entry_date <= :end', { end: currentMonthEnd })
          .select('SUM(line.credit)', 'total')
          .getRawOne();

        currentRevenue += Number(currentEntries?.total || 0);

        // Année dernière
        const lastYearEntries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .andWhere('entry.entry_date >= :start', { start: lastYearMonthStart })
          .andWhere('entry.entry_date <= :end', { end: lastYearMonthEnd })
          .select('SUM(line.credit)', 'total')
          .getRawOne();

        lastYearRevenue += Number(lastYearEntries?.total || 0);
      }

      const growthRate = lastYearRevenue > 0 
        ? ((currentRevenue - lastYearRevenue) / lastYearRevenue) * 100 
        : 0;

      return {
        currentRevenue,
        lastYearRevenue,
        growthRate: Math.round(growthRate * 10) / 10,
        status: growthRate > 0 ? 'growing' : 'declining',
      };
    } catch (error) {
      return { currentRevenue: 0, lastYearRevenue: 0, growthRate: 0, status: 'stable' };
    }
  }

  /**
   * Alertes stratégiques
   */
  private async getStrategicAlerts(companyId: string): Promise<any[]> {
    const alerts = [];

    try {
      const runway = await this.getCashflowRunway(companyId);
      const profitability = await this.getProfitability(companyId);
      const revenueTarget = await this.getRevenueVsTarget(companyId);

      // Alerte runway critique
      if (runway.runwayMonths < 3) {
        alerts.push({
          type: 'danger',
          title: 'Trésorerie critique',
          message: `Runway de ${runway.runwayMonths} mois - Action urgente requise`,
        });
      } else if (runway.runwayMonths < 6) {
        alerts.push({
          type: 'warning',
          title: 'Trésorerie à surveiller',
          message: `Runway de ${runway.runwayMonths} mois - Prévoir levée de fonds`,
        });
      }

      // Alerte objectifs
      if (revenueTarget.achievementRate < 80) {
        alerts.push({
          type: 'warning',
          title: 'Objectifs en retard',
          message: `Réalisation à ${revenueTarget.achievementRate}% de l'objectif`,
        });
      }

      // Alerte profitabilité
      if (profitability.netMargin < 0) {
        alerts.push({
          type: 'danger',
          title: 'Perte nette',
          message: `Marge nette négative : ${profitability.netMargin.toFixed(1)}%`,
        });
      }

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Performance saine',
          message: 'Tous les indicateurs sont au vert',
        });
      }
    } catch (error) {
      console.error('[EntrepreneurDashboard] Erreur getStrategicAlerts:', error);
    }

    return alerts;
  }

  /**
   * Graphique évolution (12 derniers mois)
   */
  private async getEvolutionChart(companyId: string): Promise<any[]> {
    const chart = [];
    const now = new Date();

    try {
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(month.getFullYear(), month.getMonth(), 1);
        const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const monthStr = month.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

        const revenueAccounts = await this.accountRepository.find({
          where: { accountNumber: { $like: '7%' } as any, companyId },
        });

        const expenseAccounts = await this.accountRepository.find({
          where: { accountNumber: { $like: '6%' } as any, companyId },
        });

        let revenue = 0;
        let expenses = 0;

        // Calculer revenus
        for (const account of revenueAccounts) {
          const entries = await this.journalEntryRepository
            .createQueryBuilder('entry')
            .leftJoin('entry.lines', 'line')
            .where('line.account_id = :accountId', { accountId: account.id })
            .andWhere('entry.status = :status', { status: 'posted' })
            .andWhere('entry.entry_date >= :start', { start })
            .andWhere('entry.entry_date <= :end', { end })
            .select('SUM(line.credit)', 'total')
            .getRawOne();

          revenue += Number(entries?.total || 0);
        }

        // Calculer charges
        for (const account of expenseAccounts) {
          const entries = await this.journalEntryRepository
            .createQueryBuilder('entry')
            .leftJoin('entry.lines', 'line')
            .where('line.account_id = :accountId', { accountId: account.id })
            .andWhere('entry.status = :status', { status: 'posted' })
            .andWhere('entry.entry_date >= :start', { start })
            .andWhere('entry.entry_date <= :end', { end })
            .select('SUM(line.debit)', 'total')
            .getRawOne();

          expenses += Number(entries?.total || 0);
        }

        chart.push({
          month: monthStr,
          revenue,
          expenses,
          netIncome: revenue - expenses,
        });
      }
    } catch (error) {
      console.error('[EntrepreneurDashboard] Erreur getEvolutionChart:', error);
    }

    return chart;
  }

  /**
   * Analyse produits/services
   */
  private async getProductAnalysis(companyId: string): Promise<any[]> {
    try {
      // TODO: Implémenter l'analyse par produit/service
      // Pour l'instant, retourner une structure vide
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Métriques par défaut en cas d'erreur
   */
  private getDefaultMetrics(): any {
    return {
      kpis: {
        revenueVsTarget: { actual: 0, target: 0, achievementRate: 0, status: 'unknown' },
        cashflowRunway: { currentCash: 0, monthlyBurn: 0, runwayMonths: 0, status: 'unknown' },
        profitability: { revenue: 0, expenses: 0, netIncome: 0, netMargin: 0, grossMargin: 0, ebitda: 0 },
        burnRate: { monthlyAverage: 0, lastMonth: 0, trend: 'stable' },
      },
      growthMetrics: { currentRevenue: 0, lastYearRevenue: 0, growthRate: 0, status: 'stable' },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données',
        },
      ],
      evolutionChart: [],
      productAnalysis: [],
    };
  }
}
