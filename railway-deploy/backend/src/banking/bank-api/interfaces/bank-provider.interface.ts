import { BankAccountDto, BankTransactionDto } from '../dto/bank-api.dto';

export interface BankAuthOptions {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    state: string;
}

export interface BankAuthResult {
    authorizationUrl: string;
    state: string;
}

export interface BankTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface BankProvider {
    /**
     * Initialise le processus d'authentification OAuth2
     */
    initializeAuth(options: BankAuthOptions): Promise<BankAuthResult>;

    /**
     * Échange le code d'autorisation contre des tokens d'accès
     */
    exchangeAuthCode(code: string): Promise<BankTokens>;

    /**
     * Rafraîchit le token d'accès
     */
    refreshAccessToken(refreshToken: string): Promise<BankTokens>;

    /**
     * Récupère la liste des comptes bancaires
     */
    fetchAccounts(accessToken: string): Promise<BankAccountDto[]>;

    /**
     * Récupère les transactions pour un compte donné
     */
    fetchTransactions(
        accessToken: string,
        accountId: string,
        options?: {
            fromDate?: Date;
            toDate?: Date;
            limit?: number;
        }
    ): Promise<BankTransactionDto[]>;

    /**
     * Vérifie si un token d'accès est toujours valide
     */
    validateAccessToken(accessToken: string): Promise<boolean>;

    /**
     * Révoque l'accès
     */
    revokeAccess(accessToken: string): Promise<void>;
}