import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { Account } from './entities/account.entity';

/**
 * Service pour le Dashboard Comptable avec KPI temps réel
 */
@Injectable()
export class AccountingDashboardService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLinesRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
  ) {}

  /**
   * Obtenir les métriques du dashboard comptable
   */
  async getDashboardMetrics(companyId: string): Promise<{
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
    topClients: Array<{ name: string; amount: number }>;
    topSuppliers: Array<{ name: string; amount: number }>;
    financialRatios: {
      currentAssets: number;
      currentLiabilities: number;
      equity: number;
      totalLiabilities: number;
      liquidityRatio: number;
      solvencyRatio: number;
    };
    alerts: Array<{
      type: 'warning' | 'danger' | 'info';
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
  }> {
    try {
      // Vérifier si l'entreprise a des données comptables réelles
      const totalEntries = await this.journalEntriesRepo.count({
        where: { companyId },
      });

      const postedEntries = await this.journalEntriesRepo.count({
        where: { companyId, status: 'posted' },
      });

      // Si aucune écriture ou seulement des drafts (données de test), retourner dashboard vide
      if (totalEntries === 0 || postedEntries === 0) {
        return {
          kpiMonth: { revenue: 0, expenses: 0, netIncome: 0, margin: 0 },
          evolutionChart: Array.from({ length: 12 }).map((_, i) => ({
            month: new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            revenue: 0,
            expenses: 0,
          })),
          topClients: [],
          topSuppliers: [],
          financialRatios: {
            currentAssets: 0,
            currentLiabilities: 0,
            equity: 0,
            totalLiabilities: 0,
            liquidityRatio: 0,
            solvencyRatio: 0,
          },
          alerts: [{ type: 'info', title: 'Aucune donnée', message: 'Aucune écriture comptable disponible pour le moment' }],
          recentActivity: { entries: [] },
        };
      }

      if (!companyId) throw new BadRequestException('companyId requis');

      // Calculer KPI du mois en cours
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const kpiMonth = await this.getMonthKPI(
        companyId,
        startOfMonth.toISOString().slice(0, 10),
        endOfMonth.toISOString().slice(0, 10),
      );

      // Graphique évolution 12 derniers mois
      const evolutionChart = await this.getEvolutionChart(companyId);

      // Top 5 clients
      const topClients = await this.getTopParties(companyId, '411', 5);

      // Top 5 fournisseurs
      const topSuppliers = await this.getTopParties(companyId, '401', 5);

      // Ratios financiers
      const financialRatios = await this.getFinancialRatios(companyId);

      // Alertes
      const alerts = await this.getAlerts(companyId);

      // Activité récente
      const recentActivity = await this.getRecentActivity(companyId);

      return {
        kpiMonth,
        evolutionChart,
        topClients,
        topSuppliers,
        financialRatios,
        alerts,
        recentActivity,
      };
    } catch (err) {
      // Log serveur + valeurs par défaut (évite 500)
      // eslint-disable-next-line no-console
      console.error('[Dashboard] Erreur getDashboardMetrics:', err);
      return {
        kpiMonth: { revenue: 0, expenses: 0, netIncome: 0, margin: 0 },
        evolutionChart: Array.from({ length: 12 }).map((_, i) => ({
          month: new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          revenue: 0,
          expenses: 0,
        })),
        topClients: [],
        topSuppliers: [],
        financialRatios: {
          currentAssets: 0,
          currentLiabilities: 0,
          equity: 0,
          totalLiabilities: 0,
          liquidityRatio: 0,
          solvencyRatio: 0,
        },
        alerts: [{ type: 'info', title: 'Aucune donnée', message: 'Aucune écriture comptable disponible pour le moment' }],
        recentActivity: { entries: [] },
      };
    }
  }

  /**
   * KPI du mois (CA, Charges, Résultat, Marge)
   */
  private async getMonthKPI(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    revenue: number;
    expenses: number;
    netIncome: number;
    margin: number;
  }> {
    const lines = await this.journalLinesRepo
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate >= :startDate', { startDate })
      .andWhere('entry.entryDate <= :endDate', { endDate })
      .getMany();

    let revenue = 0;
    let expenses = 0;

    for (const line of lines) {
      const accountNumber = line.account.accountNumber;
      const credit = parseFloat(String(line.credit || 0));
      const debit = parseFloat(String(line.debit || 0));

      // Produits (classe 7) : crédit
      if (accountNumber.startsWith('7')) {
        revenue += credit;
      }

      // Charges (classe 6) : débit
      if (accountNumber.startsWith('6')) {
        expenses += debit;
      }
    }

    const netIncome = revenue - expenses;
    const margin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

    return { revenue, expenses, netIncome, margin };
  }

  /**
   * Graphique évolution 12 derniers mois
   */
  private async getEvolutionChart(companyId: string): Promise<
    Array<{
      month: string;
      revenue: number;
      expenses: number;
    }>
  > {
    const result: Array<{ month: string; revenue: number; expenses: number }> =
      [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const kpi = await this.getMonthKPI(
        companyId,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
      );

      result.push({
        month: date.toLocaleDateString('fr-FR', {
          month: 'short',
          year: '2-digit',
        }),
        revenue: kpi.revenue,
        expenses: kpi.expenses,
      });
    }

    return result;
  }

  /**
   * Top N clients ou fournisseurs
   */
  private async getTopParties(
    companyId: string,
    accountNumber: string,
    limit: number,
  ): Promise<Array<{ name: string; amount: number }>> {
    const account = await this.accountsRepo.findOne({
      where: { companyId, accountNumber },
    });

    if (!account) return [];

    const lines = await this.journalLinesRepo
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .where('line.account_id = :accountId', { accountId: account.id })
      .andWhere('entry.status = :status', { status: 'posted' })
      .getMany();

    // Grouper par label (nom client/fournisseur)
    const byParty = new Map<string, number>();

    for (const line of lines) {
      const party = line.label || 'Non spécifié';
      const debit = parseFloat(String(line.debit || 0));
      const credit = parseFloat(String(line.credit || 0));

      // Pour clients (411): débit augmente, crédit diminue
      // Pour fournisseurs (401): crédit augmente, débit diminue
      const amount =
        accountNumber === '411' ? debit - credit : credit - debit;

      if (!byParty.has(party)) {
        byParty.set(party, 0);
      }
      byParty.set(party, byParty.get(party)! + amount);
    }

    // Convertir en array et trier
    const result = Array.from(byParty.entries())
      .map(([name, amount]) => ({ name, amount: Math.abs(amount) }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    return result;
  }

  /**
   * Ratios financiers (Liquidité, Solvabilité)
   */
  private async getFinancialRatios(companyId: string): Promise<{
    currentAssets: number;
    currentLiabilities: number;
    equity: number;
    totalLiabilities: number;
    liquidityRatio: number;
    solvencyRatio: number;
  }> {
    const accounts = await this.accountsRepo.find({ where: { companyId } });

    let currentAssets = 0; // Classe 3, 4 (sauf 401), 5
    let currentLiabilities = 0; // Classe 4 (401, 44x), 5 passif
    let equity = 0; // Classe 1
    let totalLiabilities = 0; // Passif total

    for (const acc of accounts) {
      const balance = parseFloat(String(acc.balance || 0));
      const num = acc.accountNumber;

      // Actif circulant : stocks (3), créances (4 sauf 401/44x), trésorerie (5)
      if (
        num.startsWith('3') ||
        (num.startsWith('4') &&
          !num.startsWith('401') &&
          !num.startsWith('44')) ||
        (num.startsWith('5') && acc.accountType === 'asset')
      ) {
        currentAssets += Math.abs(balance);
      }

      // Passif circulant : dettes court terme (401, 44x)
      if (
        num.startsWith('401') ||
        num.startsWith('44') ||
        (num.startsWith('5') && acc.accountType === 'liability')
      ) {
        currentLiabilities += Math.abs(balance);
      }

      // Capitaux propres : classe 1
      if (num.startsWith('1')) {
        equity += Math.abs(balance);
      }

      // Passif total
      if (acc.accountType === 'liability' || acc.accountType === 'equity') {
        totalLiabilities += Math.abs(balance);
      }
    }

    const liquidityRatio =
      currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const solvencyRatio =
      totalLiabilities > 0 ? equity / totalLiabilities : 0;

    return {
      currentAssets,
      currentLiabilities,
      equity,
      totalLiabilities,
      liquidityRatio,
      solvencyRatio,
    };
  }

  /**
   * Génération d'alertes comptables
   */
  private async getAlerts(companyId: string): Promise<
    Array<{
      type: 'warning' | 'danger' | 'info';
      title: string;
      message: string;
    }>
  > {
    const alerts: Array<{
      type: 'warning' | 'danger' | 'info';
      title: string;
      message: string;
    }> = [];

    // Alert 1: Écritures draft non validées
    const draftCount = await this.journalEntriesRepo.count({
      where: { companyId, status: 'draft' },
    });

    // Vérifier s'il y a des données réelles (non-test)
    const totalEntries = await this.journalEntriesRepo.count({
      where: { companyId },
    });

    const postedEntries = await this.journalEntriesRepo.count({
      where: { companyId, status: 'posted' },
    });

    // S'il n'y a que des drafts et aucune donnée réelle, ignorer l'alerte
    if (draftCount > 0 && totalEntries === draftCount && postedEntries === 0) {
      // Ignorer les drafts si ce sont les seules données (probablement des données de test)
      return [{ type: 'info', title: 'Aucune donnée', message: 'Aucune écriture comptable active pour le moment' }];
    }

    if (draftCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Écritures en attente',
        message: `${draftCount} écriture(s) draft nécessitent validation`,
      });
    }

    // Alert 2: Ratio de liquidité faible
    const ratios = await this.getFinancialRatios(companyId);
    if (ratios.liquidityRatio < 1 && ratios.currentLiabilities > 0) {
      alerts.push({
        type: 'danger',
        title: 'Liquidité faible',
        message: `Ratio de liquidité: ${ratios.liquidityRatio.toFixed(2)}. Actif circulant < Passif circulant`,
      });
    }

    // Alert 3: Marge du mois négative
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const kpi = await this.getMonthKPI(
      companyId,
      startOfMonth.toISOString().slice(0, 10),
      endOfMonth.toISOString().slice(0, 10),
    );

    if (kpi.netIncome < 0) {
      alerts.push({
        type: 'warning',
        title: 'Résultat négatif',
        message: `Le résultat du mois est déficitaire: ${Math.abs(kpi.netIncome).toLocaleString('fr-FR')} FCFA`,
      });
    }

    // Alert 4: Info - Tout va bien
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Situation saine',
        message: 'Aucune alerte comptable détectée',
      });
    }

    return alerts;
  }

  /**
   * Activité récente (5 dernières écritures)
   */
  private async getRecentActivity(companyId: string): Promise<{
    entries: Array<{
      date: string;
      description: string;
      amount: number;
      type: string;
    }>;
  }> {
    const entries = await this.journalEntriesRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      entries: entries.map((e) => ({
        date: typeof e.entryDate === 'string' ? e.entryDate : e.entryDate.toISOString().slice(0, 10),
        description: e.description,
        amount: parseFloat(String(e.totalDebit || 0)),
        type: e.journalType,
      })),
    };
  }
}
