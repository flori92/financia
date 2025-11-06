import axios from 'axios';
import * as qs from 'qs';
import {
    BankProvider,
    BankAuthOptions,
    BankAuthResult,
    BankTokens
} from '../interfaces/bank-provider.interface';
import { BankAccountDto, BankTransactionDto } from '../dto/bank-api.dto';

export default class BOAProvider implements BankProvider {
    private readonly baseUrl = 'https://api.boagroup.com/v1';
    private readonly authUrl = 'https://auth.boagroup.com/oauth2/authorize';
    private readonly tokenUrl = 'https://auth.boagroup.com/oauth2/token';

    async initializeAuth(options: BankAuthOptions): Promise<BankAuthResult> {
        const params = {
            client_id: options.clientId,
            redirect_uri: options.redirectUri,
            scope: options.scope,
            response_type: 'code',
            state: options.state,
            access_type: 'offline'
        };

        return {
            authorizationUrl: `${this.authUrl}?${qs.stringify(params)}`,
            state: options.state
        };
    }

    async exchangeAuthCode(code: string): Promise<BankTokens> {
        try {
            const response = await axios.post(this.tokenUrl, qs.stringify({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.BOA_CLIENT_ID,
                client_secret: process.env.BOA_CLIENT_SECRET,
                redirect_uri: process.env.BANK_API_REDIRECT_URI
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in
            };
        } catch (error) {
            throw new Error(`BOA Auth Error: ${error.response?.data?.error || error.message}`);
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<BankTokens> {
        try {
            const response = await axios.post(this.tokenUrl, qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.BOA_CLIENT_ID,
                client_secret: process.env.BOA_CLIENT_SECRET
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
            throw new Error(`BOA Token Refresh Error: ${error.response?.data?.error || error.message}`);
        }
    }

    async fetchAccounts(accessToken: string): Promise<BankAccountDto[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/accounts`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            return response.data.accounts.map(account => ({
                id: account.accountNumber,
                name: account.accountName,
                type: this.mapAccountType(account.productType),
                currency: account.currency,
                balance: account.availableBalance,
                iban: account.iban,
                bic: account.bic || 'AFRIXXXX'
            }));
        } catch (error) {
            throw new Error(`BOA Accounts Error: ${error.response?.data?.error || error.message}`);
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
            const params = {
                accountNumber: accountId,
                pageSize: options?.limit || 100,
                fromDate: options?.fromDate?.toISOString().split('T')[0],
                toDate: options?.toDate?.toISOString().split('T')[0]
            };

            const response = await axios.get(`${this.baseUrl}/accounts/${accountId}/transactions`, {
                params,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            return response.data.transactions.map(tx => ({
                id: tx.transactionId,
                date: new Date(tx.valueDate),
                amount: parseFloat(tx.amount),
                currency: tx.currency,
                description: tx.narrative,
                type: parseFloat(tx.amount) >= 0 ? 'credit' : 'debit',
                category: this.categorizeTransaction(tx.narrative),
                status: this.mapTransactionStatus(tx.status)
            }));
        } catch (error) {
            throw new Error(`BOA Transactions Error: ${error.response?.data?.error || error.message}`);
        }
    }

    async validateAccessToken(accessToken: string): Promise<boolean> {
        try {
            await axios.get(`${this.baseUrl}/validate-token`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async revokeAccess(accessToken: string): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/oauth2/revoke`, {
                token: accessToken,
                client_id: process.env.BOA_CLIENT_ID,
                client_secret: process.env.BOA_CLIENT_SECRET
            });
        } catch (error) {
            throw new Error(`BOA Revoke Error: ${error.response?.data?.error || error.message}`);
        }
    }

    private mapAccountType(type: string): string {
        const typeMap = {
            'CURRENT': 'current',
            'SAVINGS': 'savings',
            'TERM_DEPOSIT': 'term',
            'LOAN': 'loan'
        };
        return typeMap[type] || type.toLowerCase();
    }

    private mapTransactionStatus(status: string): 'pending' | 'posted' | 'cancelled' {
        const statusMap = {
            'PENDING': 'pending',
            'COMPLETED': 'posted',
            'FAILED': 'cancelled',
            'REVERSED': 'cancelled'
        };
        return statusMap[status] || 'posted';
    }

    private categorizeTransaction(description: string): string {
        const rules = [
            { pattern: /SAL(AIRE)?|PAIE|WAGE/i, category: 'salary' },
            { pattern: /LOY(ER)?|RENT/i, category: 'housing' },
            { pattern: /REST(O|AURANT)?|FOOD/i, category: 'food' },
            { pattern: /TRANS(PORT)?|TAXI|UBER/i, category: 'transport' },
            { pattern: /TEL(ECOM)?|MOB(ILE)?|INT(ERNET)?/i, category: 'telecom' },
            { pattern: /ELEC|EAU|WATER|SONEB|SBEE/i, category: 'utilities' },
            { pattern: /SCHOOL|UNIV|ECOLE/i, category: 'education' },
            { pattern: /SANTE|PHARM|HOSP|MED/i, category: 'health' },
            { pattern: /SHOP|MARCH|SUPER|HYPER/i, category: 'shopping' }
        ];

        for (const rule of rules) {
            if (rule.pattern.test(description)) {
                return rule.category;
            }
        }

        return 'other';
    }
}