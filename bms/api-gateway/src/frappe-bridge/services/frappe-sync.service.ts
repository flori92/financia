import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FrappeApiService } from './frappe-api.service';
import { Account } from '../../accounting/entities/account.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Payment } from '../../payments/entities/payment.entity';
import {
  FrappeAccount,
  FrappeJournalEntry,
  FrappeInvoice,
  FrappePaymentEntry,
} from '../interfaces/frappe-response.interface';

/**
 * Service de synchronisation bidirectionnelle BMS ↔ Frappe
 */
@Injectable()
export class FrappeSyncService {
  private readonly logger = new Logger(FrappeSyncService.name);
  private isSyncing = false;

  constructor(
    private frappeApi: FrappeApiService,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  /**
   * Synchronisation automatique toutes les 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoSync() {
    if (!this.frappeApi.available || this.isSyncing) {
      return;
    }

    this.logger.log('🔄 Starting automatic synchronization...');
    await this.fullSync();
  }

  /**
   * Synchronisation complète
   */
  async fullSync(): Promise<{
    accounts: number;
    journalEntries: number;
    invoices: number;
    payments: number;
  }> {
    if (this.isSyncing) {
      this.logger.warn('Sync already in progress');
      return { accounts: 0, journalEntries: 0, invoices: 0, payments: 0 };
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      const results = {
        accounts: await this.syncAccounts(),
        journalEntries: await this.syncJournalEntries(),
        invoices: await this.syncInvoices(),
        payments: await this.syncPayments(),
      };

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Sync completed in ${duration}ms - ${JSON.stringify(results)}`,
      );

      return results;
    } catch (error) {
      this.logger.error('Sync failed', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Synchroniser le plan comptable Frappe → BMS
   */
  async syncAccounts(): Promise<number> {
    if (!this.frappeApi.available) {
      return 0;
    }

    try {
      const frappeAccounts = await this.frappeApi.getList<FrappeAccount>(
        'Account',
        { is_group: 0 }, // Seulement les comptes feuilles
        ['name', 'account_name', 'account_number', 'account_type', 'root_type', 'parent_account'],
      );

      let syncedCount = 0;

      for (const frappeAccount of frappeAccounts) {
        // Vérifier si le compte existe déjà
        const existingAccount = await this.accountsRepository.findOne({
          where: { accountNumber: frappeAccount.account_number },
        });

        if (existingAccount) {
          // Mettre à jour si modifié
          existingAccount.accountName = frappeAccount.account_name;
          existingAccount.frappeId = frappeAccount.name;
          existingAccount.lastSyncAt = new Date();
          await this.accountsRepository.save(existingAccount);
        } else {
          // Créer nouveau compte
          const newAccount = this.accountsRepository.create({
            accountNumber: frappeAccount.account_number,
            accountName: frappeAccount.account_name,
            accountType: this.mapFrappeAccountType(frappeAccount.root_type),
            syscohadaClass: this.inferSyscohadaClass(frappeAccount.account_number),
            frappeId: frappeAccount.name,
            companyId: 'default', // À mapper selon contexte
            lastSyncAt: new Date(),
          });
          await this.accountsRepository.save(newAccount);
        }

        syncedCount++;
      }

      this.logger.log(`Synced ${syncedCount} accounts from Frappe`);
      return syncedCount;
    } catch (error) {
      this.logger.error('Failed to sync accounts', error);
      return 0;
    }
  }

  /**
   * Synchroniser les écritures comptables Frappe → BMS (lecture seule)
   */
  async syncJournalEntries(): Promise<number> {
    if (!this.frappeApi.available) {
      return 0;
    }

    try {
      // Récupérer seulement les nouvelles écritures (last 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const frappeEntries = await this.frappeApi.getList<FrappeJournalEntry>(
        'Journal Entry',
        {
          docstatus: 1, // Soumises uniquement
          posting_date: ['>=', yesterday.toISOString().split('T')[0]],
        },
      );

      let syncedCount = 0;

      for (const frappeEntry of frappeEntries) {
        // Vérifier si déjà synchronisée
        const exists = await this.journalEntriesRepository.findOne({
          where: { frappeId: frappeEntry.name },
        });

        if (!exists) {
          // Créer en BMS (lecture seule)
          const newEntry = this.journalEntriesRepository.create({
            entryNumber: frappeEntry.name,
            entryDate: new Date(frappeEntry.posting_date),
            description: frappeEntry.user_remark || 'Synced from Frappe',
            journalType: 'general',
            totalDebit: frappeEntry.total_debit,
            totalCredit: frappeEntry.total_credit,
            status: 'posted',
            frappeId: frappeEntry.name,
            companyId: 'default',
            createdBy: 'frappe-sync',
            lastSyncAt: new Date(),
          });

          await this.journalEntriesRepository.save(newEntry);
          syncedCount++;
        }
      }

      this.logger.log(`Synced ${syncedCount} journal entries from Frappe`);
      return syncedCount;
    } catch (error) {
      this.logger.error('Failed to sync journal entries', error);
      return 0;
    }
  }

  /**
   * Synchroniser les factures BMS → Frappe
   */
  async syncInvoices(): Promise<number> {
    if (!this.frappeApi.available) {
      return 0;
    }

    try {
      // Récupérer les factures BMS non synchronisées
      const unsyncedInvoices = await this.invoicesRepository.find({
        where: { frappeId: null },
        take: 50, // Limite par batch
      });

      let syncedCount = 0;

      for (const invoice of unsyncedInvoices) {
        try {
          // Créer dans Frappe
          const frappeInvoice = await this.frappeApi.createDoc<FrappeInvoice>(
            'Sales Invoice',
            {
              customer: invoice.partyName || 'Guest',
              posting_date: invoice.invoiceDate.toISOString().split('T')[0],
              due_date: invoice.dueDate.toISOString().split('T')[0],
              items: invoice.items.map((item) => ({
                item_code: item.itemCode || item.itemName,
                item_name: item.itemName,
                qty: item.quantity,
                rate: item.unitPrice,
                amount: item.lineTotal,
              })),
            },
          );

          // Mettre à jour BMS avec l'ID Frappe
          invoice.frappeId = frappeInvoice.name;
          invoice.lastSyncAt = new Date();
          await this.invoicesRepository.save(invoice);

          syncedCount++;
        } catch (error) {
          this.logger.error(`Failed to sync invoice ${invoice.id}`, error);
        }
      }

      this.logger.log(`Synced ${syncedCount} invoices to Frappe`);
      return syncedCount;
    } catch (error) {
      this.logger.error('Failed to sync invoices', error);
      return 0;
    }
  }

  /**
   * Synchroniser les paiements BMS → Frappe
   */
  async syncPayments(): Promise<number> {
    if (!this.frappeApi.available) {
      return 0;
    }

    try {
      // Récupérer les paiements BMS non synchronisés
      const unsyncedPayments = await this.paymentsRepository.find({
        where: { frappeId: null, status: 'submitted' },
        take: 50,
      });

      let syncedCount = 0;

      for (const payment of unsyncedPayments) {
        try {
          // Créer dans Frappe
          const frappePayment = await this.frappeApi.createDoc<FrappePaymentEntry>(
            'Payment Entry',
            {
              payment_type: payment.partyType === 'customer' ? 'Receive' : 'Pay',
              party_type: payment.partyType === 'customer' ? 'Customer' : 'Supplier',
              party: payment.partyId,
              paid_amount: payment.amount,
              received_amount: payment.amount,
              mode_of_payment: this.mapPaymentMethod(payment.paymentMethod),
              reference_no: payment.reference,
              reference_date: payment.paymentDate.toISOString().split('T')[0],
            },
          );

          // Mettre à jour BMS
          payment.frappeId = frappePayment.name;
          payment.lastSyncAt = new Date();
          await this.paymentsRepository.save(payment);

          syncedCount++;
        } catch (error) {
          this.logger.error(`Failed to sync payment ${payment.id}`, error);
        }
      }

      this.logger.log(`Synced ${syncedCount} payments to Frappe`);
      return syncedCount;
    } catch (error) {
      this.logger.error('Failed to sync payments', error);
      return 0;
    }
  }

  /**
   * Mapper le type de compte Frappe vers BMS
   */
  private mapFrappeAccountType(rootType: string): string {
    const mapping = {
      Asset: 'asset',
      Liability: 'liability',
      Equity: 'equity',
      Income: 'revenue',
      Expense: 'expense',
    };
    return mapping[rootType] || 'asset';
  }

  /**
   * Inférer la classe SYSCOHADA à partir du numéro de compte
   */
  private inferSyscohadaClass(accountNumber: string): number {
    if (!accountNumber) return 1;
    const firstDigit = parseInt(accountNumber[0]);
    return isNaN(firstDigit) ? 1 : firstDigit;
  }

  /**
   * Mapper le mode de paiement BMS vers Frappe
   */
  private mapPaymentMethod(method: string): string {
    const mapping = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      check: 'Cheque',
      card: 'Credit Card',
    };
    return mapping[method] || 'Cash';
  }
}
