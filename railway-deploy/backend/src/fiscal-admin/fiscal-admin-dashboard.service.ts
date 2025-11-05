import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Account } from '../accounting/entities/account.entity';

@Injectable()
export class FiscalAdminDashboardService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Récupère les métriques du dashboard Administration Fiscale
   */
  async getDashboardMetrics(companyId: string): Promise<any> {
    try {
      const [
        declarations,
        compliance,
        controls,
        taxStats,
        alerts,
      ] = await Promise.all([
        this.getDeclarationsMetrics(companyId),
        this.getComplianceMetrics(companyId),
        this.getControlsMetrics(companyId),
        this.getTaxStatistics(companyId),
        this.getFiscalAlerts(companyId),
      ]);

      return {
        kpis: {
          declarations,
          compliance,
          controls,
          taxStats,
        },
        alerts,
        upcomingDeclarations: await this.getUpcomingDeclarations(companyId),
        taxEvolution: await this.getTaxEvolution(companyId),
        companyTaxInfo: await this.getCompanyTaxInfo(companyId),
      };
    } catch (error) {
      console.error('[FiscalAdminDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Déclarations fiscales (TVA, IS, etc.)
   */
  private async getDeclarationsMetrics(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // TODO: Intégrer avec module déclarations fiscales
      // Pour l'instant, calculs basés sur périodes standards

      // Déclarations TVA (mensuelles ou trimestrielles)
      const company = await this.companyRepository.findOne({ where: { id: companyId } });
      const vatRate = company?.vatRate || 18;

      // Compte TVA collectée (4457) et déductible (4456)
      const vatCollectedAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: '4457' },
      });
      const vatDeductibleAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: '4456' },
      });

      let vatToPay = 0;
      if (vatCollectedAccount && vatDeductibleAccount) {
        // TVA du mois en cours
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [collected, deductible] = await Promise.all([
          this.getAccountBalance(vatCollectedAccount.id, startOfMonth, endOfMonth),
          this.getAccountBalance(vatDeductibleAccount.id, startOfMonth, endOfMonth),
        ]);

        vatToPay = Math.abs(collected) - Math.abs(deductible);
      }

      // Nombre de déclarations cette année (simulation)
      const monthsElapsed = now.getMonth() + 1;
      const declarationsDone = monthsElapsed; // 1 par mois (TVA mensuelle)
      const declarationsPending = 1; // Mois en cours
      const declarationsTotal = 12; // Année complète

      return {
        done: declarationsDone,
        pending: declarationsPending,
        total: declarationsTotal,
        vatToPay,
        vatRate,
        nextDeadline: this.getNextVatDeadline(),
      };
    } catch (error) {
      return { done: 0, pending: 0, total: 12, vatToPay: 0, vatRate: 18, nextDeadline: null };
    }
  }

  /**
   * Conformité fiscale
   */
  private async getComplianceMetrics(companyId: string): Promise<any> {
    try {
      const now = new Date();
      
      // Vérifier si déclarations à jour (aucune en retard)
      const nextDeadline = this.getNextVatDeadline();
      const isCompliant = nextDeadline > now;

      // Score de conformité (simplifié)
      const complianceScore = isCompliant ? 100 : 75;

      // Risques identifiés
      const risks = [];
      if (!isCompliant) {
        risks.push({
          type: 'warning',
          title: 'Déclaration en retard',
          description: 'Une déclaration fiscale est en retard',
        });
      }

      return {
        score: complianceScore,
        status: complianceScore >= 90 ? 'compliant' : complianceScore >= 70 ? 'warning' : 'non-compliant',
        isCompliant,
        risksCount: risks.length,
        lastAuditDate: null, // À intégrer
      };
    } catch (error) {
      return { score: 0, status: 'unknown', isCompliant: false, risksCount: 0, lastAuditDate: null };
    }
  }

  /**
   * Contrôles fiscaux
   */
  private async getControlsMetrics(companyId: string): Promise<any> {
    try {
      // TODO: Intégrer avec module contrôles fiscaux
      return {
        ongoing: 0,
        completed: 0,
        findings: 0,
        lastControlDate: null,
      };
    } catch (error) {
      return { ongoing: 0, completed: 0, findings: 0, lastControlDate: null };
    }
  }

  /**
   * Statistiques fiscales
   */
  private async getTaxStatistics(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // TVA collectée YTD
      const vatCollectedAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: '4457' },
      });

      // TVA déductible YTD
      const vatDeductibleAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: '4456' },
      });

      let ytdVatCollected = 0;
      let ytdVatDeductible = 0;
      let ytdVatPaid = 0;

      if (vatCollectedAccount) {
        ytdVatCollected = Math.abs(await this.getAccountBalance(vatCollectedAccount.id, startOfYear, now));
      }

      if (vatDeductibleAccount) {
        ytdVatDeductible = Math.abs(await this.getAccountBalance(vatDeductibleAccount.id, startOfYear, now));
      }

      ytdVatPaid = ytdVatCollected - ytdVatDeductible;

      // Calcul taux effectif de taxation (simplifié)
      const revenueAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: { $like: '7%' } as any },
      });

      let ytdRevenue = 0;
      if (revenueAccount) {
        ytdRevenue = await this.getAccountBalance(revenueAccount.id, startOfYear, now);
      }

      const effectiveTaxRate = ytdRevenue > 0 ? (ytdVatPaid / ytdRevenue) * 100 : 0;

      return {
        ytdVatCollected,
        ytdVatDeductible,
        ytdVatPaid,
        ytdRevenue,
        effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
      };
    } catch (error) {
      return { ytdVatCollected: 0, ytdVatDeductible: 0, ytdVatPaid: 0, ytdRevenue: 0, effectiveTaxRate: 0 };
    }
  }

  /**
   * Alertes fiscales
   */
  private async getFiscalAlerts(companyId: string): Promise<any[]> {
    const alerts = [];

    try {
      const now = new Date();

      // Déclaration à venir (dans les 7 jours)
      const nextDeadline = this.getNextVatDeadline();
      const daysUntilDeadline = Math.ceil((nextDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
        alerts.push({
          type: 'warning',
          title: 'Déclaration TVA à venir',
          message: `Échéance dans ${daysUntilDeadline} jour(s) - ${nextDeadline.toLocaleDateString('fr-FR')}`,
        });
      } else if (daysUntilDeadline <= 0) {
        alerts.push({
          type: 'danger',
          title: 'Déclaration TVA en retard',
          message: `Échéance dépassée depuis ${Math.abs(daysUntilDeadline)} jour(s)`,
        });
      }

      // TVA à payer élevée
      const declarations = await this.getDeclarationsMetrics(companyId);
      if (declarations.vatToPay > 5000000) { // > 5M FCFA
        alerts.push({
          type: 'info',
          title: 'TVA à payer élevée',
          message: `${this.formatAmount(declarations.vatToPay)} FCFA à payer ce mois`,
        });
      }

      // Conformité
      const compliance = await this.getComplianceMetrics(companyId);
      if (compliance.score < 90) {
        alerts.push({
          type: 'warning',
          title: 'Conformité à améliorer',
          message: `Score de conformité: ${compliance.score}%`,
        });
      }

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Conformité fiscale',
          message: 'Tous les indicateurs fiscaux sont au vert',
        });
      }
    } catch (error) {
      console.error('[FiscalAdminDashboard] Erreur getFiscalAlerts:', error);
    }

    return alerts;
  }

  /**
   * Déclarations à venir (30 prochains jours)
   */
  private async getUpcomingDeclarations(companyId: string): Promise<any[]> {
    try {
      const declarations = [];
      const now = new Date();

      // Déclaration TVA mensuelle (15 du mois suivant)
      const nextVatDeadline = this.getNextVatDeadline();
      declarations.push({
        type: 'TVA',
        deadline: nextVatDeadline,
        status: nextVatDeadline > now ? 'pending' : 'overdue',
        description: 'Déclaration TVA mensuelle',
      });

      // Déclaration IS trimestrielle (si applicable)
      const nextQuarter = this.getNextQuarterDeadline();
      if (nextQuarter) {
        declarations.push({
          type: 'IS',
          deadline: nextQuarter,
          status: nextQuarter > now ? 'pending' : 'overdue',
          description: 'Acompte IS trimestriel',
        });
      }

      return declarations.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    } catch (error) {
      return [];
    }
  }

  /**
   * Évolution TVA (12 derniers mois)
   */
  private async getTaxEvolution(companyId: string): Promise<any[]> {
    const evolution = [];
    const now = new Date();

    try {
      const vatCollectedAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: '4457' },
      });

      const vatDeductibleAccount = await this.accountRepository.findOne({
        where: { companyId, accountNumber: '4456' },
      });

      if (!vatCollectedAccount || !vatDeductibleAccount) {
        return [];
      }

      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const monthStr = month.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

        const [collected, deductible] = await Promise.all([
          this.getAccountBalance(vatCollectedAccount.id, startOfMonth, endOfMonth),
          this.getAccountBalance(vatDeductibleAccount.id, startOfMonth, endOfMonth),
        ]);

        const vatCollected = Math.abs(collected);
        const vatDeductible = Math.abs(deductible);
        const vatToPay = vatCollected - vatDeductible;

        evolution.push({
          month: monthStr,
          collected: vatCollected,
          deductible: vatDeductible,
          toPay: vatToPay,
        });
      }
    } catch (error) {
      console.error('[FiscalAdminDashboard] Erreur getTaxEvolution:', error);
    }

    return evolution;
  }

  /**
   * Informations fiscales de l'entreprise
   */
  private async getCompanyTaxInfo(companyId: string): Promise<any> {
    try {
      const company = await this.companyRepository.findOne({ where: { id: companyId } });

      if (!company) {
        return {
          nif: 'Non renseigné',
          vatRate: 18,
          taxRegime: 'Réel Normal',
          fiscalYearEnd: '31/12',
        };
      }

      return {
        nif: company.nif || 'Non renseigné',
        vatRate: company.vatRate || 18,
        taxRegime: 'Réel Normal', // À ajouter dans Company entity
        fiscalYearEnd: '31/12', // À ajouter dans Company entity
      };
    } catch (error) {
      return {
        nif: 'Erreur',
        vatRate: 18,
        taxRegime: 'Inconnu',
        fiscalYearEnd: 'Inconnu',
      };
    }
  }

  /**
   * Calcule le solde d'un compte sur une période
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
   * Prochaine échéance TVA (15 du mois suivant)
   */
  private getNextVatDeadline(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    return nextMonth;
  }

  /**
   * Prochaine échéance trimestrielle IS
   */
  private getNextQuarterDeadline(): Date | null {
    const now = new Date();
    const month = now.getMonth();
    
    // Trimestres : Mars (2), Juin (5), Septembre (8), Décembre (11)
    const quarterMonths = [2, 5, 8, 11];
    
    for (const qMonth of quarterMonths) {
      const deadline = new Date(now.getFullYear(), qMonth, 15);
      if (deadline > now) {
        return deadline;
      }
    }
    
    // Prochain trimestre l'année suivante
    return new Date(now.getFullYear() + 1, 2, 15);
  }

  /**
   * Formate un montant
   */
  private formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /**
   * Métriques par défaut en cas d'erreur
   */
  private getDefaultMetrics(): any {
    return {
      kpis: {
        declarations: { done: 0, pending: 0, total: 12, vatToPay: 0, vatRate: 18, nextDeadline: null },
        compliance: { score: 0, status: 'unknown', isCompliant: false, risksCount: 0, lastAuditDate: null },
        controls: { ongoing: 0, completed: 0, findings: 0, lastControlDate: null },
        taxStats: { ytdVatCollected: 0, ytdVatDeductible: 0, ytdVatPaid: 0, ytdRevenue: 0, effectiveTaxRate: 0 },
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données fiscales',
        },
      ],
      upcomingDeclarations: [],
      taxEvolution: [],
      companyTaxInfo: { nif: 'Non renseigné', vatRate: 18, taxRegime: 'Réel Normal', fiscalYearEnd: '31/12' },
    };
  }
}
