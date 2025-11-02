import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class CaisseEpargneProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.caisse-epargne.fr/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance investments&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'ce_access_token_' + Date.now(),
      refreshToken: 'ce_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'ce_compte_courant',
        name: 'Compte Courant Caisse d\'Épargne',
        type: 'current',
        currency: 'EUR',
        balance: 12345.67,
        iban: 'FR7630004000035678901234567',
        bic: 'CEPAFRPP'
      },
      {
        id: 'ce_livret_a',
        name: 'Livret A Caisse d\'Épargne',
        type: 'savings',
        currency: 'EUR',
        balance: 22000.00,
        iban: 'FR7630004000035678901234568',
        bic: 'CEPAFRPP'
      },
      {
        id: 'ce_plan_epargne',
        name: 'Plan Épargne Logement Caisse d\'Épargne',
        type: 'savings',
        currency: 'EUR',
        balance: 18500.25,
        iban: 'FR7630004000035678901234569',
        bic: 'CEPAFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'ce_tx_1',
        date: new Date(),
        amount: 2100.00,
        currency: 'EUR',
        description: 'Prime exceptionnelle',
        type: 'credit',
        category: 'bonus'
      },
      {
        id: 'ce_tx_2',
        date: new Date(),
        amount: -156.78,
        currency: 'EUR',
        description: 'EDF - Électricité',
        type: 'debit',
        category: 'utilities'
      },
      {
        id: 'ce_tx_3',
        date: new Date(),
        amount: -45.00,
        currency: 'EUR',
        description: 'Abonnement Spotify',
        type: 'debit',
        category: 'entertainment'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'ce_new_access_token_' + Date.now()
    };
  }
}
