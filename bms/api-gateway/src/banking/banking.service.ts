import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from './entities/bank-account.entity';
import { ImportCsvDto, ReconcileDto } from './dto/import-csv.dto';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import { Payment } from '../payments/entities/payment.entity';

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
