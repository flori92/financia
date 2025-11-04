import { Injectable } from '@nestjs/common';

/**
 * Service de clôture comptable
 */
@Injectable()
export class ClotureService {
  
  /**
   * Pré-clôture mensuelle
   */
  async preClotureMonth(companyId: string, year: number, month: number): Promise<any> {
    const checks = await this.runPreClosureChecks(companyId, year, month);
    
    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      status: checks.every(c => c.passed) ? 'ready' : 'blocked',
      checks,
      canClose: checks.every(c => c.passed)
    };
  }

  /**
   * Clôture mensuelle
   */
  async clotureMonth(companyId: string, year: number, month: number, userId: string): Promise<any> {
    // Vérifications
    const preCheck = await this.preClotureMonth(companyId, year, month);
    if (!preCheck.canClose) {
      throw new Error('Pré-clôture échouée: ' + preCheck.checks.filter(c => !c.passed).map(c => c.message).join(', '));
    }

    // Calcul amortissements
    await this.calculateDepreciation(companyId, year, month);

    // Provisions
    await this.calculateProvisions(companyId, year, month);

    // Verrouillage période
    await this.lockPeriod(companyId, year, month, 'monthly', userId);

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      closedAt: new Date(),
      closedBy: userId,
      type: 'monthly'
    };
  }

  /**
   * Clôture annuelle
   */
  async clotureYear(companyId: string, year: number, userId: string): Promise<any> {
    // Vérifier que tous les mois sont clos
    for (let month = 1; month <= 12; month++) {
      const isClosed = await this.isPeriodClosed(companyId, year, month);
      if (!isClosed) {
        throw new Error(`Mois ${month} non clos`);
      }
    }

    // Écritures de régularisation
    await this.generateRegularizationEntries(companyId, year);

    // Calcul résultat
    const result = await this.calculateYearResult(companyId, year);

    // Écriture de résultat
    await this.generateResultEntry(companyId, year, result);

    // A-nouveaux
    await this.generateANouveaux(companyId, year);

    // Verrouillage année
    await this.lockPeriod(companyId, year, 12, 'annual', userId);

    return {
      year,
      result,
      closedAt: new Date(),
      closedBy: userId,
      type: 'annual'
    };
  }

  /**
   * Réouverture période
   */
  async reopenPeriod(companyId: string, year: number, month: number, userId: string, reason: string): Promise<void> {
    // Vérifier droits
    const hasPermission = await this.checkReopenPermission(userId);
    if (!hasPermission) {
      throw new Error('Permission refusée');
    }

    // Supprimer verrouillage
    await this.unlockPeriod(companyId, year, month);

    // Audit
    await this.logAudit({
      action: 'REOPEN_PERIOD',
      companyId,
      year,
      month,
      userId,
      reason
    });
  }

  /**
   * Vérifications pré-clôture
   */
  private async runPreClosureChecks(companyId: string, year: number, month: number): Promise<any[]> {
    const checks = [];

    // Balance équilibrée
    const balance = await this.getBalance(companyId, year, month);
    checks.push({
      name: 'Balance équilibrée',
      passed: Math.abs(balance.debit - balance.credit) < 0.01,
      message: balance.debit === balance.credit ? 'OK' : `Écart: ${Math.abs(balance.debit - balance.credit)}`
    });

    // Lettrage complet
    const unreconciledCount = await this.getUnreconciledCount(companyId);
    checks.push({
      name: 'Lettrage',
      passed: unreconciledCount === 0,
      message: unreconciledCount === 0 ? 'OK' : `${unreconciledCount} lignes non lettrées`
    });

    // Rapprochement bancaire
    const unreconciledBankTx = await this.getUnreconciledBankTransactions(companyId, year, month);
    checks.push({
      name: 'Rapprochement bancaire',
      passed: unreconciledBankTx === 0,
      message: unreconciledBankTx === 0 ? 'OK' : `${unreconciledBankTx} transactions non rapprochées`
    });

    // TVA déclarée
    const vatDeclared = await this.isVATDeclared(companyId, year, month);
    checks.push({
      name: 'TVA déclarée',
      passed: vatDeclared,
      message: vatDeclared ? 'OK' : 'TVA non déclarée'
    });

    return checks;
  }

  /**
   * Calcul amortissements
   */
  private async calculateDepreciation(companyId: string, year: number, month: number): Promise<void> {
    const assets = await this.getDepreciableAssets(companyId);
    
    for (const asset of assets) {
      const monthlyDepreciation = asset.annualDepreciation / 12;
      
      await this.generateEntry({
        companyId,
        entryDate: new Date(year, month - 1, 1),
        description: `Dotation amortissement ${asset.name}`,
        journalCode: 'OD',
        lines: [
          {
            accountNumber: '681000', // Dotations aux amortissements
            debit: monthlyDepreciation,
            credit: 0,
            label: asset.name
          },
          {
            accountNumber: `28${asset.accountNumber.substr(2)}`, // Amortissement
            debit: 0,
            credit: monthlyDepreciation,
            label: asset.name
          }
        ]
      });
    }
  }

  /**
   * Génère écritures de régularisation
   */
  private async generateRegularizationEntries(companyId: string, year: number): Promise<void> {
    // Charges constatées d'avance
    const prepaidExpenses = await this.getPrepaidExpenses(companyId, year);
    for (const expense of prepaidExpenses) {
      await this.generateEntry({
        companyId,
        entryDate: new Date(year, 11, 31),
        description: 'Charges constatées d\'avance',
        journalCode: 'OD',
        lines: [
          { accountNumber: '486000', debit: expense.amount, credit: 0 },
          { accountNumber: expense.expenseAccount, debit: 0, credit: expense.amount }
        ]
      });
    }

    // Produits constatés d'avance
    const deferredRevenue = await this.getDeferredRevenue(companyId, year);
    for (const revenue of deferredRevenue) {
      await this.generateEntry({
        companyId,
        entryDate: new Date(year, 11, 31),
        description: 'Produits constatés d\'avance',
        journalCode: 'OD',
        lines: [
          { accountNumber: revenue.revenueAccount, debit: revenue.amount, credit: 0 },
          { accountNumber: '487000', debit: 0, credit: revenue.amount }
        ]
      });
    }
  }

  /**
   * Génère A-nouveaux
   */
  private async generateANouveaux(companyId: string, year: number): Promise<void> {
    const balances = await this.getYearEndBalances(companyId, year);
    
    for (const balance of balances) {
      if (balance.accountClass <= 5) { // Comptes de bilan
        await this.generateEntry({
          companyId,
          entryDate: new Date(year + 1, 0, 1),
          description: 'A-nouveaux',
          journalCode: 'AN',
          lines: [
            {
              accountNumber: balance.accountNumber,
              debit: balance.balance > 0 ? balance.balance : 0,
              credit: balance.balance < 0 ? Math.abs(balance.balance) : 0,
              label: 'Report à nouveau'
            }
          ]
        });
      }
    }
  }

  // Méthodes helper (à implémenter avec DB)
  private async lockPeriod(companyId: string, year: number, month: number, type: string, userId: string): Promise<void> {}
  private async unlockPeriod(companyId: string, year: number, month: number): Promise<void> {}
  private async isPeriodClosed(companyId: string, year: number, month: number): Promise<boolean> { return false; }
  private async getBalance(companyId: string, year: number, month: number): Promise<any> { return { debit: 0, credit: 0 }; }
  private async getUnreconciledCount(companyId: string): Promise<number> { return 0; }
  private async getUnreconciledBankTransactions(companyId: string, year: number, month: number): Promise<number> { return 0; }
  private async isVATDeclared(companyId: string, year: number, month: number): Promise<boolean> { return true; }
  private async getDepreciableAssets(companyId: string): Promise<any[]> { return []; }
  private async calculateYearResult(companyId: string, year: number): Promise<number> { return 0; }
  private async generateResultEntry(companyId: string, year: number, result: number): Promise<void> {}
  private async getPrepaidExpenses(companyId: string, year: number): Promise<any[]> { return []; }
  private async getDeferredRevenue(companyId: string, year: number): Promise<any[]> { return []; }
  private async getYearEndBalances(companyId: string, year: number): Promise<any[]> { return []; }
  private async generateEntry(entry: any): Promise<void> {}
  private async calculateProvisions(companyId: string, year: number, month: number): Promise<void> {}
  private async checkReopenPermission(userId: string): Promise<boolean> { return true; }
  private async logAudit(data: any): Promise<void> {}
}
