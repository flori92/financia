import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface FedaPayTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined' | 'canceled';
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone_number: {
      number: string;
      country: string;
    };
  };
  mode: string;
  description: string;
  transaction_key: string;
}

@Injectable()
export class FedaPayProvider {
  private readonly logger = new Logger(FedaPayProvider.name);
  private readonly client: AxiosInstance;
  private readonly baseURL: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.baseURL = this.configService.get<string>('MOBILE_MONEY_BASE_URL');
    this.publicKey = this.configService.get<string>('MOBILE_MONEY_PUBLIC_KEY');
    this.privateKey = this.configService.get<string>('MOBILE_MONEY_PRIVATE_KEY');
    this.secretKey = this.configService.get<string>('MOBILE_MONEY_SECRET_KEY');

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.privateKey}`,
      },
    });
  }

  /**
   * Initier une transaction Mobile Money
   */
  async createTransaction(params: {
    amount: number;
    currency: string;
    description: string;
    customer: {
      firstname: string;
      lastname: string;
      email: string;
      phoneNumber: string;
    };
    reference: string;
    callbackUrl?: string;
  }): Promise<FedaPayTransaction> {
    try {
      this.logger.log(`Creating transaction for amount: ${params.amount} ${params.currency}`);

      const response = await this.client.post('/transactions', {
        description: params.description,
        amount: params.amount,
        currency: {
          iso: params.currency,
        },
        callback_url: params.callbackUrl || `${this.configService.get('WEB_APP_URL')}/api/webhooks/fedapay`,
        customer: {
          firstname: params.customer.firstname,
          lastname: params.customer.lastname,
          email: params.customer.email,
          phone_number: {
            number: params.customer.phoneNumber,
            country: 'BJ', // Bénin par défaut
          },
        },
        custom_metadata: {
          reference: params.reference,
        },
      });

      this.logger.log(`Transaction created: ${response.data.v1.id}`);
      return response.data.v1 as FedaPayTransaction;
    } catch (error) {
      this.logger.error('Error creating transaction:', error.response?.data || error.message);
      throw new Error(`Échec création transaction: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Générer un token de paiement (pour mobile money)
   */
  async generateToken(transactionId: number): Promise<{ token: string; url: string }> {
    try {
      this.logger.log(`Generating token for transaction: ${transactionId}`);

      const response = await this.client.post(`/transactions/${transactionId}/token`, {
        // Options supplémentaires si nécessaire
      });

      return {
        token: response.data.token,
        url: response.data.url,
      };
    } catch (error) {
      this.logger.error('Error generating token:', error.response?.data || error.message);
      throw new Error(`Échec génération token: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  async getTransaction(transactionId: number): Promise<FedaPayTransaction> {
    try {
      const response = await this.client.get(`/transactions/${transactionId}`);
      return response.data.v1 as FedaPayTransaction;
    } catch (error) {
      this.logger.error('Error fetching transaction:', error.response?.data || error.message);
      throw new Error(`Échec récupération transaction: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Vérifier une signature webhook
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const webhookSecret = this.configService.get<string>('MOBILE_MONEY_WEBHOOK_SECRET');

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Initier un paiement direct (pour MTN, Moov, etc.)
   */
  async initiateDirectPayment(params: {
    amount: number;
    phoneNumber: string;
    provider: 'mtn' | 'moov' | 'wave';
    reference: string;
    description: string;
  }): Promise<any> {
    try {
      this.logger.log(`Initiating ${params.provider} payment for ${params.phoneNumber}`);

      // Pour Mobile Money direct (débit depuis compte client)
      const response = await this.client.post('/payouts', {
        amount: params.amount,
        currency: {
          iso: 'XOF',
        },
        mode: this.mapProviderToMode(params.provider),
        recipient: {
          phone_number: {
            number: params.phoneNumber,
            country: 'BJ',
          },
        },
        description: params.description,
        custom_metadata: {
          reference: params.reference,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error initiating direct payment:', error.response?.data || error.message);
      throw new Error(`Échec paiement direct: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mapper les providers aux modes FedaPay
   */
  private mapProviderToMode(provider: 'mtn' | 'moov' | 'wave'): string {
    const providerMap = {
      mtn: 'mtn_ci', // ou mtn_bj selon disponibilité
      moov: 'moov_bj',
      wave: 'wave_ci',
    };
    return providerMap[provider] || 'mtn_bj';
  }

  /**
   * Générer les données pour QR Code
   */
  generateQRCodeData(params: {
    transactionId: number;
    amount: number;
    reference: string;
    token?: string;
  }): string {
    const qrData = {
      provider: 'fedapay',
      transaction_id: params.transactionId,
      amount: params.amount,
      currency: 'XOF',
      reference: params.reference,
      token: params.token,
      url: `${this.baseURL}/transactions/${params.transactionId}/checkout`,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(qrData);
  }
}
