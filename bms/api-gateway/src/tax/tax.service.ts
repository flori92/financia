import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';
import { VatReturnDto } from './dto/vat-return.dto';

/**
 * Service de gestion fiscale (TVA, déclarations)
 */
@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLinesRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @InjectRepository(Company)
    private companiesRepo: Repository<Company>,
  ) {}

  /**
   * Calculer la déclaration de TVA pour une période
   */
  async getVatReturn(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<VatReturnDto> {
    // Récupérer la société pour le taux TVA
    const company = await this.companiesRepo.findOne({ where: { id: companyId } });
    const vatRate = company?.vatRate || 18;

    // Récupérer tous les comptes
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    const accountsMap = new Map(accounts.map((a) => [a.id, a]));

    // Comptes de produits (classe 7)
    const revenueAccountIds = accounts
      .filter((a) => a.accountNumber.startsWith('7'))
      .map((a) => a.id);

    // Comptes de charges (classe 6)
    const expenseAccountIds = accounts
      .filter((a) => a.accountNumber.startsWith('6'))
      .map((a) => a.id);

    // Compte TVA collectée (4457)
    const vatCollectedAccount = accounts.find((a) => a.accountNumber === '4457');

    // Compte TVA déductible (4456)
    const vatDeductibleAccount = accounts.find((a) => a.accountNumber === '4456');

    // Récupérer les écritures de la période
    const entries = await this.journalEntriesRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.company_id = :companyId', { companyId })
      .andWhere('entry.entry_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('entry.status != :status', { status: 'cancelled' })
      .getMany();

    // Calculer les totaux
    let revenueHT = 0;
    let purchasesHT = 0;
    let vatCollected = 0;
    let vatDeductible = 0;

    const revenueDetails: Array<{
      accountNumber: string;
      accountName: string;
      amountHT: number;
      vat: number;
    }> = [];

    const purchaseDetails: Array<{
      accountNumber: string;
      accountName: string;
      amountHT: number;
      vat: number;
    }> = [];

    const revenueByAccount = new Map<string, number>();
    const purchaseByAccount = new Map<string, number>();

    for (const entry of entries) {
      for (const line of entry.lines) {
        if (!line.account) continue;
        const account = accountsMap.get(line.account.id);
        if (!account) continue;

        // TVA collectée (crédit)
        if (line.account.id === vatCollectedAccount?.id) {
          vatCollected += parseFloat(String(line.credit || 0));
        }

        // TVA déductible (débit)
        if (line.account.id === vatDeductibleAccount?.id) {
          vatDeductible += parseFloat(String(line.debit || 0));
        }

        // Produits (crédit en classe 7)
        if (revenueAccountIds.includes(line.account.id)) {
          const amount = parseFloat(String(line.credit || 0));
          revenueHT += amount;
          const current = revenueByAccount.get(line.account.id) || 0;
          revenueByAccount.set(line.account.id, current + amount);
        }

        // Charges (débit en classe 6)
        if (expenseAccountIds.includes(line.account.id)) {
          const amount = parseFloat(String(line.debit || 0));
          purchasesHT += amount;
          const current = purchaseByAccount.get(line.account.id) || 0;
          purchaseByAccount.set(line.account.id, current + amount);
        }
      }
    }

    // Construire les détails
    for (const [accountId, amount] of revenueByAccount.entries()) {
      const account = accountsMap.get(accountId);
      if (account && amount > 0) {
        revenueDetails.push({
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          amountHT: amount,
          vat: (amount * vatRate) / 100,
        });
      }
    }

    for (const [accountId, amount] of purchaseByAccount.entries()) {
      const account = accountsMap.get(accountId);
      if (account && amount > 0) {
        purchaseDetails.push({
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          amountHT: amount,
          vat: (amount * vatRate) / 100,
        });
      }
    }

    const vatNet = vatCollected - vatDeductible;

    return {
      revenueHT,
      vatCollected,
      purchasesHT,
      vatDeductible,
      vatNet,
      startDate,
      endDate,
      details: {
        revenues: revenueDetails,
        purchases: purchaseDetails,
      },
    };
  }

  /**
   * Exporter la déclaration en CSV
   */
  exportVatReturnCsv(vatReturn: VatReturnDto): string {
    const lines: string[] = [];
    lines.push('DECLARATION DE TVA');
    lines.push(`Période: ${vatReturn.startDate} au ${vatReturn.endDate}`);
    lines.push('');
    lines.push('SYNTHESE');
    lines.push(`Chiffre d'affaires HT,${vatReturn.revenueHT.toFixed(2)}`);
    lines.push(`TVA collectée,${vatReturn.vatCollected.toFixed(2)}`);
    lines.push(`Achats HT,${vatReturn.purchasesHT.toFixed(2)}`);
    lines.push(`TVA déductible,${vatReturn.vatDeductible.toFixed(2)}`);
    lines.push(`TVA nette à payer,${vatReturn.vatNet.toFixed(2)}`);
    lines.push('');
    lines.push('DETAIL PRODUITS (Classe 7)');
    lines.push('Compte,Libellé,Montant HT,TVA');
    for (const item of vatReturn.details.revenues) {
      lines.push(
        `${item.accountNumber},${item.accountName},${item.amountHT.toFixed(2)},${item.vat.toFixed(2)}`,
      );
    }
    lines.push('');
    lines.push('DETAIL CHARGES (Classe 6)');
    lines.push('Compte,Libellé,Montant HT,TVA');
    for (const item of vatReturn.details.purchases) {
      lines.push(
        `${item.accountNumber},${item.accountName},${item.amountHT.toFixed(2)},${item.vat.toFixed(2)}`,
      );
    }

    return lines.join('\n');
  }
}
