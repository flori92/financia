import {
  BankAuthOptions,
  BankAuthResult,
  BankProvider,
  BankTokens,
} from '../interfaces/bank-provider.interface';
import { BankAccountDto, BankTransactionDto } from '../dto/bank-api.dto';

/**
 * Provider simplifié pour les comptes BCEAO (gestion trésorerie étatique).
 * Implémentation fallback sans accès API officiel.
 */
export default class BceaoProvider implements BankProvider {
  private readonly bankCode = 'BCEAO';

  async initializeAuth(options: BankAuthOptions): Promise<BankAuthResult> {
    // BCEAO ne propose pas d'OAuth public, on renvoie directement vers l'application
    return {
      authorizationUrl: `${options.redirectUri}?provider=${this.bankCode.toLowerCase()}&state=${options.state}`,
      state: options.state,
    };
  }

  async exchangeAuthCode(code: string): Promise<BankTokens> {
    return this.createStubTokens(code);
  }

  async refreshAccessToken(refreshToken: string): Promise<BankTokens> {
    return this.createStubTokens(refreshToken);
  }

  async fetchAccounts(accessToken: string): Promise<BankAccountDto[]> {
    if (!accessToken) {
      return [];
    }

    return [
      {
        id: `${this.bankCode}-bj-tresor`,
        name: 'Compte Trésor BCEAO',
        type: 'treasury',
        currency: 'XOF',
        balance: 0,
        iban: undefined,
        bic: 'BCEAOXXXX',
      },
    ];
  }

  async fetchTransactions(
    _accessToken: string,
    _accountId: string,
    _options?: { fromDate?: Date; toDate?: Date; limit?: number },
  ): Promise<BankTransactionDto[]> {
    // Pas d'API officielle → retour vide pour l'instant
    return [];
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    return Boolean(accessToken);
  }

  async revokeAccess(_accessToken: string): Promise<void> {
    // Aucun mécanisme spécifique à implémenter
    return;
  }

  private createStubTokens(seed: string): BankTokens {
    return {
      accessToken: `${seed}-access-${Date.now()}`,
      refreshToken: `${seed}-refresh-${Date.now()}`,
      expiresIn: 3600,
    };
  }
}
