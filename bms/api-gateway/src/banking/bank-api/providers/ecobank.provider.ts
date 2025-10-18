import axios from 'axios';
import * as qs from 'qs';
import { 
    BankProvider,
    BankAuthOptions,
    BankAuthResult,
    BankTokens 
} from '../interfaces/bank-provider.interface';
import { BankAccountDto, BankTransactionDto } from '../dto/bank-api.dto';

export class EcobankProvider implements BankProvider {
    private readonly baseUrl = 'https://developer.ecobank.com/api/v1';
    private readonly authUrl = 'https://developer.ecobank.com/oauth/authorize';
    private readonly tokenUrl = 'https://developer.ecobank.com/oauth/token';

    async initializeAuth(options: BankAuthOptions): Promise<BankAuthResult> {
        const params = {
            client_id: options.clientId,
            redirect_uri: options.redirectUri,
            scope: options.scope,
            response_type: 'code',
            state: options.state
        };

        const authorizationUrl = `${this.authUrl}?${qs.stringify(params)}`;

        return {
            authorizationUrl,
            state: options.state
        };
    }

    async exchangeAuthCode(code: string): Promise<BankTokens> {
        try {
            const response = await axios.post(this.tokenUrl, qs.stringify({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.ECOBANK_CLIENT_ID,
                client_secret: process.env.ECOBANK_CLIENT_SECRET,
                redirect_uri: process.env.BANK_API_REDIRECT_URI
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in
            };
        } catch (error) {
            throw new Error(`Erreur d'échange de code Ecobank: ${error.message}`);
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<BankTokens> {
        try {
            const response = await axios.post(this.tokenUrl, qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.ECOBANK_CLIENT_ID,
                client_secret: process.env.ECOBANK_CLIENT_SECRET
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in
            };
        } catch (error) {
            throw new Error(`Erreur de rafraîchissement de token Ecobank: ${error.message}`);
        }
    }

    async fetchAccounts(accessToken: string): Promise<BankAccountDto[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/accounts`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return response.data.accounts.map(account => ({
                id: account.accountId,
                name: account.accountName,
                type: this.mapAccountType(account.accountType),
                currency: account.currency,
                balance: parseFloat(account.balance),
                iban: account.iban,
                bic: account.bic || 'ECOCBFXX'
            }));
        } catch (error) {
            throw new Error(`Erreur de récupération des comptes Ecobank: ${error.message}`);
        }
    }

    async fetchTransactions(
        accessToken: string,
        accountId: string,
        options?: {
            fromDate?: Date;
            toDate?: Date;
            limit?: number;
        }
    ): Promise<BankTransactionDto[]> {
        try {
            const params: any = {
                accountId,
                maxResults: options?.limit || 100
            };

            if (options?.fromDate) {
                params.fromDate = options.fromDate.toISOString().split('T')[0];
            }

            if (options?.toDate) {
                params.toDate = options.toDate.toISOString().split('T')[0];
            }

            const response = await axios.get(`${this.baseUrl}/accounts/${accountId}/transactions`, {
                params,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return response.data.transactions.map(tx => ({
                id: tx.transactionId,
                date: new Date(tx.valueDate),
                amount: parseFloat(tx.amount),
                currency: tx.currency,
                description: tx.description,
                type: parseFloat(tx.amount) >= 0 ? 'credit' : 'debit',
                category: this.categorizeTransaction(tx.description),
                status: this.mapTransactionStatus(tx.status)
            }));
        } catch (error) {
            throw new Error(`Erreur de récupération des transactions Ecobank: ${error.message}`);
        }
    }

    async validateAccessToken(accessToken: string): Promise<boolean> {
        try {
            await axios.get(`${this.baseUrl}/validate-token`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async revokeAccess(accessToken: string): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/oauth/revoke`, {
                token: accessToken,
                client_id: process.env.ECOBANK_CLIENT_ID,
                client_secret: process.env.ECOBANK_CLIENT_SECRET
            });
        } catch (error) {
            throw new Error(`Erreur de révocation d'accès Ecobank: ${error.message}`);
        }
    }

    private mapAccountType(type: string): string {
        const typeMap = {
            'CURRENT': 'current',
            'SAVINGS': 'savings',
            'FIXED_DEPOSIT': 'term',
            'LOAN': 'loan'
        };
        return typeMap[type] || type.toLowerCase();
    }

    private mapTransactionStatus(status: string): 'pending' | 'posted' | 'cancelled' {
        const statusMap = {
            'PENDING': 'pending',
            'POSTED': 'posted',
            'CANCELLED': 'cancelled',
            'BOOKED': 'posted',
            'REJECTED': 'cancelled'
        };
        return statusMap[status] || 'posted';
    }

    private categorizeTransaction(description: string): string {
        // Logique basique de catégorisation
        const keywords = {
            'SALAIRE|PAIE|WAGE': 'salary',
            'LOYER|RENT': 'housing',
            'RESTO|REST\\.?|FOOD': 'food',
            'TRANSPORT|TAXI|UBER': 'transport',
            'TEL|MOBILE|INTERNET': 'telecom',
            'ELEC|WATER|EAU': 'utilities'
        };

        for (const [pattern, category] of Object.entries(keywords)) {
            if (new RegExp(pattern, 'i').test(description)) {
                return category;
            }
        }

        return 'other';
    }
}