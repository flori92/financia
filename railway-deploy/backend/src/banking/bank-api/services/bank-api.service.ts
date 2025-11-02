import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BankConnection } from '../entities/bank-connection.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { BankAnomaly } from '../entities/bank-anomaly.entity';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AIService } from '../../../ai/ai.service';
import { 
    CreateBankConnectionDto,
    BankAccountDto,
    BankTransactionDto,
    BankSyncOptionsDto
} from '../dto/bank-api.dto';
import { BankApiException } from '../exceptions/bank-api.exception';

@Injectable()
export class BankApiService {
    private activeBankConnections: Map<string, any>;

    constructor(
        @InjectRepository(BankConnection)
        private readonly bankConnectionRepo: Repository<BankConnection>,
        @InjectRepository(BankAccount)
        private readonly bankAccountRepo: Repository<BankAccount>,
        @InjectRepository(BankTransaction)
        private readonly bankTransactionRepo: Repository<BankTransaction>,
        @InjectRepository(BankAnomaly)
        private readonly bankAnomalyRepo: Repository<BankAnomaly>,
        @InjectQueue('bank-sync')
        private readonly bankSyncQueue: Queue,
        @Inject('BANK_API_PROVIDERS')
        private readonly bankApiProviders: Record<string, any>,
        private readonly configService: ConfigService,
        private readonly notificationsService: NotificationsService,
        private readonly aiService: AIService
    ) {
        this.activeBankConnections = new Map();
    }

    async getConnectionIdForAccount(accountId: string): Promise<string> {
        const account = await this.bankAccountRepo.findOneOrFail({
            where: { id: accountId },
            relations: ['connection']
        });
        return account.connection.id;
    }

    async getTransactions(accountId: string, limit?: number): Promise<BankTransaction[]> {
        return this.bankTransactionRepo.find({
            where: { accountId },
            order: { date: 'DESC' },
            take: limit || 100
        });
    }

    async getAnomalies(accountId: string, status?: string): Promise<BankAnomaly[]> {
        const query = this.bankAnomalyRepo
            .createQueryBuilder('anomaly')
            .where('anomaly.accountId = :accountId', { accountId })
            .leftJoinAndSelect('anomaly.transaction', 'transaction');

        if (status) {
            query.andWhere('anomaly.status = :status', { status });
        }

        query.orderBy('anomaly.createdAt', 'DESC');

        return query.getMany();
    }

    async updateAnomaly(
        anomalyId: string,
        status: 'reviewed' | 'resolved' | 'false_positive',
        resolution?: string
    ): Promise<BankAnomaly> {
        const anomaly = await this.bankAnomalyRepo.findOneOrFail({
            where: { id: anomalyId }
        });

        Object.assign(anomaly, {
            status,
            resolution,
            reviewedAt: new Date(),
            reviewedBy: 'current-user-id' // TODO: Injecter l'utilisateur courant
        });

        return this.bankAnomalyRepo.save(anomaly);
    }

    /**
     * Initialise une nouvelle connexion bancaire avec authentification OAuth2
     */
    async initializeConnection(dto: CreateBankConnectionDto): Promise<BankConnection> {
        try {
            // Charger le provider bancaire approprié
            const provider = await this.loadBankProvider(dto.bankCode);
            
            // Initialiser l'authentification OAuth2
            const authData = await provider.initializeAuth({
                clientId: this.configService.get(`BANK_${dto.bankCode}_CLIENT_ID`),
                clientSecret: this.configService.get(`BANK_${dto.bankCode}_CLIENT_SECRET`),
                redirectUri: this.configService.get('BANK_API_REDIRECT_URI'),
                scope: 'accounts transactions balance',
                state: dto.userId
            });

            // Créer la connexion en base
            const connection = this.bankConnectionRepo.create({
                userId: dto.userId,
                bankCode: dto.bankCode,
                status: 'pending_auth',
                metadata: {
                    authUrl: authData.authorizationUrl,
                    state: authData.state
                }
            });

            await this.bankConnectionRepo.save(connection);

            // Notifier l'utilisateur
            await this.notificationsService.sendBankConnectionNotification({
                userId: dto.userId,
                type: 'bank_connection_initialized',
                data: {
                    bankCode: dto.bankCode,
                    authUrl: authData.authorizationUrl
                }
            });

            return connection;
        } catch (error) {
            throw new BankApiException(
                'Erreur lors de l\'initialisation de la connexion bancaire',
                error as Error
            );
        }
    }

    /**
     * Finalise l'authentification bancaire après redirection OAuth2
     */
    async completeAuthentication(connectionId: string, code: string): Promise<BankConnection> {
        try {
            const connection = await this.bankConnectionRepo.findOneOrFail({
                where: { id: connectionId }
            });

            const provider = await this.loadBankProvider(connection.bankCode);

            // Échanger le code contre les tokens
            const tokens = await provider.exchangeAuthCode(code);

            // Mettre à jour la connexion
            connection.status = 'active';
            connection.accessToken = tokens.accessToken;
            connection.refreshToken = tokens.refreshToken;
            connection.tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

            await this.bankConnectionRepo.save(connection);

            // Synchroniser les comptes immédiatement
            await this.syncBankAccounts(connectionId);

            return connection;
        } catch (error) {
            throw new BankApiException(
                'Erreur lors de la finalisation de l\'authentification',
                error as Error
            );
        }
    }

