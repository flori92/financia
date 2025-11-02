import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class OrangeProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.orange.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=orange_money transactions&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'orange_access_token_' + Date.now(),
      refreshToken: 'orange_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'orange_mm_1',
        name: 'Orange Money',
        type: 'mobile_money',
        currency: 'XOF',
        balance: 1200000
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'orange_tx_1',
        date: new Date(),
        amount: 75000,
        description: 'Paiement Orange Money',
        type: 'credit'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'orange_new_access_token_' + Date.now()
    };
  }
}
