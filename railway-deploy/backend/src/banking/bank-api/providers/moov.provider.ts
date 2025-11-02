import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class MoovProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.moov.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=moov_money transactions&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'moov_access_token_' + Date.now(),
      refreshToken: 'moov_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'moov_mm_1',
        name: 'Moov Money',
        type: 'mobile_money',
        currency: 'XOF',
        balance: 450000
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'moov_tx_1',
        date: new Date(),
        amount: 30000,
        description: 'Transfert Moov Money',
        type: 'credit'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'moov_new_access_token_' + Date.now()
    };
  }
}
