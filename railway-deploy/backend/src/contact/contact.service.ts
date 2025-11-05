import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactDemoDto } from './contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuration du transporteur email
    // Utilise les variables d'environnement pour la configuration SMTP
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: this.configService.get('SMTP_USER', 'florifavi@gmail.com'),
        pass: this.configService.get('SMTP_PASS', ''),
      },
    });
  }

  /**
   * Envoie une demande de démo par email
   */
  async sendDemoRequest(data: ContactDemoDto): Promise<void> {
    try {
      const { name, company, email, phone, message } = data;

      // Email destiné à l'administrateur
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D9488; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎯 Nouvelle Demande de Démo</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Informations du prospect</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; width: 150px;">👤 Nom complet</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${name}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">🏢 Entreprise</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${company}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">📧 Email</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">
                  <a href="mailto:${email}" style="color: #0D9488;">${email}</a>
                </td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">📱 Téléphone</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${phone}</td>
              </tr>
              ${message ? `
              <tr style="background-color: white;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; vertical-align: top;">💬 Message</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${message}</td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 30px; padding: 20px; background-color: #d1f4f0; border-left: 4px solid #0D9488;">
              <p style="margin: 0; color: #0D9488; font-weight: bold;">
                ⚡ Action requise : Contacter ce prospect dans les 24h
              </p>
            </div>
          </div>

          <div style="background-color: #333; padding: 20px; text-align: center; color: white; font-size: 12px;">
            <p style="margin: 0;">BMS ERP - Business Management System</p>
            <p style="margin: 5px 0 0 0;">Demande reçue le ${new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      `;

      // Email de confirmation pour le prospect
      const confirmationEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0D9488; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Demande de Démo Reçue</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Bonjour ${name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Merci pour votre intérêt pour <strong>BMS ERP</strong> ! 🎉
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Nous avons bien reçu votre demande de démonstration pour <strong>${company}</strong>.
              Notre équipe commerciale va analyser vos besoins et vous contactera très prochainement pour organiser une démonstration personnalisée.
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0D9488;">
              <h3 style="margin-top: 0; color: #0D9488;">📋 Récapitulatif de votre demande</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0;">✉️ Email : ${email}</li>
                <li style="padding: 8px 0;">📞 Téléphone : ${phone}</li>
                ${message ? `<li style="padding: 8px 0;">💭 Votre message : "${message}"</li>` : ''}
              </ul>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Vous serez contacté sous <strong>24 à 48 heures</strong>.
            </p>

            <div style="background-color: #d1f4f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0D9488;">🚀 En attendant</h3>
              <ul style="line-height: 1.8; color: #555;">
                <li>Consultez notre <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}" style="color: #0D9488;">site web</a> pour plus d'informations</li>
                <li>Préparez vos questions sur vos besoins spécifiques</li>
                <li>Identifiez les modules qui vous intéressent le plus</li>
              </ul>
            </div>
          </div>

          <div style="background-color: #333; padding: 20px; text-align: center; color: white; font-size: 12px;">
            <p style="margin: 0;">BMS ERP - Business Management System</p>
            <p style="margin: 5px 0;">Solution de gestion d'entreprise multi-profils</p>
            <p style="margin: 10px 0 0 0;">© 2025 BMS ERP. Tous droits réservés.</p>
          </div>
        </div>
      `;

      // Envoi de l'email à l'administrateur
      await this.transporter.sendMail({
        from: `"BMS ERP Démonstrations" <${this.configService.get('SMTP_USER', 'florifavi@gmail.com')}>`,
        to: 'florifavi@gmail.com',
        subject: `🎯 Nouvelle Demande de Démo - ${company}`,
        html: adminEmailHtml,
        replyTo: email,
      });

      // Envoi de l'email de confirmation au prospect
      await this.transporter.sendMail({
        from: `"BMS ERP" <${this.configService.get('SMTP_USER', 'florifavi@gmail.com')}>`,
        to: email,
        subject: '✅ Votre demande de démo BMS ERP',
        html: confirmationEmailHtml,
      });

      this.logger.log(`Demande de démo envoyée avec succès pour ${company} (${email})`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de démo:`, error);
      throw error;
    }
  }
}
