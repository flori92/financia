import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class MtnProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.mtn.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=mobile_money transactions&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'mtn_access_token_' + Date.now(),
      refreshToken: 'mtn_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'mtn_mm_1',
        name: 'Mobile Money MTN',
        type: 'mobile_money',
        currency: 'XOF',
        balance: 750000
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'mtn_tx_1',
        date: new Date(),
        amount: 50000,
        description: 'Transfert reçu MTN',
        type: 'credit'
      },
      {
        id: 'mtn_tx_2',
        date: new Date(),
        amount: -10000,
        description: 'Frais de transfert MTN',
        type: 'debit'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'mtn_new_access_token_' + Date.now()
    };
  }
}
