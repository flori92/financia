import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    private notificationsService: NotificationsService,
  ) {}

  async sendReminders() {
    const now = new Date();
    const unpaidInvoices = await this.invoiceRepo.find({
      where: { paymentStatus: 'unpaid', dueDate: LessThan(now) },
    });

    const reminders = [];
    for (const invoice of unpaidInvoices) {
      const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      
      let level: 'gentle' | 'firm' | 'formal' | 'legal' = 'gentle';
      if (daysOverdue > 45) level = 'legal';
      else if (daysOverdue > 30) level = 'formal';
      else if (daysOverdue > 15) level = 'firm';

      const penalty = this.calculatePenalty(invoice.totalAmount, daysOverdue);
      
      // Récupérer les informations du client
      const customerInfo = {
        email: invoice.partyEmail || 'client@example.com',
        phone: invoice.partyPhone || '+22900000000',
        whatsapp: invoice.partyWhatsApp || invoice.partyPhone || '+22900000000',
        name: invoice.partyName || 'Client',
      };

      // Envoyer le rappel avec le bon niveau d'urgence
      await this.sendReminderWithLevel({
        customerInfo,
        invoice,
        daysOverdue,
        level,
        penalty,
      });

      reminders.push({ 
        invoice: invoice.invoiceNumber, 
        customerName: customerInfo.name,
        level, 
        daysOverdue, 
        penalty,
        amount: invoice.totalAmount,
      });
    }
    return reminders;
  }

  /**
   * Envoyer un rappel avec le niveau d'urgence approprié
   */
  private async sendReminderWithLevel(params: {
    customerInfo: any;
    invoice: Invoice;
    daysOverdue: number;
    level: 'gentle' | 'firm' | 'formal' | 'legal';
    penalty: number;
  }) {
    const { customerInfo, invoice, daysOverdue, level, penalty } = params;
    const invoiceUrl = `${process.env.FRONTEND_URL || 'https://app.bms.com'}/invoices/${invoice.id}`;

    let message = '';
    let subject = '';

    switch (level) {
      case 'gentle':
        subject = `⏰ Rappel amical - Facture ${invoice.invoiceNumber}`;
        message = `
Bonjour ${customerInfo.name},

Ceci est un rappel amical concernant votre facture :

📄 Facture : ${invoice.invoiceNumber}
💰 Montant : ${Number(invoice.totalAmount).toLocaleString()} FCFA
📅 Échéance : ${invoice.dueDate.toLocaleDateString('fr-FR')}
⏰ En retard de : ${daysOverdue} jour(s)

Vous pouvez consulter et payer votre facture ici : ${invoiceUrl}

Merci pour votre confiance !

Cordialement,
L'équipe BMS
        `.trim();
        break;

      case 'firm':
        subject = `🔔 Rappel - Facture ${invoice.invoiceNumber} en retard`;
        message = `
Bonjour ${customerInfo.name},

Votre facture est en retard de paiement :

📄 Facture : ${invoice.invoiceNumber}
💰 Montant : ${Number(invoice.totalAmount).toLocaleString()} FCFA
📅 Échéance : ${invoice.dueDate.toLocaleDateString('fr-FR')}
⏰ En retard de : ${daysOverdue} jour(s)

Merci de régulariser votre situation rapidement.

Consultez votre facture : ${invoiceUrl}

Cordialement,
Service comptabilité BMS
        `.trim();
        break;

      case 'formal':
        subject = `🚨 DEMANDE DE PAIEMENT - Facture ${invoice.invoiceNumber}`;
        message = `
Madame, Monsieur ${customerInfo.name},

Nous vous informons que votre facture présente un retard important :

📄 Facture : ${invoice.invoiceNumber}
💰 Montant dû : ${Number(invoice.totalAmount).toLocaleString()} FCFA
📅 Date d'échéance : ${invoice.dueDate.toLocaleDateString('fr-FR')}
⏰ Retard : ${daysOverdue} jour(s)
💸 Pénalités de retard : ${penalty.toLocaleString()} FCFA

Nous vous demandons de procéder au règlement dans les plus brefs délais pour éviter toute procédure de recouvrement supplémentaire.

Facture détaillée : ${invoice.url}

Service recouvrement BMS
        `.trim();
        break;

      case 'legal':
        subject = `⚖️ MISE EN DEMEURE - Facture ${invoice.invoiceNumber}`;
        message = `
Madame, Monsieur ${customerInfo.name},

MALGRÉ NOS RELANCES

Nous vous mettons en demeure de régler votre dette :

📄 Facture : ${invoice.invoiceNumber}
💰 Montant principal : ${Number(invoice.totalAmount).toLocaleString()} FCFA
💸 Pénalités de retard : ${penalty.toLocaleString()} FCFA
💰 TOTAL DÛ : ${(Number(invoice.totalAmount) + penalty).toLocaleString()} FCFA
📅 Échéance : ${invoice.dueDate.toLocaleDateString('fr-FR')}
⏰ Retard : ${daysOverdue} jour(s)

À défaut de paiement sous 8 jours, nous saisirons les tribunaux compétents.

Facture : ${invoiceUrl}

Service contentieux BMS
        `.trim();
        break;
    }

    // Envoyer par email
    if (customerInfo.email) {
      await this.notificationsService.sendEmail({
        to: customerInfo.email,
        subject,
        message,
      }, invoice.companyId);
    }

    // Envoyer par WhatsApp pour les niveaux firm et supérieurs
    if (level !== 'gentle' && customerInfo.whatsapp) {
      const shortMessage = `${subject}\n\n${message.split('\n').slice(0, 8).join('\n')}\n\n📱 ${invoiceUrl}`;
      await this.notificationsService.sendWhatsApp({
        to: customerInfo.whatsapp,
        message: shortMessage,
      }, invoice.companyId);
    }

    // Envoyer SMS pour les niveaux formal et legal
    if (['formal', 'legal'].includes(level) && customerInfo.phone) {
      const smsMessage = `${subject} - Montant : ${Number(invoice.totalAmount).toLocaleString()} FCFA - Retard : ${daysOverdue}j - ${invoiceUrl}`;
      await this.notificationsService.sendSMS({
        to: customerInfo.phone,
        message: smsMessage,
      }, invoice.companyId);
    }
  }

  private calculatePenalty(amount: number, daysOverdue: number): number {
    const rate = 0.0004; // 0.04% par jour (taux légal Bénin)
    return Math.round(amount * rate * daysOverdue + 40); // +40 XOF indemnité forfaitaire
  }
}
