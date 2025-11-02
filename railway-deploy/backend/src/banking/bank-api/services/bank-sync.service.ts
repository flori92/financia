import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../entities/bank-account.entity';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { BankAnomaly } from '../entities/bank-anomaly.entity';
import { BankSyncOptionsDto } from '../dto/bank-api.dto';

@Injectable()
export class BankSyncService {
  private readonly logger = new Logger(BankSyncService.name);

  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepo: Repository<BankTransaction>,
    @InjectRepository(BankAnomaly)
    private readonly bankAnomalyRepo: Repository<BankAnomaly>
  ) {}

  async syncAccountTransactions(
    accountId: string,
    options: BankSyncOptionsDto = {}
  ): Promise<{
    synced: number;
    anomalies: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let synced = 0;
    let anomalies = 0;

    try {
      const account = await this.bankAccountRepo.findOne({
        where: { id: accountId }
      });

      if (!account) {
        throw new Error('Compte non trouvé');
      }

      this.logger.log(`Synchronisation du compte ${accountId} (${account.name})`);

      // Simuler une synchronisation avec API bancaire
      const mockTransactions = await this.fetchMockTransactions(account, options);
      
      for (const txData of mockTransactions) {
        try {
          // Vérifier si la transaction existe déjà
          const existing = await this.bankTransactionRepo.findOne({
            where: { externalId: txData.externalId }
          });

          if (!existing) {
            const transaction = this.bankTransactionRepo.create({
              ...txData,
              accountId: account.id,
              connectionId: account.connectionId
            });
            
            await this.bankTransactionRepo.save(transaction);
            synced++;

            // Détection d'anomalies basique
            if (this.detectAnomaly(txData)) {
              const anomaly = this.bankAnomalyRepo.create({
                accountId: account.id,
                transactionId: transaction.id,
                type: 'unusual_transaction',
                score: 0.8,
                status: 'pending',
                metadata: { reason: 'Montant inhabituel' }
              });
              
              await this.bankAnomalyRepo.save(anomaly);
              anomalies++;
            }
          }
        } catch (error) {
          errors.push(`Transaction ${txData.externalId}: ${error.message}`);
        }
      }

      // Mettre à jour la date de dernière synchronisation
      account.balance = await this.calculateCurrentBalance(accountId);
      await this.bankAccountRepo.save(account);

      this.logger.log(`Synchronisation terminée: ${synced} transactions, ${anomalies} anomalies`);
      
      return { synced, anomalies, errors };
    } catch (error) {
      this.logger.error(`Erreur synchronisation: ${error.message}`);
      errors.push(error.message);
      return { synced, anomalies, errors };
    }
  }

  async scheduleSync(accountId: string, frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    this.logger.log(`Planification synchronisation ${frequency} pour compte ${accountId}`);
    // Implémentation avec Bull/Redis quand disponible
  }

  async getSyncStatus(accountId: string): Promise<{
    lastSync: Date | null;
    nextSync: Date | null;
    status: 'idle' | 'syncing' | 'error';
  }> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: accountId }
    });

    return {
      lastSync: account?.metadata?.lastSync || null,
      nextSync: this.calculateNextSync('daily'),
      status: 'idle'
    };
  }

  private async fetchMockTransactions(account: BankAccount, options: BankSyncOptionsDto) {
    // Simuler des transactions depuis API bancaire
    return [
      {
        externalId: `TX_${Date.now()}_1`,
        date: new Date(),
        amount: 1500.00,
        currency: account.currency,
        description: 'Vente client',
        type: 'credit'
      },
      {
        externalId: `TX_${Date.now()}_2`,
        date: new Date(),
        amount: -200.00,
        currency: account.currency,
        description: 'Frais bancaires',
        type: 'debit'
      }
    ];
  }

  private detectAnomaly(transaction: any): boolean {
    // Détection simple: transactions > 10000 ou < -5000
    return Math.abs(transaction.amount) > 10000 || transaction.amount < -5000;
  }

  private async calculateCurrentBalance(accountId: string): Promise<number> {
    const transactions = await this.bankTransactionRepo.find({
      where: { accountId }
    });

    return transactions.reduce((balance, tx) => balance + tx.amount, 0);
  }

  private calculateNextSync(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
}
