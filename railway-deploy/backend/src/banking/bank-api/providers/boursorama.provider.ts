import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class BoursoramaProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.boursorama.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance stocks&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'bourse_access_token_' + Date.now(),
      refreshToken: 'bourse_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'bourse_compte_titres',
        name: 'Compte Titres Boursorama',
        type: 'investment',
        currency: 'EUR',
        balance: 75500.00,
        iban: 'FR7630004000036789012345678',
        bic: 'BOURFRPP'
      },
      {
        id: 'bourse_compte_courant',
        name: 'Compte Courant Boursorama',
        type: 'current',
        currency: 'EUR',
        balance: 3450.25,
        iban: 'FR7630004000036789012345679',
        bic: 'BOURFRPP'
      },
      {
        id: 'bourse_livret',
        name: 'Livret Boursorama',
        type: 'savings',
        currency: 'EUR',
        balance: 8500.00,
        iban: 'FR7630004000036789012345680',
        bic: 'BOURFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'bourse_tx_1',
        date: new Date(),
        amount: 1250.00,
        currency: 'EUR',
        description: 'Dividendes actions Apple',
        type: 'credit',
        category: 'investment_income'
      },
      {
        id: 'bourse_tx_2',
        date: new Date(),
        amount: -500.00,
        currency: 'EUR',
        description: 'Achat actions Tesla',
        type: 'debit',
        category: 'investment'
      },
      {
        id: 'bourse_tx_3',
        date: new Date(),
        amount: -2.99,
        currency: 'EUR',
        description: 'Frais de courtage Boursorama',
        type: 'debit',
        category: 'brokerage_fees'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'bourse_new_access_token_' + Date.now()
    };
  }
}
