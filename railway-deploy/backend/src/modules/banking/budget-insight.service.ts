import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Intégration Budget Insight pour agrégation bancaire
 */
@Injectable()
export class BudgetInsightService {
  private readonly baseUrl = 'https://api.biapi.pro/2.0';
  private accessToken: string;

  constructor(private configService: ConfigService) {}

  /**
   * Authentification
   */
  async authenticate(): Promise<void> {
    const clientId = this.configService.get('BUDGET_INSIGHT_CLIENT_ID');
    const clientSecret = this.configService.get('BUDGET_INSIGHT_CLIENT_SECRET');

    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new HttpException('Budget Insight auth failed', 401);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  /**
   * Récupérer les comptes bancaires
   */
  async getAccounts(userId: string): Promise<any[]> {
    await this.ensureAuthenticated();

    const response = await fetch(`${this.baseUrl}/users/${userId}/accounts`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    if (!response.ok) {
      throw new HttpException('Failed to fetch accounts', response.status);
    }

    const data = await response.json();
    return data.accounts || [];
  }

  /**
   * Récupérer les transactions
   */
  async getTransactions(userId: string, accountId: string, since?: Date): Promise<any[]> {
    await this.ensureAuthenticated();

    const params = new URLSearchParams();
    if (since) {
      params.append('min_date', since.toISOString().split('T')[0]);
    }

    const response = await fetch(
      `${this.baseUrl}/users/${userId}/accounts/${accountId}/transactions?${params}`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );

    if (!response.ok) {
      throw new HttpException('Failed to fetch transactions', response.status);
    }

    const data = await response.json();
    return data.transactions || [];
  }

  /**
   * Synchroniser un compte
   */
  async syncAccount(userId: string, connectionId: string): Promise<void> {
    await this.ensureAuthenticated();

    const response = await fetch(
      `${this.baseUrl}/users/${userId}/connections/${connectionId}/sources`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );

    if (!response.ok) {
      throw new HttpException('Sync failed', response.status);
    }
  }

  /**
   * Transformer transaction Budget Insight en format BMS
   */
  transformTransaction(biTransaction: any): any {
    return {
      transactionDate: new Date(biTransaction.date),
      valueDate: new Date(biTransaction.value_date || biTransaction.date),
      amount: biTransaction.value,
      label: biTransaction.original_wording || biTransaction.wording,
      reference: biTransaction.id_transaction,
      counterpartyName: biTransaction.counterparty_name,
      category: biTransaction.category?.name
    };
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }
  }
}
