import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import africastalking, { IMessageResponse } from 'africastalking';

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
  private readonly resend: Resend;
  private readonly africaTalkingClient: ReturnType<typeof africastalking> | null;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }

    const africaUser = this.configService.get<string>('AFRICASTALKING_USERNAME');
    const africaKey = this.configService.get<string>('AFRICASTALKING_API_KEY');
    if (africaUser && africaKey) {
      this.africaTalkingClient = africastalking({
        username: africaUser,
        apiKey: africaKey,
      });
    } else {
      this.africaTalkingClient = null;
    }
  }

  /**
   * Envoyer une notification par email
   */
  async sendEmail(payload: NotificationPayload): Promise<boolean> {
    this.logger.log(`Sending email to ${payload.to}: ${payload.subject}`);

    if (!this.resend) {
      console.log('\n📧 ===== EMAIL (DEV) =====');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Message: ${payload.message}`);
      console.log('===================\n');
      return true;
    }

    const fromAddress = payload.data?.from || this.configService.get<string>('RESEND_FROM_EMAIL');
    try {
      await this.resend.emails.send({
        from: fromAddress || 'no-reply@bms.erp',
        to: payload.to,
        subject: payload.subject ?? 'Notification',
        html: payload.message,
        cc: payload.data?.cc,
        bcc: payload.data?.bcc,
      });
      return true;
    } catch (error) {
      this.logger.error('Error sending email with Resend', error.stack || error);
      return false;
    }
  }

  /**
   * Envoyer une notification par SMS
   */
  async sendSMS(payload: NotificationPayload): Promise<boolean> {
    this.logger.log(`Sending SMS to ${payload.to}`);

    if (!this.africaTalkingClient) {
      console.log('\n📱 ===== SMS (DEV) =====');
      console.log(`To: ${payload.to}`);
      console.log(`Message: ${payload.message}`);
      console.log('================\n');
      return true;
    }

    const sms = this.africaTalkingClient.SMS;
    const senderId = payload.data?.from || this.configService.get<string>('AFRICASTALKING_SENDER_ID');

    try {
      const response: IMessageResponse = await sms.send({
        to: payload.to,
        message: payload.message,
        from: senderId,
      });

      if (response.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return true;
      }

      this.logger.error(`Africa's Talking SMS failed: ${JSON.stringify(response)}`);
      return false;
    } catch (error) {
      this.logger.error("Error sending SMS with Africa's Talking", error.stack || error);
      return false;
    }
  }

  /**
   * Envoyer une notification par WhatsApp
   */
  async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    this.logger.log(`Sending WhatsApp to ${payload.to}`);

    // WhatsApp provider integration non prévue pour l'instant.
    // Utiliser Africa's Talking (si support) ou log en mode dév.
    if (!this.africaTalkingClient) {
      console.log('\n💬 ===== WHATSAPP (DEV) =====');
      console.log(`To: ${payload.to}`);
      console.log(`Message: ${payload.message}`);
      console.log('=======================\n');
      return true;
    }

    try {
      const response = await this.africaTalkingClient.SMS.send({
        to: payload.to,
        message: payload.message,
        from: this.configService.get<string>('AFRICASTALKING_WHATSAPP_SENDER'),
      });

      if (response.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return true;
      }

      this.logger.error(`WhatsApp via Africa's Talking failed: ${JSON.stringify(response)}`);
      return false;
    } catch (error) {
      this.logger.error("Error sending WhatsApp with Africa's Talking", error.stack || error);
      return false;
    }
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

  /**
   * Notification alerte trésorerie critique
   */
  async notifyTreasuryAlert(params: {
    userEmail: string;
    userPhone: string;
    companyName: string;
    runway: number;
    currentBalance: number;
    level: 'critical' | 'warning';
  }): Promise<void> {
    const emoji = params.level === 'critical' ? '🔴' : '🟡';
    const urgency = params.level === 'critical' ? 'ALERTE CRITIQUE' : 'ATTENTION';
    
    const message = `
${emoji} ${urgency} - Trésorerie

Entreprise: ${params.companyName}
Solde actuel: ${params.currentBalance.toLocaleString()} FCFA
Jours de trésorerie: ${params.runway} jour(s)

${params.level === 'critical' 
  ? '⚠️ Votre trésorerie est critique ! Accélérez vos relances clients et surveillez vos dépenses.' 
  : '⚠️ Votre trésorerie nécessite une attention. Surveillez vos encaissements à venir.'}

Connectez-vous à votre tableau de bord pour plus de détails.
    `.trim();

    // Email
    await this.sendEmail({
      to: params.userEmail,
      subject: `${emoji} ${urgency} - Trésorerie ${params.companyName}`,
      message,
    });

    // SMS
    await this.sendSMS({
      to: params.userPhone,
      message: `${emoji} ${urgency}: Trésorerie ${params.companyName} - ${params.runway}j de runway, ${params.currentBalance.toLocaleString()} FCFA`,
    });
  }

  /**
   * Notifications liées aux connexions bancaires (initialisation, révocation, etc.)
   */
  async sendBankConnectionNotification(params: {
    userId: string;
    type: string;
    data: Record<string, any>;
    email?: string;
    phone?: string;
  }): Promise<void> {
    this.logger.log(
      `🔔 BankConnectionNotification [${params.type}] pour user=${params.userId} payload=${JSON.stringify(
        params.data,
      )}`,
    );

    const message = `Connexion bancaire: ${params.type}\nDétails: ${JSON.stringify(params.data)}`;

    if (params.email) {
      await this.sendEmail({
        to: params.email,
        subject: `Connexion bancaire - ${params.type}`,
        message,
      });
    }

    if (params.phone) {
      await this.sendSMS({
        to: params.phone,
        message,
      });
    }
  }

  /**
   * Notifications liées aux synchronisations bancaires
   */
  async sendBankSyncNotification(params: {
    userId: string;
    type: string;
    data: Record<string, any>;
    email?: string;
    phone?: string;
  }): Promise<void> {
    this.logger.log(
      `🔔 BankSyncNotification [${params.type}] pour user=${params.userId} payload=${JSON.stringify(
        params.data,
      )}`,
    );

    const message = `Synchronisation bancaire: ${params.type}\nDétails: ${JSON.stringify(params.data)}`;

    if (params.email) {
      await this.sendEmail({
        to: params.email,
        subject: `Synchronisation bancaire - ${params.type}`,
        message,
      });
    }

    if (params.phone) {
      await this.sendSMS({
        to: params.phone,
        message,
      });
    }
  }

  /**
   * Notifications liées aux anomalies détectées
   */
  async sendBankAnomalyNotification(params: {
    userId: string;
    type: string;
    data: Record<string, any>;
    email?: string;
    phone?: string;
  }): Promise<void> {
    this.logger.warn(
      `🚨 BankAnomalyNotification [${params.type}] pour user=${params.userId} payload=${JSON.stringify(
        params.data,
      )}`,
    );

    const message = `Anomalie bancaire détectée\nDétails: ${JSON.stringify(params.data)}`;

    if (params.email) {
      await this.sendEmail({
        to: params.email,
        subject: 'Alerte anomalie bancaire',
        message,
      });
    }

    if (params.phone) {
      await this.sendSMS({
        to: params.phone,
        message,
      });
    }
  }
}
