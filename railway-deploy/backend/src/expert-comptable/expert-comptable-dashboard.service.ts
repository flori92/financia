import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class ExpertComptableDashboardService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  /**
   * Récupère les métriques du dashboard Expert Comptable
   */
  async getDashboardMetrics(userId: string): Promise<any> {
    try {
      // KPIs principaux
      const [
        companiesManaged,
        pendingEntries,
        upcomingDeclarations,
        globalTreasury,
        recentAlerts,
        companiesPerformance,
      ] = await Promise.all([
        this.getCompaniesManaged(userId),
        this.getPendingEntries(userId),
        this.getUpcomingDeclarations(userId),
        this.getGlobalTreasury(userId),
        this.getRecentAlerts(userId),
        this.getCompaniesPerformance(userId),
      ]);

      return {
        kpis: {
          companiesManaged,
          pendingEntries,
          upcomingDeclarations,
          globalTreasury,
        },
        alerts: recentAlerts,
        companiesPerformance,
        evolutionChart: await this.getEvolutionChart(userId),
        topCompanies: await this.getTopCompanies(userId),
      };
    } catch (error) {
      console.error('[ExpertComptableDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Nombre de sociétés gérées par l'expert comptable
   */
  private async getCompaniesManaged(userId: string): Promise<number> {
    try {
      // Pour l'instant, retourner un compte simple
      // TODO: Implémenter la relation expert-comptable <-> sociétés
      const companies = await this.companyRepository.count();
      return companies;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Écritures comptables en attente de validation
   */
  private async getPendingEntries(userId: string): Promise<number> {
    try {
      const count = await this.journalEntryRepository.count({
        where: { status: 'draft' },
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Déclarations fiscales à venir (30 prochains jours)
   */
  private async getUpcomingDeclarations(userId: string): Promise<number> {
    try {
      // TODO: Implémenter le système de déclarations fiscales
      // Pour l'instant, retourner une valeur simulée
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      
      // Simuler 3-5 déclarations à venir
      return 4;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Solde de trésorerie global de toutes les sociétés
   */
  private async getGlobalTreasury(userId: string): Promise<number> {
    try {
      // Récupérer les comptes de trésorerie (classe 5)
      const treasuryAccounts = await this.accountRepository.find({
        where: { accountNumber: { $like: '5%' } as any },
      });

      let totalTreasury = 0;
      
      for (const account of treasuryAccounts) {
        const entries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .select('line.debit', 'debit')
          .addSelect('line.credit', 'credit')
          .getRawMany();

        const balance = entries.reduce((sum, e) => sum + (e.debit - e.credit), 0);
        totalTreasury += balance;
      }

      return totalTreasury;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Alertes récentes (anomalies, retards, etc.)
   */
  private async getRecentAlerts(userId: string): Promise<any[]> {
    const alerts = [];

    try {
      // Alerte: Écritures déséquilibrées
      const unbalancedEntries = await this.journalEntryRepository
        .createQueryBuilder('entry')
        .leftJoin('entry.lines', 'line')
        .select('entry.id', 'id')
        .addSelect('SUM(line.debit)', 'totalDebit')
        .addSelect('SUM(line.credit)', 'totalCredit')
        .where('entry.status = :status', { status: 'draft' })
        .groupBy('entry.id')
        .having('ABS(SUM(line.debit) - SUM(line.credit)) > 0.01')
        .getRawMany();

      if (unbalancedEntries.length > 0) {
        alerts.push({
          type: 'danger',
          title: 'Écritures déséquilibrées',
          message: `${unbalancedEntries.length} écriture(s) avec débit ≠ crédit`,
        });
      }

      // Alerte: Écritures en attente depuis plus de 7 jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const oldDraftEntries = await this.journalEntryRepository.count({
        where: {
          status: 'draft',
          createdAt: { $lte: sevenDaysAgo } as any,
        },
      });

      if (oldDraftEntries > 0) {
        alerts.push({
          type: 'warning',
          title: 'Écritures en attente',
          message: `${oldDraftEntries} écriture(s) en brouillon depuis plus de 7 jours`,
        });
      }

      // Alerte de succès si rien de critique
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Situation saine',
          message: 'Aucune alerte critique détectée',
        });
      }
    } catch (error) {
      console.error('[ExpertComptableDashboard] Erreur getRecentAlerts:', error);
    }

    return alerts;
  }

  /**
   * Performance des sociétés gérées
   */
  private async getCompaniesPerformance(userId: string): Promise<any[]> {
    try {
      const companies = await this.companyRepository.find({ take: 10 });
      
      const performance = [];
      for (const company of companies) {
        // Calculer CA et résultat du mois pour chaque société
        const metrics = await this.getCompanyMonthMetrics(company.id);
        performance.push({
          name: company.name,
          revenue: metrics.revenue,
          netIncome: metrics.netIncome,
          status: metrics.netIncome >= 0 ? 'positive' : 'negative',
        });
      }

      return performance;
    } catch (error) {
      return [];
    }
  }

  /**
   * Métriques du mois pour une société
   */
  private async getCompanyMonthMetrics(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Récupérer les comptes de produits (classe 7) et charges (classe 6)
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
          .andWhere('entry.entry_date >= :start', { start: startOfMonth })
          .andWhere('entry.entry_date <= :end', { end: endOfMonth })
          .select('line.credit', 'credit')
          .getRawMany();

        revenue += entries.reduce((sum, e) => sum + e.credit, 0);
      }

      // Calculer charges
      for (const account of expenseAccounts) {
        const entries = await this.journalEntryRepository
          .createQueryBuilder('entry')
          .leftJoin('entry.lines', 'line')
          .where('line.account_id = :accountId', { accountId: account.id })
          .andWhere('entry.status = :status', { status: 'posted' })
          .andWhere('entry.entry_date >= :start', { start: startOfMonth })
          .andWhere('entry.entry_date <= :end', { end: endOfMonth })
          .select('line.debit', 'debit')
          .getRawMany();

        expenses += entries.reduce((sum, e) => sum + e.debit, 0);
      }

      return {
        revenue,
        expenses,
        netIncome: revenue - expenses,
      };
    } catch (error) {
      return { revenue: 0, expenses: 0, netIncome: 0 };
    }
  }

  /**
   * Graphique d'évolution multi-sociétés (12 derniers mois)
   */
  private async getEvolutionChart(userId: string): Promise<any[]> {
    const chart = [];
    const today = new Date();

    try {
      for (let i = 11; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = month.toLocaleDateString('fr-FR', { 
          month: 'short', 
          year: '2-digit' 
        });

        // Agréger les métriques de toutes les sociétés pour ce mois
        const companies = await this.companyRepository.find();
        let totalRevenue = 0;
        let totalExpenses = 0;

        for (const company of companies) {
          const start = new Date(month.getFullYear(), month.getMonth(), 1);
          const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
          const metrics = await this.getCompanyMonthMetrics(company.id);
          totalRevenue += metrics.revenue;
          totalExpenses += metrics.expenses;
        }

        chart.push({
          month: monthStr,
          revenue: totalRevenue,
          expenses: totalExpenses,
          netIncome: totalRevenue - totalExpenses,
        });
      }
    } catch (error) {
      console.error('[ExpertComptableDashboard] Erreur getEvolutionChart:', error);
    }

    return chart;
  }

  /**
   * Top 5 sociétés par CA
   */
  private async getTopCompanies(userId: string): Promise<any[]> {
    try {
      const companies = await this.companyRepository.find();
      const companiesWithRevenue = [];

      for (const company of companies) {
        const metrics = await this.getCompanyMonthMetrics(company.id);
        companiesWithRevenue.push({
          name: company.name,
          revenue: metrics.revenue,
          netIncome: metrics.netIncome,
        });
      }

      // Trier par CA décroissant et prendre le top 5
      return companiesWithRevenue
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
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
        companiesManaged: 0,
        pendingEntries: 0,
        upcomingDeclarations: 0,
        globalTreasury: 0,
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données',
        },
      ],
      companiesPerformance: [],
      evolutionChart: [],
      topCompanies: [],
    };
  }
}
