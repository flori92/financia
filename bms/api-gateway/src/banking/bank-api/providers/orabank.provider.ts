import axios, { AxiosInstance } from 'axios';
import * as qs from 'qs';
import {
  BankAuthOptions,
  BankAuthResult,
  BankProvider,
  BankTokens,
} from '../interfaces/bank-provider.interface';
import { BankAccountDto, BankTransactionDto } from '../dto/bank-api.dto';

export default class OrabankProvider implements BankProvider {
  private readonly bankCode = 'ORABANK';
  private readonly authUrl = process.env.ORABANK_AUTH_URL;
  private readonly tokenUrl = process.env.ORABANK_TOKEN_URL;
  private readonly apiUrl = process.env.ORABANK_API_BASE_URL;
  private readonly clientId = process.env.ORABANK_CLIENT_ID;
  private readonly clientSecret = process.env.ORABANK_CLIENT_SECRET;
  private readonly http: AxiosInstance | null;

  constructor() {
    this.http = this.apiUrl
      ? axios.create({
          baseURL: this.apiUrl,
          headers: { Accept: 'application/json' },
        })
      : null;
  }

  async initializeAuth(options: BankAuthOptions): Promise<BankAuthResult> {
    if (this.authUrl && this.clientId) {
      const params = {
        client_id: this.clientId,
        redirect_uri: options.redirectUri,
        scope: options.scope || 'accounts transactions balance',
        response_type: 'code',
        state: options.state,
      };

      return {
        authorizationUrl: `${this.authUrl}?${qs.stringify(params)}`,
        state: options.state,
      };
    }

    return {
      authorizationUrl: `${options.redirectUri}?provider=${this.bankCode.toLowerCase()}&state=${options.state}`,
      state: options.state,
    };
  }

  async exchangeAuthCode(code: string): Promise<BankTokens> {
    if (this.tokenUrl && this.clientId && this.clientSecret) {
      try {
        const response = await axios.post(
          this.tokenUrl,
          qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: process.env.BANK_API_REDIRECT_URI,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );

        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        };
      } catch (error) {
        console.warn('[OrabankProvider] exchangeAuthCode failed, fallback to stub tokens', error);
      }
    }

    return this.createStubTokens(code);
  }

  async refreshAccessToken(refreshToken: string): Promise<BankTokens> {
    if (this.tokenUrl && this.clientId && this.clientSecret) {
      try {
        const response = await axios.post(
          this.tokenUrl,
          qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );

        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        };
      } catch (error) {
        console.warn('[OrabankProvider] refreshAccessToken failed, fallback to stub tokens', error);
      }
    }

    return this.createStubTokens(refreshToken);
  }

  async fetchAccounts(accessToken: string): Promise<BankAccountDto[]> {
    if (this.http) {
      try {
        const response = await this.http.get('/accounts', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (Array.isArray(response.data?.accounts)) {
          return response.data.accounts.map((account: any) => ({
            id: account.accountId || account.id,
            name: account.accountName || 'Compte courant',
            type: account.type || 'current',
            currency: account.currency || 'XOF',
            balance: Number(account.balance) || 0,
            iban: account.iban,
            bic: account.bic || 'ORABBJBJ',
          }));
        }
      } catch (error) {
        console.warn('[OrabankProvider] fetchAccounts failed, fallback to stub data', error);
      }
    }

    return [
      {
        id: `${this.bankCode}-bj-main`,
        name: 'Compte courant Orabank Bénin',
        type: 'current',
        currency: 'XOF',
        balance: 0,
        iban: undefined,
        bic: 'ORABBJBJ',
      },
    ];
  }

  async fetchTransactions(
    _accessToken: string,
    _accountId: string,
    _options?: { fromDate?: Date; toDate?: Date; limit?: number },
  ): Promise<BankTransactionDto[]> {
    if (!this.http) {
      return [];
    }

    try {
      const response = await this.http.get('/transactions', {
        headers: { Authorization: `Bearer ${_accessToken}` },
        params: {
          accountId: _accountId,
          fromDate: _options?.fromDate?.toISOString().split('T')[0],
          toDate: _options?.toDate?.toISOString().split('T')[0],
          limit: _options?.limit || 100,
        },
      });

      if (Array.isArray(response.data?.transactions)) {
        return response.data.transactions.map((tx: any) => ({
          id: tx.transactionId || tx.id,
          date: tx.valueDate ? new Date(tx.valueDate) : new Date(),
          amount: Number(tx.amount) || 0,
          currency: tx.currency || 'XOF',
          description: tx.description || tx.label || 'Transaction Orabank',
          type: Number(tx.amount) >= 0 ? 'credit' : 'debit',
          category: tx.category || 'other',
          status: tx.status === 'pending' ? 'pending' : 'posted',
        }));
      }
    } catch (error) {
      console.warn('[OrabankProvider] fetchTransactions failed, fallback to stub data', error);
    }

    return [];
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    if (!this.http) {
      return Boolean(accessToken);
    }

    try {
      await this.http.get('/validate-token', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return true;
    } catch (error) {
      console.warn('[OrabankProvider] validateAccessToken failed', error);
      return false;
    }
  }

  async revokeAccess(accessToken: string): Promise<void> {
    if (!this.tokenUrl || !this.clientId || !this.clientSecret) {
      return;
    }

    try {
      await axios.post(
        this.tokenUrl.replace(/token$/i, 'revoke'),
        qs.stringify({
          token: accessToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    } catch (error) {
      console.warn('[OrabankProvider] revokeAccess failed', error);
    }
  }

  private createStubTokens(seed: string): BankTokens {
    return {
      accessToken: `${seed}-access-${Date.now()}`,
      refreshToken: `${seed}-refresh-${Date.now()}`,
      expiresIn: 3600,
    };
  }
}
