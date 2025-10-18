import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { 
    BankConnection,
    BankConnectionStatus,
    BankConnectionInit,
    BankAuthComplete
} from '../interfaces/bank.interface';
import { BankConnection as BankConnectionEntity } from '../entities/bank-connection.entity';

@Injectable()
export class BankConnectionService {
    private readonly logger = new Logger(BankConnectionService.name);
    private readonly apiClient: AxiosInstance;

    constructor(
        @InjectRepository(BankConnectionEntity)
        private readonly bankConnectionRepo: Repository<BankConnectionEntity>,
        private readonly configService: ConfigService
    ) {
        this.apiClient = axios.create({
            baseURL: this.configService.get<string>('BANK_API_URL'),
            headers: {
                'Authorization': `Bearer ${this.configService.get<string>('BANK_API_KEY')}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Initialise une nouvelle connexion bancaire
     */
    async initializeConnection(bankInfo: BankConnectionInit): Promise<BankConnection> {
        try {
            const { data } = await this.apiClient.post('/connections/init', {
                bankId: bankInfo.bankId,
                userId: bankInfo.userId,
                accountType: bankInfo.accountType || 'business'
            });

            const connection = this.bankConnectionRepo.create({
                bankId: bankInfo.bankId,
                userId: bankInfo.userId,
                status: BankConnectionStatus.INITIALIZING,
                bankInfo,
                authUrl: data.authUrl
            });

            await this.bankConnectionRepo.save(connection);

            return {
                connectionId: connection.id,
                status: connection.status,
                bankInfo,
                lastSync: null,
                authUrl: data.authUrl
            };
        } catch (error) {
            this.logger.error('Erreur lors de l\'initialisation de la connexion:', error);
            throw this.handleError(error, 'Erreur lors de l\'initialisation de la connexion');
        }
    }

    /**
     * Complète l'authentification d'une connexion bancaire
     */
    async completeAuthentication(authData: BankAuthComplete): Promise<BankConnection> {
        try {
            const connection = await this.bankConnectionRepo.findOne({ 
                where: { id: authData.connectionId }
            });

            if (!connection) {
                throw new Error('Connexion non trouvée');
            }

            const { data } = await this.apiClient.post(
                `/connections/${authData.connectionId}/complete`,
                { authCode: authData.authCode }
            );

            connection.status = BankConnectionStatus.ACTIVE;
            connection.accessToken = data.accessToken;
            connection.refreshToken = data.refreshToken;
            await this.bankConnectionRepo.save(connection);

            return {
                connectionId: connection.id,
                status: connection.status,
                bankInfo: connection.bankInfo,
                lastSync: connection.lastSync?.toISOString() || null,
                accessToken: connection.accessToken
            };
        } catch (error) {
            this.logger.error('Erreur lors de la complétion de l\'authentification:', error);
            throw this.handleError(error, 'Erreur lors de la complétion de l\'authentification');
        }
    }

    /**
     * Rafraîchit une connexion bancaire
     */
    async refreshConnection(connectionId: string): Promise<BankConnection> {
        try {
            const connection = await this.bankConnectionRepo.findOne({
                where: { id: connectionId }
            });

            if (!connection) {
                throw new Error('Connexion non trouvée');
            }

            const { data } = await this.apiClient.post(
                `/connections/${connectionId}/refresh`,
                { refreshToken: connection.refreshToken }
            );

            connection.accessToken = data.accessToken;
            connection.refreshToken = data.refreshToken;
            connection.lastSync = new Date();
            await this.bankConnectionRepo.save(connection);

            return {
                connectionId: connection.id,
                status: connection.status,
                bankInfo: connection.bankInfo,
                lastSync: connection.lastSync.toISOString(),
                accessToken: connection.accessToken
            };
        } catch (error) {
            this.logger.error('Erreur lors du rafraîchissement de la connexion:', error);
            throw this.handleError(error, 'Erreur lors du rafraîchissement de la connexion');
        }
    }

    /**
     * Vérifie le statut d'une connexion bancaire
     */
    async checkConnectionStatus(connectionId: string): Promise<BankConnectionStatus> {
        try {
            const connection = await this.bankConnectionRepo.findOne({
                where: { id: connectionId }
            });

            if (!connection) {
                throw new Error('Connexion non trouvée');
            }

            const { data } = await this.apiClient.get(
                `/connections/${connectionId}/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${connection.accessToken}`
                    }
                }
            );

            connection.status = data.status;
            await this.bankConnectionRepo.save(connection);

            return connection.status;
        } catch (error) {
            this.logger.error('Erreur lors de la vérification du statut:', error);
            throw this.handleError(error, 'Erreur lors de la vérification du statut');
        }
    }

    /**
     * Supprime une connexion bancaire
     */
    async deleteConnection(connectionId: string): Promise<void> {
        try {
            const connection = await this.bankConnectionRepo.findOne({
                where: { id: connectionId }
            });

            if (!connection) {
                throw new Error('Connexion non trouvée');
            }

            await this.apiClient.delete(
                `/connections/${connectionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${connection.accessToken}`
                    }
                }
            );

            await this.bankConnectionRepo.remove(connection);
        } catch (error) {
            this.logger.error('Erreur lors de la suppression de la connexion:', error);
            throw this.handleError(error, 'Erreur lors de la suppression de la connexion');
        }
    }

    private handleError(error: any, message: string): Error {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return new Error('Erreur d\'authentification');
            }
            return new Error(`${message}: ${error.response?.data?.message || error.message}`);
        }
        return new Error(message);
    }
}