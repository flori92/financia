import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class BnpParibasProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.bnpparibas.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance history&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'bnp_access_token_' + Date.now(),
      refreshToken: 'bnp_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'bnp_compte_courant',
        name: 'Compte Courant BNP Paribas',
        type: 'current',
        currency: 'EUR',
        balance: 15000.50,
        iban: 'FR7630004000031234567890143',
        bic: 'BNPAFRPP'
      },
      {
        id: 'bnp_livret_a',
        name: 'Livret A BNP Paribas',
        type: 'savings',
        currency: 'EUR',
        balance: 22000.00,
        iban: 'FR7630004000031234567890150',
        bic: 'BNPAFRPP'
      },
      {
        id: 'bnp_pea',
        name: 'PEA BNP Paribas',
        type: 'investment',
        currency: 'EUR',
        balance: 45000.75,
        iban: 'FR7630004000031234567890167',
        bic: 'BNPAFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'bnp_tx_1',
        date: new Date(),
        amount: 2500.00,
        currency: 'EUR',
        description: 'Virement salaire',
        type: 'credit',
        category: 'salary'
      },
      {
        id: 'bnp_tx_2',
        date: new Date(),
        amount: -45.80,
        currency: 'EUR',
        description: 'Abonnement Netflix',
        type: 'debit',
        category: 'entertainment'
      },
      {
        id: 'bnp_tx_3',
        date: new Date(),
        amount: -1200.00,
        currency: 'EUR',
        description: 'Loyer appartement Paris',
        type: 'debit',
        category: 'housing'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'bnp_new_access_token_' + Date.now()
    };
  }
}
