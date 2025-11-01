import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from './entities/bank-account.entity';
import { ImportCsvDto, ReconcileDto } from './dto/import-csv.dto';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import { Payment } from '../payments/entities/payment.entity';
import { BankReconciliation } from './entities/bank-reconciliation.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { ReconcileEntryDto } from './dto/reconcile-entry.dto';

/**
 * Service de gestion bancaire:
 * - Gestion des comptes bancaires
 * - Import de relevés CSV
 * - Rapprochement semi-automatique avec les paiements
 */
@Injectable()
export class BankingService {
  constructor(
    @InjectRepository(BankTransaction)
    private bankTransactionsRepo: Repository<BankTransaction>,
    @InjectRepository(BankAccount)
    private bankAccountsRepo: Repository<BankAccount>,
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectRepository(BankReconciliation)
    private bankReconciliationRepo: Repository<BankReconciliation>,
    @InjectRepository(JournalEntry)
    private journalEntryRepo: Repository<JournalEntry>,
  ) {}

  /**
   * Importer des transactions depuis un CSV
   */
  async importFromCsv(dto: ImportCsvDto): Promise<BankTransaction[]> {
    const lines = dto.csvContent.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      throw new BadRequestException('CSV vide ou invalide');
    }

  

    // Parse header
    const header = lines[0].split(/[,;]/);
    const dateIdx = this.findColIndex(header, ['date', 'Date']);
    const amountIdx = this.findColIndex(header, ['montant', 'amount', 'Montant', 'Amount']);
    const labelIdx = this.findColIndex(header, ['libellé', 'libelle', 'label', 'description', 'Libellé']);
    const refIdx = this.findColIndex(header, ['reference', 'réf', 'ref', 'Référence'], true);

    if (dateIdx === -1 || amountIdx === -1 || labelIdx === -1) {
      throw new BadRequestException(
        'CSV invalide: colonnes Date, Montant, Libellé requises',
      );
    }

