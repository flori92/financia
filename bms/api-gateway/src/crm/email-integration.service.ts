import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType, ActivityStatus } from './entities/activity.entity';
import { Contact } from './entities/contact.entity';
import * as nodemailer from 'nodemailer';

/**
 * Service d'intégration email pour le CRM
 * Permet d'envoyer des emails et de logger les communications
 */
@Injectable()
export class EmailIntegrationService {
  private readonly logger = new Logger(EmailIntegrationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
  ) {
    // Configuration SMTP
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Envoyer un email à un contact et logger l'activité
   */
  async sendEmail(
    contactId: string,
    companyId: string,
    subject: string,
    body: string,
    userId?: string,
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    try {
      const contact = await this.contactRepo.findOne({
        where: { id: contactId, companyId },
      });

      if (!contact || !contact.email) {
        return { success: false, error: 'Contact ou email introuvable' };
      }

      // Envoyer l'email
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@bms.com',
        to: contact.email,
        subject,
        html: body,
      });

      // Logger l'activité
      const activity = this.activityRepo.create({
        type: ActivityType.EMAIL,
        title: `Email: ${subject}`,
        description: body,
        status: ActivityStatus.COMPLETED,
        contactId,
        companyId,
        createdBy: userId,
        createdAt: new Date(),
      });

      const savedActivity = await this.activityRepo.save(activity);

      this.logger.log(`Email envoyé à ${contact.email} - Activité ${savedActivity.id}`);

      return { success: true, activityId: savedActivity.id };
    } catch (error) {
      this.logger.error(`Erreur envoi email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer un email de suivi automatique
   */
  async sendFollowUpEmail(
    contactId: string,
    companyId: string,
    templateType: 'welcome' | 'followup' | 'reminder',
  ): Promise<{ success: boolean; error?: string }> {
    const templates = {
      welcome: {
        subject: 'Bienvenue chez BMS',
        body: `
          <h2>Bienvenue !</h2>
          <p>Nous sommes ravis de vous compter parmi nos contacts.</p>
          <p>Notre équipe est à votre disposition pour vous accompagner dans votre formalisation.</p>
        `,
      },
      followup: {
        subject: 'Suivi de votre dossier',
        body: `
          <h2>Suivi de votre dossier</h2>
          <p>Nous revenons vers vous concernant votre dossier de formalisation.</p>
          <p>N'hésitez pas à nous contacter pour toute question.</p>
        `,
      },
      reminder: {
        subject: 'Rappel - Documents manquants',
        body: `
          <h2>Rappel</h2>
          <p>Il manque encore quelques documents pour finaliser votre dossier.</p>
          <p>Merci de nous les transmettre dès que possible.</p>
        `,
      },
    };

    const template = templates[templateType];
    const result = await this.sendEmail(
      contactId,
      companyId,
      template.subject,
      template.body,
    );

    return result;
  }

  /**
   * Obtenir l'historique des emails d'un contact
   */
  async getEmailHistory(contactId: string, companyId: string): Promise<Activity[]> {
    return this.activityRepo.find({
      where: {
        contactId,
        companyId,
        type: ActivityType.EMAIL,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
