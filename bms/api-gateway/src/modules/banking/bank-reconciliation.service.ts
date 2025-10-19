import { Injectable } from '@nestjs/common';

interface BankTransaction {
  id: string;
  date: Date;
  amount: number;
  label: string;
  reference?: string;
  counterpartyIban?: string;
}

interface JournalEntry {
  id: string;
  date: Date;
  amount: number;
  reference?: string;
  accountNumber: string;
}

@Injectable()
export class BankReconciliationService {
  
  /**
   * Matching automatique intelligent
   */
  async autoMatch(
    bankTransactions: BankTransaction[],
    journalEntries: JournalEntry[]
  ): Promise<Array<{ bankTx: BankTransaction; entry: JournalEntry; score: number }>> {
    const matches = [];

    for (const bankTx of bankTransactions) {
      for (const entry of journalEntries) {
        const score = this.calculateMatchScore(bankTx, entry);
        if (score > 0.7) {
          matches.push({ bankTx, entry, score });
        }
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Calcul du score de matching (0-1)
   */
  private calculateMatchScore(bankTx: BankTransaction, entry: JournalEntry): number {
    let score = 0;
    let factors = 0;

    // Montant exact
    if (Math.abs(bankTx.amount - entry.amount) < 0.01) {
      score += 0.5;
      factors++;
    } else if (Math.abs(bankTx.amount - entry.amount) < 1) {
      score += 0.3;
      factors++;
    }

    // Date (tolérance ±3 jours)
    const daysDiff = Math.abs(
      (bankTx.date.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff === 0) {
      score += 0.3;
      factors++;
    } else if (daysDiff <= 3) {
      score += 0.2;
      factors++;
    }

    // Référence
    if (bankTx.reference && entry.reference) {
      if (bankTx.reference === entry.reference) {
        score += 0.2;
        factors++;
      } else if (this.fuzzyMatch(bankTx.reference, entry.reference)) {
        score += 0.1;
        factors++;
      }
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Matching flou de chaînes
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    return s1.includes(s2) || s2.includes(s1);
  }

  /**
   * Génère une écriture de rapprochement
   */
  generateReconciliationEntry(bankTx: BankTransaction, bankAccountNumber: string): any {
    return {
      entryDate: bankTx.date,
      reference: bankTx.reference || `BANK-${bankTx.id}`,
      description: bankTx.label,
      journalCode: 'BQ',
      lines: [
        {
          accountNumber: bankAccountNumber,
          debit: bankTx.amount > 0 ? bankTx.amount : 0,
          credit: bankTx.amount < 0 ? Math.abs(bankTx.amount) : 0,
          label: bankTx.label
        },
        {
          accountNumber: '471000', // Compte d'attente
          debit: bankTx.amount < 0 ? Math.abs(bankTx.amount) : 0,
          credit: bankTx.amount > 0 ? bankTx.amount : 0,
          label: `À identifier - ${bankTx.label}`
        }
      ]
    };
  }
}
