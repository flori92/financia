import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

interface BankCredentials {
  bankId: string;
  username: string;
  password: string;
}

@Injectable()
export class BudgetInsightService {
  private readonly baseUrl = process.env.BUDGET_INSIGHT_URL || 'https://api.biapi.pro/2.0';
  private readonly clientId = process.env.BUDGET_INSIGHT_CLIENT_ID;
  private readonly clientSecret = process.env.BUDGET_INSIGHT_CLIENT_SECRET;

  async connect(credentials: BankCredentials, userId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/users/${userId}/connections`,
        {
          id_connector: credentials.bankId,
          login: credentials.username,
          password: credentials.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Connection failed', error.response?.status || 500);
    }
  }

  async getAccounts(connectionId: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/users/me/connections/${connectionId}/accounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.accounts || [];
    } catch (error) {
      throw new HttpException('Failed to fetch accounts', 500);
    }
  }

  async getTransactions(accountId: string, from: Date, to: Date): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/users/me/accounts/${accountId}/transactions`,
        {
          params: {
            min_date: from.toISOString().split('T')[0],
            max_date: to.toISOString().split('T')[0],
          },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.transactions || [];
    } catch (error) {
      throw new HttpException('Failed to fetch transactions', 500);
    }
  }

  async syncTransactions(accountId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      await axios.post(
        `${this.baseUrl}/users/me/accounts/${accountId}/transactions/sync`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      throw new HttpException('Sync failed', 500);
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new HttpException('Budget Insight credentials not configured', 500);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      });
      return response.data.access_token;
    } catch (error) {
      throw new HttpException('Authentication failed', 500);
    }
  }
}
