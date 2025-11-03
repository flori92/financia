// Service Mobile Money - KkiaPay (MTN, Moov, Wave, Orange Money)
// Support Afrique de l'Ouest: Bénin, Togo, Côte d'Ivoire, Sénégal, Burkina Faso

const axios = require('axios');
const crypto = require('crypto');

class MobileMoneyService {
  constructor() {
    this.publicKey = process.env.MOBILE_MONEY_PUBLIC_KEY;
    this.privateKey = process.env.MOBILE_MONEY_PRIVATE_KEY;
    this.secretKey = process.env.MOBILE_MONEY_SECRET_KEY;
    this.sandbox = process.env.MOBILE_MONEY_SANDBOX === 'true';
    
    if (!this.publicKey || !this.privateKey || !this.secretKey) {
      console.warn('⚠️ KkiaPay non configuré. Configurez les clés dans .env');
      this.enabled = false;
    } else {
      this.baseUrl = this.sandbox 
        ? 'https://api-sandbox.kkiapay.me' 
        : 'https://api.kkiapay.me';
      this.widgetUrl = this.sandbox
        ? 'https://sandbox-widget.kkiapay.me'
        : 'https://widget.kkiapay.me';
      this.enabled = true;
      console.log(`✅ KkiaPay configuré (${this.sandbox ? 'Sandbox' : 'Production'})`);
    }
  }

  /**
   * Initier un paiement mobile money
   * @param {Object} params - Paramètres du paiement
   * @param {number} params.amount - Montant en FCFA
   * @param {string} params.firstName - Prénom du client
   * @param {string} params.lastName - Nom du client
   * @param {string} params.email - Email du client (optionnel)
   * @param {string} params.phone - Numéro de téléphone
   * @param {string} params.reason - Description du paiement
   * @param {string} params.invoiceId - ID de la facture (optionnel)
   * @returns {Promise<Object>} Résultat avec URL de paiement ou transaction ID
   */
  async initiatePayment({ amount, firstName, lastName, email, phone, reason, invoiceId }) {
    if (!this.enabled) {
      throw new Error('KkiaPay non configuré');
    }

    try {
      // KkiaPay Widget URL (méthode la plus simple)
      const paymentUrl = `${this.widgetUrl}/?` + 
        `amount=${amount}` +
        `&api_key=${this.publicKey}` +
        `&name=${encodeURIComponent(firstName + ' ' + lastName)}` +
        (email ? `&email=${encodeURIComponent(email)}` : '') +
        (phone ? `&phone=${encodeURIComponent(phone)}` : '') +
        (reason ? `&reason=${encodeURIComponent(reason)}` : '') +
        (invoiceId ? `&metadata=${encodeURIComponent(JSON.stringify({ invoiceId }))}` : '');

      console.log(`💰 Paiement KkiaPay initié: ${amount} FCFA pour ${firstName} ${lastName}`);
      
      return {
        success: true,
        paymentUrl,
        amount,
        provider: 'kkiapay',
        sandbox: this.sandbox,
        message: 'Redirigez le client vers paymentUrl pour effectuer le paiement'
      };
    } catch (error) {
      console.error('❌ Erreur initiation paiement KkiaPay:', error.message);
      throw new Error(`Échec initiation paiement: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'une transaction
   * @param {string} transactionId - ID de la transaction KkiaPay
   * @returns {Promise<Object>} Statut de la transaction
   */
  async verifyTransaction(transactionId) {
    if (!this.enabled) {
      throw new Error('KkiaPay non configuré');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/transactions/status`, {
        params: { transactionId },
        headers: {
          'X-API-KEY': this.privateKey,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;
      
      console.log(`✅ Transaction vérifiée: ${transactionId} - Status: ${result.status}`);
      
      return {
        success: true,
        transactionId,
        status: result.status, // SUCCESS, FAILED, PENDING
        amount: result.amount,
        currency: 'XOF',
        phone: result.phone,
        provider: result.type, // mtn, moov, wave, orange
        createdAt: result.createdAt,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('❌ Erreur vérification transaction:', error.message);
      throw new Error(`Échec vérification transaction: ${error.message}`);
    }
  }

  /**
   * Initier un remboursement
   * @param {string} transactionId - ID de la transaction à rembourser
   * @returns {Promise<Object>} Résultat du remboursement
   */
  async refundTransaction(transactionId) {
    if (!this.enabled) {
      throw new Error('KkiaPay non configuré');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/transactions/refund`,
        { transactionId },
        {
          headers: {
            'X-API-KEY': this.privateKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      
      console.log(`✅ Remboursement effectué: ${transactionId}`);
      
      return {
        success: true,
        transactionId,
        refundStatus: result.status,
        message: 'Remboursement initié avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur remboursement:', error.message);
      throw new Error(`Échec remboursement: ${error.message}`);
    }
  }

  /**
   * Valider la signature webhook KkiaPay
   * @param {Object} payload - Corps de la requête webhook
   * @param {string} signature - Signature X-KKiaPay-Signature du header
   * @returns {boolean} True si signature valide
   */
  validateWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Traiter une notification webhook
   * @param {Object} payload - Corps de la notification
   * @param {string} signature - Signature pour validation
   * @returns {Promise<Object>} Transaction validée
   */
  async handleWebhook(payload, signature) {
    if (!this.enabled) {
      throw new Error('KkiaPay non configuré');
    }

    // Valider la signature
    if (!this.validateWebhookSignature(payload, signature)) {
      throw new Error('Signature webhook invalide');
    }

    const { transactionId, status, amount, phone, type, metadata } = payload;

    console.log(`📥 Webhook KkiaPay reçu: ${transactionId} - ${status}`);

    // Vérifier la transaction auprès de KkiaPay
    const verification = await this.verifyTransaction(transactionId);

    return {
      success: true,
      transactionId,
      status,
      amount,
      phone,
      provider: type, // mtn, moov, wave, orange
      metadata,
      verified: verification.success
    };
  }

  /**
   * Obtenir le statut du service
   * @returns {Object} Configuration et état du service
   */
  getStatus() {
    return {
      provider: 'kkiapay',
      enabled: this.enabled,
      sandbox: this.sandbox,
      configured: !!this.publicKey && !!this.privateKey && !!this.secretKey,
      supportedProviders: ['mtn', 'moov', 'wave', 'orange'],
      countries: ['BJ', 'TG', 'CI', 'SN', 'BF'] // Bénin, Togo, Côte d'Ivoire, Sénégal, Burkina
    };
  }
}

module.exports = new MobileMoneyService();