    const transactions: BankTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;]/);
      if (cols.length < 3) continue;

      const dateStr = cols[dateIdx]?.trim();
      const amountStr = cols[amountIdx]?.trim().replace(/\s/g, '');
      const label = cols[labelIdx]?.trim();
      const reference = refIdx !== -1 ? cols[refIdx]?.trim() : undefined;

      if (!dateStr || !amountStr || !label) continue;

      const transactionDate = this.parseDate(dateStr);
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || !transactionDate) continue;

      const tx = this.bankTransactionsRepo.create({
        companyId: dto.companyId,
        transactionDate,
        amount,
        label,
        reference,
        status: 'pending',
      });

      transactions.push(tx);
    }

    return this.bankTransactionsRepo.save(transactions);
  }

  /**
   * Récupérer toutes les transactions bancaires
   */
  async findAll(
    companyId: string,
    startDate?: string,
    endDate?: string,
    status?: string,
  ): Promise<BankTransaction[]> {
    try {
      const where: any = { companyId };

      if (startDate && endDate) {
        where.transactionDate = Between(new Date(startDate), new Date(endDate));
      }

      if (status) {
        where.status = status;
      }

      return this.bankTransactionsRepo.find({
        where,
        order: { transactionDate: 'DESC' },
      });
    } catch (e) {
      console.error('BankingService.findAll error:', e);
      return [];
    }
  }

  /**
   * Suggérer des rapprochements automatiques
   * Matching par montant ±5% et date ±7 jours
   */
  async suggestReconciliation(
    companyId: string,
    bankTransactionId: string,
  ): Promise<Payment[]> {
    const bankTx = await this.bankTransactionsRepo.findOne({
      where: { id: bankTransactionId, companyId },
    });

    if (!bankTx) {
      throw new BadRequestException('Transaction bancaire introuvable');
    }

    // Recherche dans une fenêtre de ±7 jours
    const startDate = new Date(bankTx.transactionDate);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(bankTx.transactionDate);
    endDate.setDate(endDate.getDate() + 7);

    // Tolérance de ±5%
    const minAmount = bankTx.amount * 0.95;
    const maxAmount = bankTx.amount * 1.05;

    const candidates = await this.paymentsRepo
      .createQueryBuilder('payment')
      .where('payment.company_id = :companyId', { companyId })
      .andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('payment.amount BETWEEN :minAmount AND :maxAmount', {
        minAmount,
        maxAmount,
      })
      .andWhere('payment.status != :status', { status: 'cancelled' })
      .orderBy('ABS(payment.amount - :amount)', 'ASC')
      .setParameter('amount', bankTx.amount)
      .limit(10)
      .getMany();

    return candidates;
  }

  /**
   * Rapprocher une transaction bancaire avec un paiement
   */
  async reconcile(dto: ReconcileDto): Promise<BankTransaction> {
    const bankTx = await this.bankTransactionsRepo.findOne({
      where: { id: dto.bankTransactionId },
    });

    if (!bankTx) {
      throw new BadRequestException('Transaction bancaire introuvable');
    }

    if (bankTx.status === 'reconciled') {
      throw new BadRequestException('Transaction déjà rapprochée');
    }

    const payment = await this.paymentsRepo.findOne({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Paiement introuvable');
    }

    bankTx.paymentId = dto.paymentId;
    bankTx.status = 'reconciled';
    bankTx.reconciledAt = new Date();
    bankTx.reconciledBy = dto.userId;

    return this.bankTransactionsRepo.save(bankTx);
  }

  /**
   * ==========================================
   * RAPPROCHEMENT CONTRE JOURNAL ENTRY (OHADA)
   * ==========================================
   */

  /**
   * Suggérer des écritures (JournalEntry) à rapprocher avec une transaction bancaire
   * Critères:
   * - Périmètre date: ±7 jours autour de transactionDate
   * - Compte banque: 512*
   * - Montant ligne (débit/crédit) proche du montant transaction (±5%)
   * - Statut écriture: posted
   */
  async suggestEntryReconciliation(
    companyId: string,
    bankTransactionId: string,
  ): Promise<
    Array<{
      journalEntryId: string;
      entryNumber: string;
      entryDate: Date;
      matchedAmount: number;
      delta: number;
      confidence: number;
    }>
  > {
    const bankTx = await this.bankTransactionsRepo.findOne({
      where: { id: bankTransactionId, companyId },
    });
    if (!bankTx) throw new NotFoundException('Transaction bancaire introuvable');

    const startDate = new Date(bankTx.transactionDate);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(bankTx.transactionDate);
    endDate.setDate(endDate.getDate() + 7);

    const txAbs = Math.abs(Number(bankTx.amount));
    const minAmount = txAbs * 0.95;
    const maxAmount = txAbs * 1.05;

    // Charger les écritures avec lignes + comptes (512*)
    const qb = this.journalEntryRepo
      .createQueryBuilder('je')
      .leftJoinAndSelect('je.lines', 'jel')
      .leftJoinAndSelect('jel.account', 'acc')
      .where('je.companyId = :companyId', { companyId })
      .andWhere('je.status = :status', { status: 'posted' })
      .andWhere('je.entryDate BETWEEN :start AND :end', { start: startDate, end: endDate })
      .andWhere("acc.accountNumber LIKE '512%'");

    if (bankTx.type === 'debit') {
      qb.andWhere('jel.debit BETWEEN :minAmount AND :maxAmount', { minAmount, maxAmount })
        .orderBy('ABS(jel.debit - :txAmount)', 'ASC')
        .setParameter('txAmount', txAbs);
    } else if (bankTx.type === 'credit') {
      qb.andWhere('jel.credit BETWEEN :minAmount AND :maxAmount', { minAmount, maxAmount })
        .orderBy('ABS(jel.credit - :txAmount)', 'ASC')
        .setParameter('txAmount', txAbs);
    } else {
      // Si type inconnu, considérer debit et credit
      qb.andWhere('(jel.debit BETWEEN :minAmount AND :maxAmount OR jel.credit BETWEEN :minAmount AND :maxAmount)', { minAmount, maxAmount })
        .orderBy('ABS(COALESCE(jel.debit,0) + COALESCE(jel.credit,0) - :txAmount)', 'ASC')
        .setParameter('txAmount', txAbs);
    }

    const candidates = await qb.limit(10).getMany();

    // Consolider par écriture (au cas où plusieurs lignes 512*)
    const results = candidates.map((je) => {
      const amt = this.computeBankAmountFromEntry(je, bankTx.type);
      const delta = Math.abs(Number(amt) - txAbs);
      const confidence = Math.max(0, 1 - delta / Math.max(1, txAbs));
      return {
        journalEntryId: je.id,
        entryNumber: je.entryNumber,
        entryDate: je.entryDate,
        matchedAmount: Number(amt),
        delta: Number(delta),
        confidence: Number(confidence.toFixed(2)),
      };
    })
    // Trier par delta croissant
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 10);

    return results;
  }

  /**
   * Rapprocher une transaction avec une écriture
   */
  async reconcileEntry(dto: ReconcileEntryDto): Promise<BankReconciliation> {
    const bankTx = await this.bankTransactionsRepo.findOne({
      where: { id: dto.bankTransactionId, companyId: dto.companyId },
    });
    if (!bankTx) throw new NotFoundException('Transaction bancaire introuvable');

    const je = await this.journalEntryRepo
      .createQueryBuilder('je')
      .leftJoinAndSelect('je.lines', 'jel')
      .leftJoinAndSelect('jel.account', 'acc')
      .where('je.id = :id AND je.companyId = :companyId', { id: dto.journalEntryId, companyId: dto.companyId })
      .getOne();
    if (!je) throw new NotFoundException("Écriture comptable introuvable");

    const reconciledAmount = this.computeBankAmountFromEntry(je, bankTx.type);

    const reconciliation = this.bankReconciliationRepo.create({
      companyId: dto.companyId,
      bankTransactionId: bankTx.id,
      journalEntryId: je.id,
      reconciledAmount: Number(reconciledAmount || 0),
      confidence: 1,
      matchType: 'manual',
      status: 'validated',
      notes: dto.notes,
      reconciledAt: new Date(),
    });
    await this.bankReconciliationRepo.save(reconciliation);

    bankTx.status = 'reconciled';
    bankTx.reconciledAt = new Date();
    await this.bankTransactionsRepo.save(bankTx);

    return reconciliation;
  }

  /**
   * Annuler un rapprochement entrée
   */
  async unreconcileEntry(reconciliationId: string): Promise<void> {
    const rec = await this.bankReconciliationRepo.findOne({ where: { id: reconciliationId } });
    if (!rec) throw new NotFoundException('Rapprochement introuvable');

    const bankTx = await this.bankTransactionsRepo.findOne({ where: { id: rec.bankTransactionId } });
    if (bankTx) {
      bankTx.status = 'pending';
      bankTx.reconciledAt = null;
      await this.bankTransactionsRepo.save(bankTx);
    }

    await this.bankReconciliationRepo.remove(rec);
  }

  /**
   * Helper: calculer le montant banque (compte 512*) depuis une écriture OHADA
   */
  private computeBankAmountFromEntry(entry: JournalEntry, txType?: 'debit' | 'credit'): number {
    if (!entry?.lines?.length) return 0;
    const isDebit = txType === 'debit';
    const bankLines = entry.lines.filter((l: any) => l?.account?.accountNumber?.startsWith('512'));
    if (!bankLines.length) return 0;
    const sum = bankLines.reduce((acc: number, l: any) => acc + Number(isDebit ? (l.debit || 0) : (l.credit || 0)), 0);
    return Number(sum);
  }

  /**
   * Annuler un rapprochement
   */
  async unreconcile(bankTransactionId: string): Promise<BankTransaction> {
    const bankTx = await this.bankTransactionsRepo.findOne({
      where: { id: bankTransactionId },
    });

    if (!bankTx) {
      throw new BadRequestException('Transaction bancaire introuvable');
    }

    bankTx.paymentId = null;
    bankTx.status = 'pending';
    bankTx.reconciledAt = null;
    bankTx.reconciledBy = null;

    return this.bankTransactionsRepo.save(bankTx);
  }

  /**
   * Marquer comme ignoré
   */
  async ignore(bankTransactionId: string): Promise<BankTransaction> {
    const bankTx = await this.bankTransactionsRepo.findOne({
      where: { id: bankTransactionId },
    });

    if (!bankTx) {
      throw new BadRequestException('Transaction bancaire introuvable');
    }

    bankTx.status = 'ignored';
    return this.bankTransactionsRepo.save(bankTx);
  }

  /**
   * Lettrage automatique OHADA
   * Parcourt les transactions en attente et rapproche la meilleure écriture si confiance >= threshold
   */
  async autoMatch(
    companyId: string,
    threshold = 0.8,
    limit = 100,
  ): Promise<{
    attempted: number;
    matched: number;
    errors: number;
    details: Array<{
      bankTransactionId: string;
      journalEntryId?: string;
      confidence?: number;
      status: 'matched' | 'skipped' | 'error';
      reason?: string;
    }>;
  }> {
    const pending = await this.bankTransactionsRepo.find({
      where: { companyId, status: 'pending' as any },
      order: { transactionDate: 'ASC' },
      take: limit,
    });

    const details: Array<{
      bankTransactionId: string;
      journalEntryId?: string;
      confidence?: number;
      status: 'matched' | 'skipped' | 'error';
      reason?: string;
    }> = [];
    let matched = 0;
    let errors = 0;

    for (const tx of pending) {
      try {
        const suggestions = await this.suggestEntryReconciliation(companyId, tx.id);
        const best = suggestions[0];
        if (!best) {
          details.push({ bankTransactionId: tx.id, status: 'skipped', reason: 'Aucune écriture correspondante' });
          continue;
        }
        if (best.confidence >= threshold) {
          await this.reconcileEntry({ companyId, bankTransactionId: tx.id, journalEntryId: best.journalEntryId });
          matched++;
          details.push({ bankTransactionId: tx.id, journalEntryId: best.journalEntryId, confidence: best.confidence, status: 'matched' });
        } else {
          details.push({ bankTransactionId: tx.id, journalEntryId: best.journalEntryId, confidence: best.confidence, status: 'skipped', reason: 'Confiance insuffisante' });
        }
      } catch (e: any) {
        errors++;
        details.push({ bankTransactionId: tx.id, status: 'error', reason: e?.message || 'Erreur inconnue' });
      }
    }

    return { attempted: pending.length, matched, errors, details };
  }

  /**
   * Utilitaires
   */
  private findColIndex(
    header: string[],
    patterns: string[],
    optional = false,
  ): number {
    for (let i = 0; i < header.length; i++) {
      const col = header[i].toLowerCase().trim();
      if (patterns.some((p) => col.includes(p.toLowerCase()))) {
        return i;
      }
    }
    return optional ? -1 : -1;
  }

  private parseDate(dateStr: string): Date | null {
    // Support formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    ];

    for (const fmt of formats) {
      const match = dateStr.match(fmt);
      if (match) {
        if (match[1].length === 4) {
          // YYYY-MM-DD
          const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
          if (!isNaN(d.getTime())) return d;
        } else {
          // DD/MM/YYYY or DD-MM-YYYY
          const d = new Date(`${match[3]}-${match[2]}-${match[1]}`);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }

    return null;
  }

  /**
   * ==========================================
   * GESTION DES COMPTES BANCAIRES
   * ==========================================
   */

  /**
   * Créer un compte bancaire
   */
  async createBankAccount(dto: CreateBankAccountDto): Promise<BankAccount> {
    const account = this.bankAccountsRepo.create(dto);
    return this.bankAccountsRepo.save(account);
  }

  /**
   * Récupérer tous les comptes bancaires avec soldes calculés
   */
  async findAllAccounts(companyId: string): Promise<Array<{
    id: string;
    name: string;
    accountNumber: string;
    iban: string | null;
    bankName: string | null;
    currency: string;
    openingBalance: number;
    currentBalance: number;
    lastTransactionDate: Date | null;
    isActive: boolean;
    transactionCount: number;
  }>> {
    const accounts = await this.bankAccountsRepo.find({
      where: { companyId },
      order: { name: 'ASC' },
    });

    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        // Calculer le solde actuel depuis les transactions
        const transactions = await this.bankTransactionsRepo.find({
          where: { companyId, accountId: account.id },
          order: { transactionDate: 'DESC' },
        });

        const transactionSum = transactions.reduce(
          (sum, tx) => sum + parseFloat(String(tx.amount || 0)),
          0,
        );

        const currentBalance = parseFloat(String(account.openingBalance || 0)) + transactionSum;

        const lastTransaction = transactions.length > 0 ? transactions[0] : null;

        return {
          id: account.id,
          name: account.name,
          accountNumber: account.accountNumber,
          iban: account.iban,
          bankName: account.bankName,
          currency: account.currency,
          openingBalance: parseFloat(String(account.openingBalance || 0)),
          currentBalance,
          lastTransactionDate: lastTransaction?.transactionDate || null,
          isActive: account.isActive,
          transactionCount: transactions.length,
        };
      }),
    );

    return accountsWithBalances;
  }

  /**
   * Récupérer un compte bancaire par ID
   */
  async findAccountById(id: string, companyId: string): Promise<BankAccount> {
    const account = await this.bankAccountsRepo.findOne({
      where: { id, companyId },
    });

    if (!account) {
      throw new BadRequestException('Compte bancaire introuvable');
    }

    return account;
  }

  /**
   * Mettre à jour un compte bancaire
   */
  async updateBankAccount(
    id: string,
    companyId: string,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    const account = await this.findAccountById(id, companyId);

    Object.assign(account, dto);

    return this.bankAccountsRepo.save(account);
  }

  /**
   * Supprimer un compte bancaire
   */
  async deleteBankAccount(id: string, companyId: string): Promise<void> {
    const account = await this.findAccountById(id, companyId);

    // Vérifier qu'il n'y a pas de transactions liées
    const transactionCount = await this.bankTransactionsRepo.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un compte avec des transactions',
      );
    }

    await this.bankAccountsRepo.remove(account);
  }
}
