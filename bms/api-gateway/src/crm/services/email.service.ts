import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';

/**
 * Service d'envoi d'emails CRM via NotificationsService
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Envoyer un email simple
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
  }): Promise<boolean> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      let allSucceeded = true;

      for (const recipient of recipients) {
        const success = await this.notificationsService.sendEmail({
          to: recipient,
          subject: options.subject,
          message: options.html || options.text || '',
          data: {
            from: options.from,
          },
        });

        if (!success) {
          allSucceeded = false;
          this.logger.error(`Échec envoi email à ${recipient}`);
        }
      }

      return allSucceeded;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi d'email:`, error);
      return false;
    }
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Bienvenue sur BMS !</h2>
        <p>Bonjour ${userName},</p>
        <p>Nous sommes ravis de vous accueillir sur BMS (Business Management System).</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
        <ul>
          <li>Gérer votre comptabilité</li>
          <li>Suivre votre trésorerie</li>
          <li>Générer vos déclarations fiscales</li>
          <li>Et bien plus encore...</li>
        </ul>
        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background-color: #0D9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Se connecter
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          BMS - Votre partenaire de gestion d'entreprise
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Bienvenue sur BMS',
      html,
      text: `Bonjour ${userName}, bienvenue sur BMS !`,
    });
  }

  /**
   * Envoyer une notification de facture
   */
  async sendInvoiceNotification(
    to: string,
    invoiceNumber: string,
    amount: number,
    dueDate: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Nouvelle facture</h2>
        <p>Une nouvelle facture a été générée :</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Numéro</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Montant</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${amount.toLocaleString('fr-FR')} FCFA</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Échéance</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${dueDate}</td>
          </tr>
        </table>
        <p>Merci de votre confiance.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Facture ${invoiceNumber}`,
      html,
    });
  }

  /**
   * Envoyer une alerte de trésorerie
   */
  async sendTreasuryAlert(
    to: string,
    alertType: 'critical' | 'warning',
    runwayDays: number,
    balance: number,
  ): Promise<boolean> {
    const color = alertType === 'critical' ? '#EF4444' : '#F59E0B';
    const title = alertType === 'critical' ? 'ALERTE CRITIQUE' : 'Avertissement';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">${title} - Trésorerie</h2>
        <div style="background-color: ${color === '#EF4444' ? '#FEE2E2' : '#FEF3C7'}; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: ${color}; font-weight: bold;">
            Votre trésorerie nécessite une attention immédiate !
          </p>
        </div>
        <p>Détails de votre trésorerie :</p>
        <ul>
          <li><strong>Solde actuel :</strong> ${balance.toLocaleString('fr-FR')} FCFA</li>
          <li><strong>Jours de trésorerie restants :</strong> ${runwayDays} jours</li>
        </ul>
        <p>Actions recommandées :</p>
        <ul>
          <li>Relancer les clients avec des factures impayées</li>
          <li>Reporter certaines dépenses non urgentes</li>
          <li>Consulter un expert-comptable</li>
        </ul>
        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/treasury" 
             style="background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Voir la trésorerie
          </a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `${title} - Trésorerie à ${runwayDays} jours`,
      html,
    });
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D9488;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0D9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">
          Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Réinitialisation de mot de passe - BMS',
      html,
    });
  }
}
