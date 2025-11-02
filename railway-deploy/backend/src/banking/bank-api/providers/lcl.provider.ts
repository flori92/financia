import { Injectable } from '@nestjs/common';
import { BankProvider } from './orabank.provider';

@Injectable()
export class LclProvider implements BankProvider {
  async initializeAuth(config: any): Promise<{ authorizationUrl: string; state: string }> {
    const authUrl = `https://oauth.lcl.fr/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=accounts transactions balance cards&state=${config.state}`;
    
    return {
      authorizationUrl: authUrl,
      state: config.state
    };
  }

  async exchangeCodeForToken(code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: 'lcl_access_token_' + Date.now(),
      refreshToken: 'lcl_refresh_token_' + Date.now()
    };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    return [
      {
        id: 'lcl_compte_pro',
        name: 'Compte Professionnel LCL',
        type: 'business',
        currency: 'EUR',
        balance: 28500.00,
        iban: 'FR7630004000032345678901234',
        bic: 'LCLFRPP'
      },
      {
        id: 'lcl_compte_epargne',
        name: 'Compte Épargne LCL',
        type: 'savings',
        currency: 'EUR',
        balance: 18200.50,
        iban: 'FR7630004000032345678901235',
        bic: 'LCLFRPP'
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, options?: any): Promise<any[]> {
    return [
      {
        id: 'lcl_tx_1',
        date: new Date(),
        amount: 5500.00,
        currency: 'EUR',
        description: 'Paiement client facture 2024-001',
        type: 'credit',
        category: 'business_income'
      },
      {
        id: 'lcl_tx_2',
        date: new Date(),
        amount: -120.00,
        currency: 'EUR',
        description: 'Frais bancaires LCL',
        type: 'debit',
        category: 'bank_fees'
      },
      {
        id: 'lcl_tx_3',
        date: new Date(),
        amount: -890.00,
        currency: 'EUR',
        description: 'Achat matériel bureau',
        type: 'debit',
        category: 'office_supplies'
      }
    ];
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return {
      accessToken: 'lcl_new_access_token_' + Date.now()
    };
  }
}
