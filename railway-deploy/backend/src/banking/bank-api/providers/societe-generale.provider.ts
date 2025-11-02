import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class SocieteGeneraleProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.societegenerale.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance cards&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'sg_access_token_' + Date.now(),
      refreshToken: 'sg_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'sg_compte_cheques',
        name: 'Compte Chèques Société Générale',
        type: 'current',
        currency: 'EUR',
        balance: 8750.25,
        iban: 'FR7630004000039876543210123',
        bic: 'SOGEFRPP'
      },
      {
        id: 'sg_compte_joint',
        name: 'Compte Joint Société Générale',
        type: 'joint',
        currency: 'EUR',
        balance: 12500.00,
        iban: 'FR7630004000039876543210131',
        bic: 'SOGEFRPP'
      },
      {
        id: 'sg_livret_jeune',
        name: 'Livret Jeune Société Générale',
        type: 'savings',
        currency: 'EUR',
        balance: 1600.00,
        iban: 'FR7630004000039876543210149',
        bic: 'SOGEFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'sg_tx_1',
        date: new Date(),
        amount: 3200.00,
        currency: 'EUR',
        description: 'Prestation freelance',
        type: 'credit',
        category: 'freelance'
      },
      {
        id: 'sg_tx_2',
        date: new Date(),
        amount: -89.90,
        currency: 'EUR',
        description: 'Forfait mobile SFR',
        type: 'debit',
        category: 'telecom'
      },
      {
        id: 'sg_tx_3',
        date: new Date(),
        amount: -234.56,
        currency: 'EUR',
        description: 'Courses Carrefour',
        type: 'debit',
        category: 'groceries'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'sg_new_access_token_' + Date.now()
    };
  }
}
