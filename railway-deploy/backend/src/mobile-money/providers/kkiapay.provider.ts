import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface KkiapayTransaction {
  transactionId: string;
  status: string;
  amount: number;
  state: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  type: string;
  source: string;
  destination: string;
  performedAt: string;
}

@Injectable()
export class KkiapayProvider {
  private readonly logger = new Logger(KkiapayProvider.name);
  private readonly client: AxiosInstance;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly secretKey: string;
  private readonly baseURL = 'https://api.kkiapay.me';

  constructor(private configService: ConfigService) {
    this.publicKey = this.configService.get<string>('MOBILE_MONEY_PUBLIC_KEY');
    this.privateKey = this.configService.get<string>('MOBILE_MONEY_PRIVATE_KEY');
    this.secretKey = this.configService.get<string>('MOBILE_MONEY_SECRET_KEY');

    // Vérifier que les clés sont bien chargées
    this.logger.log('Configuration Kkiapay:');
    this.logger.log(`Public Key: ${this.publicKey ? this.publicKey.substring(0, 10) + '...' : 'Non définie'}`);
    this.logger.log(`Private Key: ${this.privateKey ? this.privateKey.substring(0, 10) + '...' : 'Non définie'}`);
    this.logger.log(`Secret Key: ${this.secretKey ? this.secretKey.substring(0, 10) + '...' : 'Non définie'}`);

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.privateKey,
      },
    });
  }

  /**
   * Initier une transaction de paiement
   * KkiaPay fonctionne avec un widget côté client
   * Cette méthode génère les données nécessaires pour le widget
   */
  async initializePayment(params: {
    amount: number;
    phone: string;
    name: string;
    reason?: string;
    sandbox?: boolean;
  }): Promise<{
    publicKey: string;
    amount: number;
    phone: string;
    name: string;
    data: string;
  }> {
    try {
      this.logger.log(`Initializing payment for ${params.phone}: ${params.amount} XOF`);

      // KkiaPay utilise un widget côté client avec la clé publique
      // On retourne les données pour initialiser le widget
      return {
        publicKey: this.publicKey,
        amount: params.amount,
        phone: params.phone,
        name: params.name,
        data: JSON.stringify({
          reason: params.reason || 'Paiement BMS',
          sandbox: params.sandbox !== false,
        }),
      };
    } catch (error) {
      this.logger.error('Error initializing payment:', error.message);
      throw new Error(`Échec initialisation paiement: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  async verifyTransaction(transactionId: string): Promise<KkiapayTransaction> {
    try {
      this.logger.log(`Verifying transaction: ${transactionId}`);

      const response = await this.client.get(`/api/v1/transactions/${transactionId}`);

      return response.data as KkiapayTransaction;
    } catch (error) {
      this.logger.error('Error verifying transaction:', error.response?.data || error.message);
      throw new Error(`Échec vérification transaction: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Valider un webhook KkiaPay
   * KkiaPay utilise une signature HMAC pour sécuriser les webhooks
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error.message);
      return false;
    }
  }

  /**
   * Générer les données pour intégrer le widget KkiaPay
   */
  generateWidgetConfig(params: {
    amount: number;
    phone?: string;
    name?: string;
    reason?: string;
    sandbox?: boolean;
  }): {
    key: string;
    amount: number;
    position: string;
    sandbox: string;
    data: string;
  } {
    return {
      key: this.publicKey,
      amount: params.amount,
      position: 'center',
      sandbox: params.sandbox !== false ? 'true' : 'false',
      data: JSON.stringify({
        phone: params.phone,
        name: params.name,
        reason: params.reason || 'Paiement BMS',
      }),
    };
  }

  /**
   * Générer QR Code data pour KkiaPay
   */
  generateQRCodeData(params: {
    amount: number;
    phone?: string;
    reason?: string;
    reference: string;
  }): string {
    const qrData = {
      provider: 'kkiapay',
      public_key: this.publicKey,
      amount: params.amount,
      currency: 'XOF',
      phone: params.phone,
      reason: params.reason,
      reference: params.reference,
      timestamp: new Date().toISOString(),
      // URL pour paiement direct
      payment_url: `https://widget.kkiapay.me/?amount=${params.amount}&api_key=${this.publicKey}&reason=${encodeURIComponent(params.reason || 'Paiement')}${params.phone ? `&phone=${params.phone}` : ''}`,
    };

    return JSON.stringify(qrData);
  }

  /**
   * Mapper les statuts KkiaPay vers nos statuts
   */
  mapKkiapayStatus(kkiapayState: string): string {
    const statusMap = {
      PENDING: 'pending',
      SUCCESS: 'success',
      FAILED: 'failed',
      CANCELLED: 'canceled',
    };
    return statusMap[kkiapayState] || 'pending';
  }

  /**
   * Générer un lien de paiement direct
   */
  generatePaymentLink(params: {
    amount: number;
    phone?: string;
    name?: string;
    reason?: string;
  }): string {
    const baseUrl = 'https://widget.kkiapay.me';
    const queryParams = new URLSearchParams({
      amount: params.amount.toString(),
      api_key: this.publicKey,
      reason: params.reason || 'Paiement BMS',
    });

    if (params.phone) {
      queryParams.append('phone', params.phone);
    }

    if (params.name) {
      queryParams.append('name', params.name);
    }

    return `${baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Script pour intégrer le widget KkiaPay dans le frontend
   */
  getWidgetScript(): string {
    return `
<!-- KkiaPay Widget -->
<script src="https://cdn.kkiapay.me/k.js"></script>
<script>
  // Ouvrir le widget KkiaPay
  function openKkiapayWidget(config) {
    openKkiapayWidget({
      amount: config.amount,
      position: "center",
      callback: config.callback || "",
      data: config.data || "",
      theme: config.theme || "#0095ff",
      sandbox: config.sandbox || "true",
      key: "${this.publicKey}"
    });
    
    // Événement succès
    addSuccessListener(function(response) {
      console.log('Payment successful:', response);
      // Appeler votre API pour vérifier le paiement
      fetch('/api/v1/mobile-money/verify/' + response.transactionId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + yourJwtToken
        }
      });
    });
    
    // Événement échec
    addFailedListener(function(error) {
      console.error('Payment failed:', error);
    });
    
    // Événement fermeture
    addPendingListener(function(response) {
      console.log('Payment pending:', response);
    });
  }
</script>
    `.trim();
  }

  /**
   * Vérifier la connexion à l'API Kkiapay
   */
  async verifyConnection(): Promise<boolean> {
    try {
      this.logger.log('Vérification de la connexion à l\'API Kkiapay...');
      
      // Utiliser une requête simple pour vérifier la connexion
      const response = await this.client.get('/api/v1/transactions', {
        params: {
          limit: 1, // Limiter à 1 transaction pour test
        },
        timeout: 5000, // Timeout de 5 secondes
      });

      this.logger.log('Connexion Kkiapay établie avec succès');
      return true;
    } catch (error: any) {
      this.logger.error('Erreur de connexion à Kkiapay:', error.message);
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`);
        this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  }
}
