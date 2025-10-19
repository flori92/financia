import { Injectable } from '@nestjs/common';

/**
 * Service de lettrage automatique intelligent
 */
@Injectable()
export class LettrageService {
  
  /**
   * Lettrage automatique par référence facture
   */
  async lettrageByReference(accountId: string): Promise<any[]> {
    const matches = [];
    const lines = await this.getUnreconciledLines(accountId);
    
    // Grouper par référence
    const byReference = new Map<string, any[]>();
    lines.forEach(line => {
      if (line.reference) {
        if (!byReference.has(line.reference)) {
          byReference.set(line.reference, []);
        }
        byReference.get(line.reference).push(line);
      }
    });
    
    // Lettrer les groupes équilibrés
    for (const [ref, group] of byReference) {
      const totalDebit = group.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = group.reduce((sum, l) => sum + l.credit, 0);
      
      if (Math.abs(totalDebit - totalCredit) < 0.01) {
        matches.push({
          reference: ref,
          lines: group,
          amount: totalDebit || totalCredit,
          type: 'exact'
        });
      }
    }
    
    return matches;
  }

  /**
   * Lettrage par montant (tolérance paramétrable)
   */
  async lettrageByAmount(accountId: string, tolerance: number = 0.01): Promise<any[]> {
    const matches = [];
    const lines = await this.getUnreconciledLines(accountId);
    
    // Séparer débits et crédits
    const debits = lines.filter(l => l.debit > 0);
    const credits = lines.filter(l => l.credit > 0);
    
    for (const debit of debits) {
      for (const credit of credits) {
        if (Math.abs(debit.debit - credit.credit) <= tolerance) {
          matches.push({
            lines: [debit, credit],
            amount: debit.debit,
            type: 'amount',
            difference: Math.abs(debit.debit - credit.credit)
          });
        }
      }
    }
    
    return matches;
  }

  /**
   * Lettrage multi-factures pour un paiement
   */
  async lettrageMultiInvoices(paymentLine: any, invoiceLines: any[]): Promise<any> {
    const combinations = this.findCombinations(
      invoiceLines,
      paymentLine.credit || paymentLine.debit,
      0.01
    );
    
    if (combinations.length > 0) {
      return {
        payment: paymentLine,
        invoices: combinations[0],
        type: 'multi-invoices'
      };
    }
    
    return null;
  }

  /**
   * Lettrage partiel (acomptes)
   */
  async lettragePartiel(line1: any, line2: any): Promise<any> {
    const amount1 = line1.debit || line1.credit;
    const amount2 = line2.debit || line2.credit;
    
    if (amount1 !== amount2) {
      const partialAmount = Math.min(amount1, amount2);
      return {
        lines: [line1, line2],
        partialAmount,
        remaining: Math.abs(amount1 - amount2),
        type: 'partial'
      };
    }
    
    return null;
  }

  /**
   * Délettrage avec traçabilité
   */
  async deLettrage(reconciliationKey: string, userId: string): Promise<void> {
    const lines = await this.getLinesByReconciliationKey(reconciliationKey);
    
    for (const line of lines) {
      await this.updateLine(line.id, {
        reconciliationKey: null,
        reconciledAt: null,
        unReconciledBy: userId,
        unReconciledAt: new Date()
      });
    }
    
    // Audit trail
    await this.logAudit({
      action: 'UNLETTER',
      reconciliationKey,
      userId,
      linesCount: lines.length
    });
  }

  /**
   * Lettrage automatique complet
   */
  async autoLettrage(accountId: string): Promise<any> {
    const results = {
      byReference: await this.lettrageByReference(accountId),
      byAmount: await this.lettrageByAmount(accountId),
      total: 0
    };
    
    results.total = results.byReference.length + results.byAmount.length;
    
    // Appliquer les lettrages
    for (const match of [...results.byReference, ...results.byAmount]) {
      await this.applyLettrage(match);
    }
    
    return results;
  }

  /**
   * Génère une clé de lettrage unique
   */
  private generateLettrageKey(): string {
    return `LET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Applique un lettrage
   */
  private async applyLettrage(match: any): Promise<void> {
    const key = this.generateLettrageKey();
    const now = new Date();
    
    for (const line of match.lines) {
      await this.updateLine(line.id, {
        reconciliationKey: key,
        reconciledAt: now
      });
    }
  }

  /**
   * Trouve combinaisons de montants
   */
  private findCombinations(items: any[], target: number, tolerance: number): any[][] {
    const results = [];
    
    const backtrack = (start: number, current: any[], sum: number) => {
      if (Math.abs(sum - target) <= tolerance) {
        results.push([...current]);
        return;
      }
      if (sum > target + tolerance) return;
      
      for (let i = start; i < items.length; i++) {
        current.push(items[i]);
        backtrack(i + 1, current, sum + (items[i].debit || items[i].credit));
        current.pop();
      }
    };
    
    backtrack(0, [], 0);
    return results;
  }

  // Méthodes helper (à implémenter avec DB)
  private async getUnreconciledLines(accountId: string): Promise<any[]> {
    return []; // Mock
  }

  private async getLinesByReconciliationKey(key: string): Promise<any[]> {
    return []; // Mock
  }

  private async updateLine(id: string, data: any): Promise<void> {
    // Mock
  }

  private async logAudit(data: any): Promise<void> {
    // Mock
  }
}
