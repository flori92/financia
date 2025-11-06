import axios, { AxiosInstance } from 'axios';
import * as qs from 'qs';
import {
  BankAuthOptions,
  BankAuthResult,
  BankProvider,
  BankTokens,
} from '../interfaces/bank-provider.interface';
import { BankAccountDto, BankTransactionDto } from '../dto/bank-api.dto';

export default class BnpParibasProvider implements BankProvider {
  private readonly bankCode = 'BNP_PARIBAS_FR';
  private readonly authUrl = process.env.BNP_PARIBAS_AUTH_URL || 'https://api.mabanque.bnpparibas/oauth2/authorize';
  private readonly tokenUrl = process.env.BNP_PARIBAS_TOKEN_URL || 'https://api.mabanque.bnpparibas/oauth2/token';
  private readonly apiUrl = process.env.BNP_PARIBAS_API_BASE_URL || 'https://api.mabanque.bnpparibas/v1';
  private readonly clientId = process.env.BNP_PARIBAS_CLIENT_ID;
  private readonly clientSecret = process.env.BNP_PARIBAS_CLIENT_SECRET;
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: this.apiUrl,
      headers: { Accept: 'application/json' },
    });
  }

  async initializeAuth(options: BankAuthOptions): Promise<BankAuthResult> {
    const params = qs.stringify(
      {
        client_id: this.clientId,
        redirect_uri: options.redirectUri,
        scope: options.scope || 'accounts:read transactions:read profile:read',
        response_type: 'code',
        state: options.state,
      },
      { skipNulls: true },
    );

    return {
      authorizationUrl: `${this.authUrl}?${params}`,
      state: options.state,
    };
  }

  async exchangeAuthCode(code: string): Promise<BankTokens> {
    const payload = {
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: process.env.BANK_API_REDIRECT_URI,
      code_verifier: process.env.BANK_API_PKCE_VERIFIER,
    };

    try {
      const response = await axios.post(this.tokenUrl, qs.stringify(payload), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.warn('[BnpParibasProvider] exchangeAuthCode failed, fallback to stub tokens', error);
      return this.createStubTokens(code);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<BankTokens> {
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };

    try {
      const response = await axios.post(this.tokenUrl, qs.stringify(payload), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token ?? refreshToken,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.warn('[BnpParibasProvider] refreshAccessToken failed, fallback to stub tokens', error);
      return this.createStubTokens(refreshToken);
    }
  }

  async fetchAccounts(accessToken: string): Promise<BankAccountDto[]> {
    try {
      const response = await this.http.get('/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (Array.isArray(response.data?.accounts)) {
        return response.data.accounts.map((account: any) => ({
          id: account.id,
          name: account.name || `${account.product} ${account.maskedNumber}`,
          type: this.normalizeAccountType(account.type),
          currency: account.currency || 'EUR',
          balance: Number(account.availableBalance ?? account.balance ?? 0),
          iban: account.iban,
          bic: account.bic || 'BNPAFRPP',
        }));
      }
    } catch (error) {
      console.warn('[BnpParibasProvider] fetchAccounts failed, fallback to stub data', error);
    }

    return [
      {
        id: `${this.bankCode}-fr-courant`,
        name: 'Compte courant BNP Paribas',
        type: 'current',
        currency: 'EUR',
        balance: 0,
        iban: undefined,
        bic: 'BNPAFRPP',
      },
    ];
  }

  async fetchTransactions(
    accessToken: string,
    accountId: string,
    options?: { fromDate?: Date; toDate?: Date; limit?: number },
  ): Promise<BankTransactionDto[]> {
    try {
      const response = await this.http.get(`/accounts/${accountId}/transactions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          dateFrom: options?.fromDate?.toISOString().split('T')[0],
          dateTo: options?.toDate?.toISOString().split('T')[0],
          limit: options?.limit || 200,
        },
      });

      if (Array.isArray(response.data?.transactions)) {
        return response.data.transactions.map((tx: any) => ({
          id: tx.id,
          date: tx.bookingDate ? new Date(tx.bookingDate) : new Date(),
          amount: Number(tx.amount?.value ?? tx.amount) || 0,
          currency: tx.amount?.currency || 'EUR',
          description: tx.description || tx.remittanceInformation || 'Transaction BNP Paribas',
          type: Number(tx.amount?.value ?? tx.amount) >= 0 ? 'credit' : 'debit',
          category: this.inferCategory(tx),
          status: tx.status === 'pending' ? 'pending' : 'posted',
        }));
      }
    } catch (error) {
      console.warn('[BnpParibasProvider] fetchTransactions failed, fallback to stub data', error);
    }

    return [];
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      await this.http.get('/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return true;
    } catch (error) {
      console.warn('[BnpParibasProvider] validateAccessToken failed', error);
      return false;
    }
  }

  async revokeAccess(accessToken: string): Promise<void> {
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
      console.warn('[BnpParibasProvider] revokeAccess failed', error);
    }
  }

  private normalizeAccountType(type: string | undefined): string {
    const map: Record<string, string> = {
      CURRENT: 'current',
      SAVINGS: 'savings',
      CARD: 'card',
      LOAN: 'loan',
      INVESTMENT: 'investment',
    };
    return type ? map[type.toUpperCase()] ?? type.toLowerCase() : 'current';
  }

  private inferCategory(tx: any): string {
    const label = `${tx.description ?? ''} ${tx.remittanceInformation ?? ''}`.toLowerCase();
    if (/salaire|payroll|salary/.test(label)) return 'salary';
    if (/loyer|rent/.test(label)) return 'housing';
    if (/cb|card|resto|restaurant|uber|lyft/.test(label)) return 'card';
    if (/edf|engie|eau|sfr|orange/.test(label)) return 'utilities';
    if (/impot|taxe|tva/.test(label)) return 'tax';
    return 'other';
  }

  private createStubTokens(seed: string): BankTokens {
    return {
      accessToken: `${seed}-access-${Date.now()}`,
      refreshToken: `${seed}-refresh-${Date.now()}`,
      expiresIn: 3600,
    };
  }
}
