// Service SMS - Support multi-providers
// Africa's Talking (recommandé Afrique), Twilio, Console

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'console';
    this.initProvider();
  }

  initProvider() {
    switch (this.provider) {
      case 'africastalking':
        try {
          const africastalking = require('africastalking');
          this.client = africastalking({
            apiKey: process.env.AFRICASTALKING_API_KEY,
            username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
          }).SMS;
          console.log('✅ Africa\'s Talking SMS configuré');
        } catch (e) {
          console.warn('⚠️ Africa\'s Talking non installé. Installez: npm install africastalking');
          this.provider = 'console';
        }
        break;
      
      case 'twilio':
        try {
          const twilio = require('twilio');
          this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          console.log('✅ Twilio SMS configuré');
        } catch (e) {
          console.warn('⚠️ Twilio non installé');
          this.provider = 'console';
        }
        break;
      
      default:
        console.log('📱 Mode console activé pour les SMS');
    }
  }

  async send({ to, message, from }) {
    try {
      switch (this.provider) {
        case 'africastalking':
          const atResult = await this.client.send({
            to: Array.isArray(to) ? to : [to],
            message,
            from: from || process.env.AFRICASTALKING_SENDER_ID || 'BMS',
          });
          
          console.log(`✅ SMS envoyé via Africa's Talking à ${to}`);
          return { 
            success: true, 
            provider: 'africastalking', 
            recipients: atResult.SMSMessageData.Recipients,
            cost: atResult.SMSMessageData.Recipients[0]?.cost,
          };

        case 'twilio':
          const twilioResult = await this.client.messages.create({
            body: message,
            to: to,
            from: from || process.env.TWILIO_PHONE_NUMBER,
          });
          
          console.log(`✅ SMS envoyé via Twilio à ${to}`);
          return { 
            success: true, 
            provider: 'twilio',
            sid: twilioResult.sid,
            status: twilioResult.status,
          };

        default:
          console.log(`📱 [SMS CONSOLE] À: ${to} | Message: ${message}`);
          return { success: true, provider: 'console', mock: true };
      }
    } catch (error) {
      console.error('❌ Erreur envoi SMS:', error.message);
      throw new Error(`Échec envoi SMS: ${error.message}`);
    }
  }

  async sendInvoiceNotification({ to, invoiceNumber, amount, customerName }) {
    const message = `Bonjour ${customerName}, votre facture ${invoiceNumber} de ${amount} FCFA est disponible. Merci - BMS`;
    return this.send({ to, message });
  }

  async sendPaymentConfirmation({ to, invoiceNumber, amount, customerName }) {
    const message = `Bonjour ${customerName}, nous confirmons réception de votre paiement de ${amount} FCFA pour la facture ${invoiceNumber}. Merci - BMS`;
    return this.send({ to, message });
  }

  async sendPaymentReminder({ to, invoiceNumber, amount, daysOverdue, customerName }) {
    const message = `Bonjour ${customerName}, rappel: facture ${invoiceNumber} (${amount} FCFA) en attente depuis ${daysOverdue} jours. Merci de régler - BMS`;
    return this.send({ to, message });
  }

  async sendOTP({ to, code, expiresInMinutes = 5 }) {
    const message = `Votre code de vérification BMS: ${code}. Valable ${expiresInMinutes} minutes. Ne le partagez jamais.`;
    return this.send({ to, message });
  }
}

module.exports = new SMSService();
