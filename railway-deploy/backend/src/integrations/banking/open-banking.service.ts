import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenBankingService {
  private readonly baseUrl = process.env.OPEN_BANKING_URL || 'https://api.openbanking.com';
  private readonly apiKey = process.env.OPEN_BANKING_API_KEY;

  async initiateConsent(accountId: string, permissions: string[]): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/account-access-consents`,
        {
          Data: {
            Permissions: permissions,
            ExpirationDateTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'x-fapi-financial-id': 'test-bank',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to initiate consent', 500);
    }
  }

  async getAccountInfo(consentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'x-fapi-financial-id': 'test-bank',
            'x-consent-id': consentId,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to get account info', 500);
    }
  }

  async getBalance(accountId: string, consentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/accounts/${accountId}/balances`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'x-consent-id': consentId,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to get balance', 500);
    }
  }

  async getTransactions(accountId: string, consentId: string, fromDate?: string, toDate?: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/accounts/${accountId}/transactions`,
        {
          params: {
            fromBookingDateTime: fromDate,
            toBookingDateTime: toDate,
          },
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'x-consent-id': consentId,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to get transactions', 500);
    }
  }
}
