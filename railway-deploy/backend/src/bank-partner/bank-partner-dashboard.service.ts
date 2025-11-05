import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';

@Injectable()
export class BankPartnerDashboardService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Récupère les métriques du dashboard Banque/Partenaire
   */
  async getDashboardMetrics(companyId?: string): Promise<any> {
    try {
      const [
        portfolio,
        scoring,
        financial,
        risk,
        alerts,
      ] = await Promise.all([
        this.getPortfolioMetrics(companyId),
        this.getScoringMetrics(companyId),
        this.getFinancialMetrics(companyId),
        this.getRiskMetrics(companyId),
        this.getBankAlerts(companyId),
      ]);

      return {
        kpis: {
          portfolio,
          scoring,
          financial,
          risk,
        },
        alerts,
        companiesList: await this.getCompaniesList(companyId),
        riskDistribution: await this.getRiskDistribution(),
      };
    } catch (error) {
      console.error('[BankPartnerDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Portefeuille clients
   */
  private async getPortfolioMetrics(companyId?: string): Promise<any> {
    try {
      let totalCompanies = 0;
      let activeCompanies = 0;
      let totalExposure = 0;

      if (companyId) {
        // Vue d'une société spécifique
        totalCompanies = 1;
        activeCompanies = 1;
        
        // Calculer l'exposition (dettes + garanties - simulé)
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (company) {
          // TODO: Intégrer module prêts/garanties
          totalExposure = 0; // À calculer
        }
      } else {
        // Vue globale portefeuille
        totalCompanies = await this.companyRepository.count();
        
        // Sociétés actives (avec activité récente)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        activeCompanies = await this.companyRepository
          .createQueryBuilder('company')
          .leftJoin(JournalEntry, 'entry', 'entry.company_id = company.id')
          .where('entry.created_at >= :date', { date: thirtyDaysAgo })
          .groupBy('company.id')
          .getCount();

        // TODO: Calculer exposition totale depuis module prêts
        totalExposure = 0;
      }

      return {
        totalCompanies,
        activeCompanies,
        totalExposure,
        avgExposurePerCompany: totalCompanies > 0 ? totalExposure / totalCompanies : 0,
      };
    } catch (error) {
      return { totalCompanies: 0, activeCompanies: 0, totalExposure: 0, avgExposurePerCompany: 0 };
    }
  }

  /**
   * Scoring et notation
   */
  private async getScoringMetrics(companyId?: string): Promise<any> {
    try {
      // TODO: Intégrer module scoring
      // Pour l'instant, calcul basique sur ratios financiers

      if (companyId) {
        const score = await this.calculateCreditScore(companyId);
        return {
          score,
          rating: this.getRating(score),
          trend: 'stable',
          lastUpdate: new Date(),
        };
      } else {
        // Score moyen portefeuille
        return {
          avgScore: 65,
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 0,
        };
      }
    } catch (error) {
      return { score: 0, rating: 'N/A', trend: 'unknown', lastUpdate: null };
    }
  }

  /**
   * Indicateurs financiers
   */
  private async getFinancialMetrics(companyId?: string): Promise<any> {
    try {
      if (!companyId) {
        return { revenue: 0, profitability: 0, debt: 0, liquidity: 0 };
      }

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // CA annuel
      const revenueAccounts = await this.accountRepository.find({
        where: { companyId, accountNumber: { $like: '7%' } as any },
      });

      let revenue = 0;
      for (const account of revenueAccounts) {
        const balance = await this.getAccountBalance(account.id, startOfYear, now);
        revenue += Math.abs(balance);
      }

      // Résultat net (produits - charges)
      const expenseAccounts = await this.accountRepository.find({
        where: { companyId, accountNumber: { $like: '6%' } as any },
      });

      let expenses = 0;
      for (const account of expenseAccounts) {
        const balance = await this.getAccountBalance(account.id, startOfYear, now);
        expenses += Math.abs(balance);
      }

      const netIncome = revenue - expenses;
      const profitability = revenue > 0 ? (netIncome / revenue) * 100 : 0;

      // Dettes (passif circulant - simulé)
      const debtAccounts = await this.accountRepository.find({
        where: { companyId, accountNumber: { $like: '4%' } as any },
      });

      let debt = 0;
      for (const account of debtAccounts) {
        const balance = await this.getAccountBalance(account.id, startOfYear, now);
        debt += Math.abs(balance);
      }

      // Liquidité (actif circulant / passif circulant)
      const cashAccounts = await this.accountRepository.find({
        where: { companyId, accountNumber: { $like: '5%' } as any },
      });

      let cash = 0;
      for (const account of cashAccounts) {
        const balance = await this.getAccountBalance(account.id, startOfYear, now);
        cash += Math.abs(balance);
      }

      const liquidity = debt > 0 ? (cash / debt) : 0;

      return {
        revenue,
        profitability: Math.round(profitability * 10) / 10,
        debt,
        liquidity: Math.round(liquidity * 100) / 100,
      };
    } catch (error) {
      return { revenue: 0, profitability: 0, debt: 0, liquidity: 0 };
    }
  }

  /**
   * Indicateurs de risque
   */
  private async getRiskMetrics(companyId?: string): Promise<any> {
    try {
      if (!companyId) {
        return { level: 'medium', score: 50, factors: [] };
      }

      const financial = await this.getFinancialMetrics(companyId);
      const riskFactors = [];
      let riskScore = 0;

      // Analyse liquidité
      if (financial.liquidity < 1) {
        riskFactors.push('Liquidité faible');
        riskScore += 30;
      } else if (financial.liquidity < 1.5) {
        riskFactors.push('Liquidité modérée');
        riskScore += 15;
      }

      // Analyse profitabilité
      if (financial.profitability < 0) {
        riskFactors.push('Pertes');
        riskScore += 25;
      } else if (financial.profitability < 5) {
        riskFactors.push('Faible profitabilité');
        riskScore += 10;
      }

      // Endettement
      if (financial.debt > financial.revenue * 0.5) {
        riskFactors.push('Endettement élevé');
        riskScore += 20;
      }

      const level = riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low';

      return {
        level,
        score: riskScore,
        factors: riskFactors,
      };
    } catch (error) {
      return { level: 'unknown', score: 0, factors: [] };
    }
  }

  /**
   * Alertes bancaires
   */
  private async getBankAlerts(companyId?: string): Promise<any[]> {
    const alerts = [];

    try {
      if (companyId) {
        const risk = await this.getRiskMetrics(companyId);
        const financial = await this.getFinancialMetrics(companyId);

        // Risque élevé
        if (risk.level === 'high') {
          alerts.push({
            type: 'danger',
            title: 'Risque élevé',
            message: `Score de risque: ${risk.score} - ${risk.factors.join(', ')}`,
          });
        }

        // Liquidité faible
        if (financial.liquidity < 1) {
          alerts.push({
            type: 'warning',
            title: 'Liquidité insuffisante',
            message: `Ratio de liquidité: ${financial.liquidity.toFixed(2)}`,
          });
        }

        // Pertes
        if (financial.profitability < 0) {
          alerts.push({
            type: 'danger',
            title: 'Résultat négatif',
            message: `Marge: ${financial.profitability.toFixed(1)}%`,
          });
        }
      }

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Situation saine',
          message: 'Pas de risques majeurs identifiés',
        });
      }
    } catch (error) {
      console.error('[BankPartnerDashboard] Erreur getBankAlerts:', error);
    }

    return alerts;
  }

  /**
   * Liste des sociétés du portefeuille
   */
  private async getCompaniesList(companyId?: string): Promise<any[]> {
    try {
      if (companyId) {
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) return [];

        const financial = await this.getFinancialMetrics(companyId);
        const risk = await this.getRiskMetrics(companyId);
        const score = await this.calculateCreditScore(companyId);

        return [{
          id: company.id,
          name: company.name,
          nif: company.nif,
          revenue: financial.revenue,
          riskLevel: risk.level,
          creditScore: score,
          rating: this.getRating(score),
        }];
      } else {
        // Liste complète (limitée à 20)
        const companies = await this.companyRepository.find({ take: 20 });

        const results = [];
        for (const company of companies) {
          const score = await this.calculateCreditScore(company.id);
          results.push({
            id: company.id,
            name: company.name,
            nif: company.nif,
            creditScore: score,
            rating: this.getRating(score),
          });
        }

        return results;
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Répartition du risque
   */
  private async getRiskDistribution(): Promise<any[]> {
    try {
      // TODO: Calculer pour toutes les sociétés
      return [
        { level: 'Faible', count: 0, percentage: 0 },
        { level: 'Modéré', count: 0, percentage: 0 },
        { level: 'Élevé', count: 0, percentage: 0 },
      ];
    } catch (error) {
      return [];
    }
  }

  /**
   * Calcul score de crédit simplifié
   */
  private async calculateCreditScore(companyId: string): Promise<number> {
    try {
      const financial = await this.getFinancialMetrics(companyId);
      
      let score = 50; // Base

      // Liquidité (+/- 20 points)
      if (financial.liquidity >= 2) score += 20;
      else if (financial.liquidity >= 1.5) score += 15;
      else if (financial.liquidity >= 1) score += 10;
      else score -= 10;

      // Profitabilité (+/- 20 points)
      if (financial.profitability >= 20) score += 20;
      else if (financial.profitability >= 10) score += 15;
      else if (financial.profitability >= 5) score += 10;
      else if (financial.profitability < 0) score -= 15;

      // Endettement (+/- 10 points)
      const debtRatio = financial.revenue > 0 ? financial.debt / financial.revenue : 0;
      if (debtRatio < 0.3) score += 10;
      else if (debtRatio > 0.7) score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      return 50;
    }
  }

  /**
   * Notation selon score
   */
  private getRating(score: number): string {
    if (score >= 80) return 'AAA';
    if (score >= 70) return 'AA';
    if (score >= 60) return 'A';
    if (score >= 50) return 'BBB';
    if (score >= 40) return 'BB';
    if (score >= 30) return 'B';
    return 'C';
  }

  /**
   * Calcule le solde d'un compte
   */
  private async getAccountBalance(accountId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await this.journalEntryRepository
        .createQueryBuilder('entry')
        .leftJoin('entry.lines', 'line')
        .where('line.account_id = :accountId', { accountId })
        .andWhere('entry.status = :status', { status: 'posted' })
        .andWhere('entry.entry_date >= :startDate', { startDate })
        .andWhere('entry.entry_date <= :endDate', { endDate })
        .select('SUM(line.credit - line.debit)', 'balance')
        .getRawOne();

      return Number(result?.balance || 0);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Métriques par défaut
   */
  private getDefaultMetrics(): any {
    return {
      kpis: {
        portfolio: { totalCompanies: 0, activeCompanies: 0, totalExposure: 0, avgExposurePerCompany: 0 },
        scoring: { score: 0, rating: 'N/A', trend: 'unknown', lastUpdate: null },
        financial: { revenue: 0, profitability: 0, debt: 0, liquidity: 0 },
        risk: { level: 'unknown', score: 0, factors: [] },
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données',
        },
      ],
      companiesList: [],
      riskDistribution: [],
    };
  }
}