    /**
     * Synchronise les comptes bancaires
     */
    async syncBankAccounts(connectionId: string): Promise<BankAccount[]> {
        const connection = await this.bankConnectionRepo.findOneOrFail({
            where: { id: connectionId }
        });

        const provider = await this.loadBankProvider(connection.bankCode);

        try {
            // Récupérer les comptes via l'API
            const accounts = await provider.fetchAccounts(connection.accessToken);

            // Mettre à jour ou créer les comptes
            const savedAccounts = await Promise.all(
                accounts.map(async (accountData: BankAccountDto) => {
                    const account = await this.bankAccountRepo.findOne({
                        where: {
                            connectionId,
                            externalId: accountData.id
                        }
                    }) || this.bankAccountRepo.create({
                        connectionId,
                        externalId: accountData.id
                    });

                    // Mettre à jour les données
                    Object.assign(account, {
                        name: accountData.name,
                        type: accountData.type,
                        currency: accountData.currency,
                        balance: accountData.balance,
                        iban: accountData.iban,
                        bic: accountData.bic,
                        status: 'active'
                    });

                    return this.bankAccountRepo.save(account);
                })
            );

            // Planifier la synchronisation des transactions
            await Promise.all(
                savedAccounts.map(account =>
                    this.bankSyncQueue.add('sync-transactions', {
                        connectionId,
                        accountId: account.id
                    })
                )
            );

            return savedAccounts;
        } catch (error) {
            throw new BankApiException(
                'Erreur lors de la synchronisation des comptes',
                error as Error
            );
        }
    }

    /**
     * Synchronise les transactions d'un compte
     */
    async syncTransactions(
        connectionId: string,
        accountId: string,
        options?: BankSyncOptionsDto
    ): Promise<void> {
        const connection = await this.bankConnectionRepo.findOneOrFail({
            where: { id: connectionId }
        });

        const provider = await this.loadBankProvider(connection.bankCode);

        try {
            // Récupérer les nouvelles transactions
            const transactions = await provider.fetchTransactions(
                connection.accessToken,
                accountId,
                options
            ) as BankTransactionDto[];

            // Traiter les transactions par lots
            for (const batch of this.chunkArray(transactions, 100)) {
                await Promise.all(
                    batch.map(async (transactionData: BankTransactionDto) => {
                        // Vérifier si la transaction existe déjà
                        const existing = await this.bankTransactionRepo.findOne({
                            where: {
                                accountId,
                                externalId: transactionData.id
                            }
                        });

                        if (!existing) {
                            const transaction = this.bankTransactionRepo.create({
                                accountId,
                                externalId: transactionData.id,
                                date: transactionData.date,
                                amount: transactionData.amount,
                                currency: transactionData.currency,
                                description: transactionData.description,
                                type: transactionData.type,
                                category: transactionData.category,
                                status: transactionData.status
                            });

                            await this.bankTransactionRepo.save(transaction);

                            // Analyse IA pour détection d'anomalies
                            const anomalyScore = await this.aiService.analyzeBankTransaction(transaction);
                            if (anomalyScore > 0.8) {
                                await this.createAnomaly(transaction, anomalyScore);
                            }
                        }
                    })
                );
            }

            // Mettre à jour la date de dernière synchro
            await this.bankAccountRepo.update(
                { id: accountId },
                { lastSyncAt: new Date() }
            );

        } catch (error) {
            throw new BankApiException(
                'Erreur lors de la synchronisation des transactions',
                error as Error
            );
        }
    }

    /**
     * Crée une alerte d'anomalie pour une transaction
     */
    private async createAnomaly(
        transaction: BankTransaction,
        score: number
    ): Promise<void> {
        const anomaly = this.bankAnomalyRepo.create({
            transactionId: transaction.id,
            accountId: transaction.accountId,
            type: 'unusual_transaction',
            score,
            status: 'pending',
            metadata: {
                amount: transaction.amount,
                description: transaction.description
            }
        });

        await this.bankAnomalyRepo.save(anomaly);

        // Notifier l'expert-comptable
        const account = await this.bankAccountRepo.findOne({
            where: { id: transaction.accountId },
            relations: ['connection']
        });

        if (account) {
            await this.notificationsService.sendBankAnomalyNotification({
                userId: account.connection.userId,
                type: 'bank_anomaly_detected',
                data: {
                    transactionAmount: transaction.amount,
                    transactionDate: transaction.date,
                    anomalyScore: score
                }
            });
        }
    }

    /**
     * Charge dynamiquement le provider bancaire approprié
     */
    async loadBankProvider(bankCode: string): Promise<any> {
        const providerLoader = this.bankApiProviders[bankCode];
        if (!providerLoader) {
            throw new BankApiException(`Provider non trouvé pour la banque ${bankCode}`);
        }

        const provider = await providerLoader();
        return new provider.default();
    }

    // Expose les repositories nécessaires pour le processor
    get repositories() {
        return {
            bankConnectionRepo: this.bankConnectionRepo,
            bankAccountRepo: this.bankAccountRepo,
            bankTransactionRepo: this.bankTransactionRepo,
            bankAnomalyRepo: this.bankAnomalyRepo,
            bankSyncQueue: this.bankSyncQueue
        };
    }

    /**
     * Utilitaire pour diviser un tableau en lots
     */
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}