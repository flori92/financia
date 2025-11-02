import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BankApiService } from '../services/bank-api.service';
import { NotificationsService } from '../../../notifications/notifications.service';

interface SyncJobData {
    connectionId: string;
    accountId: string;
}

@Injectable()
@Processor('bank-sync')
export class BankSyncProcessor {
    private readonly logger = new Logger(BankSyncProcessor.name);

    constructor(
        private readonly bankApiService: BankApiService,
        private readonly notificationsService: NotificationsService
    ) {}

    @Process('sync-transactions')
    async handleTransactionSync(job: Job<SyncJobData>) {
        const { connectionId, accountId } = job.data;
        this.logger.debug(`Démarrage de la synchronisation des transactions pour le compte ${accountId}`);

        try {
            // Synchroniser les transactions
            await this.bankApiService.syncTransactions(connectionId, accountId, {
                fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours par défaut
            });

            // Notifier le succès
            const account = await this.bankApiService.repositories.bankAccountRepo.findOne({
                where: { id: accountId },
                relations: ['connection']
            });
            if (account) {
                await this.notificationsService.sendBankSyncNotification({
                    userEmail: account.connection.userEmail || 'admin@bms.com',
                    bankName: account.connection.bankCode,
                    status: 'success',
                    accountsCount: 1,
                    transactionsCount: 0
                });
            }

            this.logger.debug(`Synchronisation des transactions terminée pour le compte ${accountId}`);
        } catch (error) {
            this.logger.error(
                `Erreur lors de la synchronisation des transactions pour le compte ${accountId}`,
                error.stack
            );

            // Notifier l'échec
            const account = await this.bankApiService.repositories.bankAccountRepo.findOne({
                where: { id: accountId },
                relations: ['connection']
            });
            if (account) {
                await this.notificationsService.sendBankSyncNotification({
                    userEmail: account.connection.userEmail || 'admin@bms.com',
                    bankName: account.connection.bankCode,
                    status: 'error',
                    message: (error as Error).message
                });
            }

            // Relancer l'erreur pour que Bull puisse gérer la tentative suivante
            throw error;
        }
    }

    @Process('retry-failed-syncs')
    async handleRetryFailedSyncs(job: Job) {
        this.logger.debug('Démarrage de la reprise des synchronisations échouées');

        try {
            // Récupérer toutes les connexions actives
            const activeConnections = await this.bankApiService.repositories.bankConnectionRepo.find({
                where: { status: 'active' }
            });

            // Pour chaque connexion
            for (const connection of activeConnections) {
                // Récupérer les comptes qui n'ont pas été synchronisés récemment
                const accounts = await this.bankApiService.repositories.bankAccountRepo.find({
                    where: {
                        connectionId: connection.id,
                        status: 'active'
                    }
                });

                // Planifier une nouvelle synchronisation pour chaque compte
                for (const account of accounts) {
                    const lastSync = account.lastSyncAt;
                    const now = new Date();
                    const hoursSinceLastSync = lastSync
                        ? (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
                        : 24;

                    if (hoursSinceLastSync >= 6) { // Re-synchroniser si > 6 heures
                        await this.bankApiService.repositories.bankSyncQueue.add('sync-transactions', {
                            connectionId: connection.id,
                            accountId: account.id
                        });
                    }
                }
            }

            this.logger.debug('Reprise des synchronisations échouées terminée');
        } catch (error) {
            this.logger.error(
                'Erreur lors de la reprise des synchronisations échouées',
                error.stack
            );
            throw error;
        }
    }

    @Process('refresh-tokens')
    async handleTokenRefresh(job: Job<{ connectionId: string }>) {
        const { connectionId } = job.data;
        this.logger.debug(`Démarrage du rafraîchissement des tokens pour la connexion ${connectionId}`);

        try {
            const connection = await this.bankApiService.repositories.bankConnectionRepo.findOneOrFail({
                where: { id: connectionId }
            });

            const provider = await this.bankApiService.loadBankProvider(connection.bankCode);

            // Rafraîchir les tokens
            const tokens = await provider.refreshAccessToken(connection.refreshToken);

            // Mettre à jour la connexion
            connection.accessToken = tokens.accessToken;
            connection.refreshToken = tokens.refreshToken;
            connection.tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

            await this.bankApiService.repositories.bankConnectionRepo.save(connection);

            this.logger.debug(`Rafraîchissement des tokens réussi pour la connexion ${connectionId}`);
        } catch (error) {
            this.logger.error(
                `Erreur lors du rafraîchissement des tokens pour la connexion ${connectionId}`,
                error.stack
            );

            // Si l'erreur indique que le refresh token est invalide, marquer la connexion comme révoquée
            const errorMsg = (error as Error).message;
            if (errorMsg.includes('invalid_grant') || errorMsg.includes('invalid_token')) {
                const conn = await this.bankApiService.repositories.bankConnectionRepo.findOne({
                    where: { id: connectionId }
                });
                if (conn) {
                    await this.bankApiService.repositories.bankConnectionRepo.update(connectionId, {
                        status: 'revoked'
                    });

                    await this.notificationsService.sendBankConnectionNotification({
                        userEmail: conn.userEmail || 'admin@bms.com',
                        bankName: conn.bankCode,
                        status: 'error',
                        message: 'Token expiré, veuillez reconnecter votre banque'
                    });
                }
            }

            throw error;
        }
    }
}