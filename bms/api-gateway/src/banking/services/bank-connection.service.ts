import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { 
    BankConnection,
    BankConnectionStatus,
    BankAccount,
    BankTransaction,
    BankConnectionInit,
    BankAuthComplete
} from '../interfaces/bank.interface';

@Injectable()
export class BankConnectionService {
    private readonly apiClient: AxiosInstance;
    private activeConnections: Map<string, BankConnection>;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.apiClient = axios.create({
            baseURL: this.configService.get<string>('BANK_API_URL'),
            headers: {
                'Authorization': `Bearer ${this.configService.get<string>('BANK_API_KEY')}`,
                'Content-Type': 'application/json'
            }
        });
        this.activeConnections = new Map();
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

            const connection: BankConnection = {
                connectionId: data.connectionId,
                status: BankConnectionStatus.INITIALIZING,
                bankInfo,
                lastSync: null,
                authUrl: data.authUrl
            };

            this.activeConnections.set(connection.connectionId, connection);
            return connection;
        } catch (error) {
            throw this.handleError(error, 'Erreur lors de l\'initialisation de la connexion');
        }
    }

    /**
     * Complète l'authentification d'une connexion bancaire
     */
    async completeAuthentication(authData: BankAuthComplete): Promise<BankConnection> {
        try {
            const { data } = await this.apiClient.post(
                `/connections/${authData.connectionId}/complete`,
                { authCode: authData.authCode }
            );

            const connection = this.activeConnections.get(authData.connectionId);
            if (!connection) {
                throw new Error('Connexion non trouvée');
            }

            connection.status = BankConnectionStatus.ACTIVE;
            connection.accessToken = data.accessToken;

            this.activeConnections.set(authData.connectionId, connection);
            return connection;
        } catch (error) {
            throw this.handleError(error, 'Erreur lors de la complétion de l\'authentification');
        }
    }

    /**
     * Récupère la liste des comptes bancaires
     */
    async fetchAccounts(connectionId: string): Promise<BankAccount[]> {
        try {
            const { data } = await this.apiClient.get(
                `/connections/${connectionId}/accounts`
            );
            return data.accounts;
        } catch (error) {
            throw this.handleError(error, 'Erreur lors de la récupération des comptes');
        }
    }

    /**
     * Récupère les transactions d'un compte
     */
    async fetchTransactions(
        connectionId: string,
        accountId: string,
        startDate?: string,
        endDate?: string
    ): Promise<BankTransaction[]> {
        try {
            const params = new URLSearchParams();
            if (startDate) {
                params.append('startDate', startDate);
            }
            if (endDate) {
                params.append('endDate', endDate);
            }

            const { data } = await this.apiClient.get(
                `/connections/${connectionId}/accounts/${accountId}/transactions`,
                { params }
            );
            return data.transactions;
        } catch (error) {
            throw this.handleError(error, 'Erreur lors de la récupération des transactions');
        }
    }

    /**
     * Rafraîchit une connexion bancaire
     */
    async refreshConnection(connectionId: string): Promise<BankConnection> {
        try {
            const { data } = await this.apiClient.post(
                `/connections/${connectionId}/refresh`
            );

            const connection = this.activeConnections.get(connectionId);
            if (!connection) {
                throw new Error('Connexion non trouvée');
            }

            connection.lastSync = new Date().toISOString();
            this.activeConnections.set(connectionId, connection);

            return connection;
        } catch (error) {
            throw this.handleError(error, 'Erreur lors du rafraîchissement de la connexion');
        }
    }

    /**
     * Vérifie le statut d'une connexion bancaire
     */
    async checkConnectionStatus(connectionId: string): Promise<BankConnectionStatus> {
        try {
            const { data } = await this.apiClient.get(
                `/connections/${connectionId}/status`
            );

            const connection = this.activeConnections.get(connectionId);
            if (connection) {
                connection.status = data.status;
                this.activeConnections.set(connectionId, connection);
            }

            return data.status;
        } catch (error) {
            throw this.handleError(error, 'Erreur lors de la vérification du statut');
        }
    }

    /**
     * Supprime une connexion bancaire
     */
    async deleteConnection(connectionId: string): Promise<void> {
        try {
            await this.apiClient.delete(`/connections/${connectionId}`);
            this.activeConnections.delete(connectionId);
        } catch (error) {
            throw this.handleError(error, 'Erreur lors de la suppression de la connexion');
        }
    }

    private handleError(error: any, message: string): Error {
        console.error(`${message}:`, error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return new Error('Erreur d\'authentification');
            }
            return new Error(`${message}: ${error.response?.data?.message || error.message}`);
        }
        return new Error(message);
    }
}