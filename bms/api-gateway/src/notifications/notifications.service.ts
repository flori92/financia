import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NotificationPayload {
  to: string; // email, phone, whatsapp number
  subject?: string;
  message: string;
  data?: any;
  template?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Envoyer une notification par email
   */
  async sendEmail(payload: NotificationPayload): Promise<boolean> {
    const provider = this.configService.get<string>('EMAIL_PROVIDER', 'console');

    this.logger.log(`Sending email to ${payload.to}: ${payload.subject}`);

    if (provider === 'console') {
      // Mode développement: afficher dans la console
      console.log('\n📧 ===== EMAIL =====');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Message: ${payload.message}`);
      console.log('===================\n');
      return true;
    }

    // TODO: Implémenter avec SendGrid, Nodemailer, etc.
    // if (provider === 'sendgrid') {
    //   return this.sendWithSendGrid(payload);
    // }

    return true;
  }

  /**
   * Envoyer une notification par SMS
   */
  async sendSMS(payload: NotificationPayload): Promise<boolean> {
    const provider = this.configService.get<string>('SMS_PROVIDER', 'console');

    this.logger.log(`Sending SMS to ${payload.to}`);

    if (provider === 'console') {
      // Mode développement: afficher dans la console
      console.log('\n📱 ===== SMS =====');
      console.log(`To: ${payload.to}`);
      console.log(`Message: ${payload.message}`);
      console.log('================\n');
      return true;
    }

    // TODO: Implémenter avec Twilio, etc.
    // if (provider === 'twilio') {
    //   return this.sendWithTwilio(payload);
    // }

    return true;
  }

  /**
   * Envoyer une notification par WhatsApp
   */
  async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    const provider = this.configService.get<string>('WHATSAPP_PROVIDER', 'console');

    this.logger.log(`Sending WhatsApp to ${payload.to}`);

    if (provider === 'console') {
      // Mode développement: afficher dans la console
      console.log('\n💬 ===== WHATSAPP =====');
      console.log(`To: ${payload.to}`);
      console.log(`Message: ${payload.message}`);
      console.log('=======================\n');
      return true;
    }

    // TODO: Implémenter avec Twilio WhatsApp ou Meta WhatsApp Business API
    // if (provider === 'twilio') {
    //   return this.sendWhatsAppWithTwilio(payload);
    // }

    return true;
  }

  /**
   * Notification de paiement réussi
   */
  async notifyPaymentSuccess(params: {
    customerEmail: string;
    customerPhone: string;
    amount: number;
    invoiceNumber: string;
    transactionId: string;
  }): Promise<void> {
    const message = `
✅ Paiement reçu!

Montant: ${params.amount.toLocaleString()} FCFA
Facture: ${params.invoiceNumber}
Transaction: ${params.transactionId}

Merci pour votre paiement!
    `.trim();

    // Email
    if (params.customerEmail) {
      await this.sendEmail({
        to: params.customerEmail,
        subject: `Paiement reçu - Facture ${params.invoiceNumber}`,
        message,
      });
    }

    // SMS
    if (params.customerPhone) {
      await this.sendSMS({
        to: params.customerPhone,
        message: `✅ Paiement de ${params.amount} FCFA reçu pour facture ${params.invoiceNumber}. Merci!`,
      });
    }
  }

  /**
   * Notification de paiement échoué
   */
  async notifyPaymentFailure(params: {
    customerEmail: string;
    customerPhone: string;
    amount: number;
    invoiceNumber: string;
    reason?: string;
  }): Promise<void> {
    const message = `
❌ Échec de paiement

Montant: ${params.amount.toLocaleString()} FCFA
Facture: ${params.invoiceNumber}
Raison: ${params.reason || 'Non spécifiée'}

Veuillez réessayer ou nous contacter.
    `.trim();

    // Email
    if (params.customerEmail) {
      await this.sendEmail({
        to: params.customerEmail,
        subject: `Échec paiement - Facture ${params.invoiceNumber}`,
        message,
      });
    }

    // SMS
    if (params.customerPhone) {
      await this.sendSMS({
        to: params.customerPhone,
        message: `❌ Échec paiement ${params.amount} FCFA pour facture ${params.invoiceNumber}. Veuillez réessayer.`,
      });
    }
  }

  /**
   * Notification d'envoi de facture
   */
  async notifyInvoiceSent(params: {
    customerEmail?: string;
    customerPhone?: string;
    customerWhatsApp?: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    invoiceUrl: string;
    method: 'email' | 'sms' | 'whatsapp';
  }): Promise<void> {
    const message = `
📄 Nouvelle facture

Facture: ${params.invoiceNumber}
Montant: ${params.amount.toLocaleString()} FCFA
Échéance: ${params.dueDate.toLocaleDateString('fr-FR')}

Voir la facture: ${params.invoiceUrl}
    `.trim();

    switch (params.method) {
      case 'email':
        if (params.customerEmail) {
          await this.sendEmail({
            to: params.customerEmail,
            subject: `Facture ${params.invoiceNumber}`,
            message,
          });
        }
        break;

      case 'sms':
        if (params.customerPhone) {
          await this.sendSMS({
            to: params.customerPhone,
            message: `📄 Facture ${params.invoiceNumber}: ${params.amount} FCFA. ${params.invoiceUrl}`,
          });
        }
        break;

      case 'whatsapp':
        if (params.customerWhatsApp) {
          await this.sendWhatsApp({
            to: params.customerWhatsApp,
            message,
          });
        }
        break;
    }
  }

  /**
   * Notification entrepreneur: Nouveau paiement reçu
   */
  async notifyEntrepreneurPaymentReceived(params: {
    entrepreneurEmail: string;
    entrepreneurPhone: string;
    customerName: string;
    amount: number;
    invoiceNumber: string;
    paymentMethod: string;
  }): Promise<void> {
    const message = `
💰 Nouveau paiement reçu!

Client: ${params.customerName}
Montant: ${params.amount.toLocaleString()} FCFA
Facture: ${params.invoiceNumber}
Méthode: ${params.paymentMethod}

Consultez votre tableau de bord pour plus de détails.
    `.trim();

    // Email entrepreneur
    await this.sendEmail({
      to: params.entrepreneurEmail,
      subject: `💰 Paiement reçu - ${params.amount.toLocaleString()} FCFA`,
      message,
    });

    // SMS entrepreneur
    await this.sendSMS({
      to: params.entrepreneurPhone,
      message: `💰 ${params.customerName} a payé ${params.amount} FCFA (${params.invoiceNumber})`,
    });
  }

  /**
   * Rappel facture impayée
   */
  async sendInvoiceReminder(params: {
    customerEmail: string;
    customerPhone: string;
    invoiceNumber: string;
    amount: number;
    daysOverdue: number;
    invoiceUrl: string;
  }): Promise<void> {
    const urgency = params.daysOverdue > 30 ? '🚨 URGENT' : '⏰ Rappel';
    
    const message = `
${urgency}

Facture impayée: ${params.invoiceNumber}
Montant: ${params.amount.toLocaleString()} FCFA
En retard de: ${params.daysOverdue} jour(s)

Veuillez régulariser votre paiement dans les plus brefs délais.

Voir la facture: ${params.invoiceUrl}
    `.trim();

    // Email
    await this.sendEmail({
      to: params.customerEmail,
      subject: `${urgency} - Facture ${params.invoiceNumber} impayée`,
      message,
    });

    // SMS
    await this.sendSMS({
      to: params.customerPhone,
      message: `${urgency}: Facture ${params.invoiceNumber} de ${params.amount} FCFA en retard de ${params.daysOverdue} jours. ${params.invoiceUrl}`,
    });
  }

  /**
   * Notification NIF approuvé
   */
  async notifyNIFApproved(params: {
    userEmail: string;
    userPhone: string;
    companyName: string;
    nifNumber: string;
  }): Promise<void> {
    const message = `
✅ NIF Approuvé!

Entreprise: ${params.companyName}
Numéro NIF: ${params.nifNumber}

Votre demande de NIF a été approuvée par la DGI.
Vous pouvez maintenant utiliser ce numéro sur vos factures.
    `.trim();

    await this.sendEmail({
      to: params.userEmail,
      subject: '✅ Votre NIF a été approuvé',
      message,
    });

    await this.sendSMS({
      to: params.userPhone,
      message: `✅ NIF approuvé! ${params.companyName}: ${params.nifNumber}`,
    });
  }

  /**
   * Notification NIF rejeté
   */
  async notifyNIFRejected(params: {
    userEmail: string;
    userPhone: string;
    companyName: string;
    reason: string;
  }): Promise<void> {
    const message = `
❌ Demande NIF rejetée

Entreprise: ${params.companyName}
Raison: ${params.reason}

Veuillez corriger les informations et soumettre une nouvelle demande.
    `.trim();

    await this.sendEmail({
      to: params.userEmail,
      subject: '❌ Demande NIF rejetée',
      message,
    });

    await this.sendSMS({
      to: params.userPhone,
      message: `❌ Demande NIF rejetée pour ${params.companyName}. Raison: ${params.reason}`,
    });
  }
}
