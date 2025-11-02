import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class CreditAgricoleProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.creditagricole.com/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance investments&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'ca_access_token_' + Date.now(),
      refreshToken: 'ca_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'ca_compte_courant',
        name: 'Compte Courant Crédit Agricole',
        type: 'current',
        currency: 'EUR',
        balance: 5430.75,
        iban: 'FR7630004000034567890123456',
        bic: 'AGRIFRPP'
      },
      {
        id: 'ca_pret_immobilier',
        name: 'Prêt Immobilier Crédit Agricole',
        type: 'loan',
        currency: 'EUR',
        balance: -125000.00,
        iban: 'FR7630004000034567890123457',
        bic: 'AGRIFRPP'
      },
      {
        id: 'ca_assurance_vie',
        name: 'Assurance Vie Crédit Agricole',
        type: 'insurance',
        currency: 'EUR',
        balance: 35000.00,
        iban: 'FR7630004000034567890123458',
        bic: 'AGRIFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'ca_tx_1',
        date: new Date(),
        amount: 1800.00,
        currency: 'EUR',
        description: 'Remboursement prêt immobilier',
        type: 'debit',
        category: 'loan_payment'
      },
      {
        id: 'ca_tx_2',
        date: new Date(),
        amount: 450.00,
        currency: 'EUR',
        description: 'Allocations familiales',
        type: 'credit',
        category: 'family_benefits'
      },
      {
        id: 'ca_tx_3',
        date: new Date(),
        amount: -67.89,
        currency: 'EUR',
        description: 'Essence Total',
        type: 'debit',
        category: 'transport'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'ca_new_access_token_' + Date.now()
    };
  }
}
