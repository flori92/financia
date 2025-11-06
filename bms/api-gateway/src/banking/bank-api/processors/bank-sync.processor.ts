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

    private get repositories() {
        return this.bankApiService.repositories;
    }

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
            await this.notificationsService.sendBankSyncNotification({
                userId: 'user-id', // TODO: Récupérer l'ID utilisateur depuis le compte
                type: 'bank_sync_completed',
                data: {
                    accountId,
                    status: 'success'
                }
            });

            this.logger.debug(`Synchronisation des transactions terminée pour le compte ${accountId}`);
        } catch (error) {
            this.logger.error(
                `Erreur lors de la synchronisation des transactions pour le compte ${accountId}`,
                error.stack
            );

            // Notifier l'échec
            await this.notificationsService.sendBankSyncNotification({
                userId: 'user-id',
                type: 'bank_sync_failed',
                data: {
                    accountId,
                    error: error.message
                }
            });

            // Relancer l'erreur pour que Bull puisse gérer la tentative suivante
            throw error;
        }
    }

    @Process('retry-failed-syncs')
    async handleRetryFailedSyncs(job: Job) {
        this.logger.debug('Démarrage de la reprise des synchronisations échouées');

        try {
            // Récupérer toutes les connexions actives
            const { bankConnectionRepo, bankAccountRepo, bankSyncQueue } = this.repositories;

            const activeConnections = await bankConnectionRepo.find({
                where: { status: 'active' }
            });

            // Pour chaque connexion
            for (const connection of activeConnections) {
                // Récupérer les comptes qui n'ont pas été synchronisés récemment
                const accounts = await bankAccountRepo.find({
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
                        await bankSyncQueue.add('sync-transactions', {
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

        const { bankConnectionRepo } = this.repositories;

        try {
            const connection = await bankConnectionRepo.findOneOrFail({
                where: { id: connectionId }
            });

            const provider = await this.bankApiService.loadBankProvider(connection.bankCode);

            // Rafraîchir les tokens
            const tokens = await provider.refreshAccessToken(connection.refreshToken);

            // Mettre à jour la connexion
            connection.accessToken = tokens.accessToken;
            connection.refreshToken = tokens.refreshToken;
            connection.tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

            await bankConnectionRepo.save(connection);

            this.logger.debug(`Rafraîchissement des tokens réussi pour la connexion ${connectionId}`);
        } catch (error) {
            this.logger.error(
                `Erreur lors du rafraîchissement des tokens pour la connexion ${connectionId}`,
                error.stack
            );

            // Si l'erreur indique que le refresh token est invalide, marquer la connexion comme révoquée
            if (error.message.includes('invalid_grant') || error.message.includes('invalid_token')) {
                await bankConnectionRepo.update(connectionId, {
                    status: 'revoked'
                });

                await this.notificationsService.sendBankConnectionNotification({
                    userId: 'user-id',
                    type: 'bank_connection_revoked',
                    data: {
                        connectionId,
                        reason: 'expired_token'
                    }
                });
            }

            throw error;
        }
    }
}