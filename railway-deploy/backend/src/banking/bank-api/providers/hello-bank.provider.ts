import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class HelloBankProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.hellobank.fr/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance cards&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'hello_access_token_' + Date.now(),
      refreshToken: 'hello_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'hello_compte_unique',
        name: 'Compte Unique Hello Bank!',
        type: 'current',
        currency: 'EUR',
        balance: 7890.12,
        iban: 'FR7630004000037890123456789',
        bic: 'HELLOFRPP'
      },
      {
        id: 'hello_livret_perso',
        name: 'Livret Personnel Hello Bank!',
        type: 'savings',
        currency: 'EUR',
        balance: 6500.00,
        iban: 'FR7630004000037890123456790',
        bic: 'HELLOFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'hello_tx_1',
        date: new Date(),
        amount: 980.00,
        currency: 'EUR',
        description: 'Vente Vinted',
        type: 'credit',
        category: 'marketplace'
      },
      {
        id: 'hello_tx_2',
        date: new Date(),
        amount: -29.90,
        currency: 'EUR',
        description: 'Amazon Prime',
        type: 'debit',
        category: 'subscription'
      },
      {
        id: 'hello_tx_3',
        date: new Date(),
        amount: -145.60,
        currency: 'EUR',
        description: 'Restaurant Le Bistrot',
        type: 'debit',
        category: 'dining'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'hello_new_access_token_' + Date.now()
    };
  }
}
