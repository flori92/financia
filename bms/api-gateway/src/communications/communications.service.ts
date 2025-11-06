import { Injectable, Logger } from '@nestjs/common';
import { EmailsService } from './services/emails.service';
import { SmsService } from './services/sms.service';
import { WhatsAppService } from './services/whatsapp.service';
import { TemplatesService } from './services/templates.service';
import { BulkCommunicationDto } from './dto/bulk-communication.dto';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private readonly emailsService: EmailsService,
    private readonly smsService: SmsService,
    private readonly whatsAppService: WhatsAppService,
    private readonly templatesService: TemplatesService,
  ) {}

  async sendBulkCommunication(
    companyId: string,
    userId: string,
    params: BulkCommunicationDto,
  ): Promise<{ sent: number; failed: number; errors: any[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const recipient of params.recipients) {
      try {
        let success = false;
        let message = params.message;

        switch (params.type) {
          case 'email': {
            const email = await this.emailsService.sendEmail(companyId, userId, {
              to: recipient,
              subject: params.subject,
              body: params.message,
            });
            success = ['sent', 'delivered'].includes(email.status);
            if (!success) {
              message = `Envoi email en échec (statut: ${email.status})`;
            }
            break;
          }
          case 'sms': {
            const sms = await this.smsService.sendSms(companyId, userId, {
              to: recipient,
              message: params.message,
            });
            success = ['sent', 'delivered'].includes(sms.status);
            if (!success) {
              message = sms.errorMessage || 'Envoi SMS en échec';
            }
            break;
          }
          case 'whatsapp': {
            const whatsapp = await this.whatsAppService.sendMessage(companyId, userId, {
              to: recipient,
              message: params.message,
            });
            success = ['sent', 'delivered'].includes(whatsapp.status);
            if (!success) {
              message = whatsapp.errorMessage || 'Envoi WhatsApp en échec';
            }
            break;
          }
          default:
            throw new Error(`Type de communication non supporté: ${params.type}`);
        }

        if (success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            recipient,
            error: message,
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          recipient,
          error: error?.message || 'Erreur inconnue lors de l\'envoi',
        });
      }
    }

    this.logger.log(`Bulk communication sent: ${results.sent} succeeded, ${results.failed} failed`);

    return results;
  }

  async getCommunicationStats(companyId: string): Promise<any> {
    // Get real statistics from database
    const [emailStats, smsStats, whatsappStats] = await Promise.all([
      this.getEmailStats(companyId),
      this.getSmsStats(companyId),
      this.getWhatsAppStats(companyId),
    ]);

    return {
      emails: emailStats,
      sms: smsStats,
      whatsapp: whatsappStats,
    };
  }

  private async getEmailStats(companyId: string): Promise<any> {
    const emails = await this.emailsService.findAll(companyId);
    
    return {
      total: emails.length,
      sent: emails.filter(e => e.status === 'sent' || e.status === 'delivered').length,
      delivered: emails.filter(e => e.status === 'delivered').length,
      opened: emails.filter(e => e.readAt !== null).length,
      failed: emails.filter(e => e.status === 'failed').length,
    };
  }

  private async getSmsStats(companyId: string): Promise<any> {
    const sms = await this.smsService.findAll(companyId);
    
    return {
      total: sms.length,
      sent: sms.filter(s => s.status === 'sent' || s.status === 'delivered').length,
      delivered: sms.filter(s => s.status === 'delivered').length,
      failed: sms.filter(s => s.status === 'failed').length,
    };
  }

  private async getWhatsAppStats(companyId: string): Promise<any> {
    const messages = await this.whatsAppService.findAll(companyId);
    
    // Flatten messages from conversations
    const allMessages = messages.flatMap(conv => conv.messages || []);
    
    return {
      total: allMessages.length,
      sent: allMessages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
      delivered: allMessages.filter(m => m.status === 'delivered').length,
      read: allMessages.filter(m => m.readAt !== null).length,
      failed: allMessages.filter(m => m.status === 'failed').length,
    };
  }
}
