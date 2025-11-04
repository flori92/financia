import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BridgeApiService {
  private readonly baseUrl = process.env.BRIDGE_API_URL || 'https://api.bridgeapi.io/v2';
  private readonly clientId = process.env.BRIDGE_CLIENT_ID;
  private readonly clientSecret = process.env.BRIDGE_CLIENT_SECRET;

  async createUser(email: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/users`,
        { email },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Bridge-Version': '2021-06-01',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to create Bridge user', 500);
    }
  }

  async connectBank(userId: string, bankId: number): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/connect/items/add`,
        {
          prefill_email: userId,
          country: 'fr',
          bank_id: bankId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to connect bank', 500);
    }
  }

  async getAccounts(itemId: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/items/${itemId}/accounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.resources || [];
    } catch (error) {
      throw new HttpException('Failed to fetch accounts', 500);
    }
  }

  async getTransactions(accountId: string, since?: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/accounts/${accountId}/transactions`,
        {
          params: since ? { since } : {},
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.resources || [];
    } catch (error) {
      throw new HttpException('Failed to fetch transactions', 500);
    }
  }

  async refreshItem(itemId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      await axios.post(
        `${this.baseUrl}/items/${itemId}/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      throw new HttpException('Refresh failed', 500);
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new HttpException('Bridge API credentials not configured', 500);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/authenticate`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });
      return response.data.access_token;
    } catch (error) {
      throw new HttpException('Authentication failed', 500);
    }
  }
}
