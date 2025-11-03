// Service Email - Support multi-providers
// Resend (recommandé), SendGrid, SMTP, Console

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console';
    this.initProvider();
  }

  initProvider() {
    switch (this.provider) {
      case 'resend':
        try {
          this.resend = require('resend');
          this.client = new this.resend.Resend(process.env.RESEND_API_KEY);
          console.log('✅ Resend email configuré');
        } catch (e) {
          console.warn('⚠️ Resend non installé. Installez: npm install resend');
          this.provider = 'console';
        }
        break;
      
      case 'sendgrid':
        try {
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          this.client = sgMail;
          console.log('✅ SendGrid configuré');
        } catch (e) {
          console.warn('⚠️ SendGrid non installé');
          this.provider = 'console';
        }
        break;
      
      case 'smtp':
        try {
          const nodemailer = require('nodemailer');
          this.client = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          console.log('✅ SMTP configuré');
        } catch (e) {
          console.warn('⚠️ Nodemailer non installé');
          this.provider = 'console';
        }
        break;
      
      default:
        console.log('📧 Mode console activé pour les emails');
    }
  }

  async send({ to, subject, html, text, from }) {
    const fromAddress = from || process.env.RESEND_FROM || process.env.SENDGRID_FROM || process.env.SMTP_FROM;

    try {
      switch (this.provider) {
        case 'resend':
          const resendResult = await this.client.emails.send({
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
            html: html || text,
          });
          console.log(`✅ Email envoyé via Resend à ${to}`);
          return { success: true, id: resendResult.id, provider: 'resend' };

        case 'sendgrid':
          await this.client.send({
            to,
            from: fromAddress,
            subject,
            html: html || text,
          });
          console.log(`✅ Email envoyé via SendGrid à ${to}`);
          return { success: true, provider: 'sendgrid' };

        case 'smtp':
          const smtpResult = await this.client.sendMail({
            from: fromAddress,
            to,
            subject,
            html,
            text,
          });
          console.log(`✅ Email envoyé via SMTP à ${to}`);
          return { success: true, messageId: smtpResult.messageId, provider: 'smtp' };

        default:
          console.log(`📧 [EMAIL CONSOLE] À: ${to} | Sujet: ${subject}`);
          console.log(`   Contenu: ${text || html?.substring(0, 100)}`);
          return { success: true, provider: 'console', mock: true };
      }
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      throw new Error(`Échec envoi email: ${error.message}`);
    }
  }

  async sendInvoice({ to, invoiceNumber, amount, pdfUrl, customerName }) {
    const subject = `Facture ${invoiceNumber} - ${amount} FCFA`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488;">Nouvelle facture de BMS</h2>
          <p>Bonjour ${customerName},</p>
          <p>Veuillez trouver ci-jointe votre facture <strong>${invoiceNumber}</strong> d'un montant de <strong>${amount} FCFA</strong>.</p>
          <p><a href="${pdfUrl}" style="background: #0D9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Télécharger la facture</a></p>
          <p>Merci pour votre confiance.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Cet email a été envoyé par BMS - Business Management System</p>
        </body>
      </html>
    `;

    return this.send({ to, subject, html });
  }

  async sendPaymentReminder({ to, invoiceNumber, amount, daysOverdue, customerName }) {
    const subject = `Rappel: Facture ${invoiceNumber} en attente`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Rappel de paiement</h2>
          <p>Bonjour ${customerName},</p>
          <p>Nous vous rappelons que la facture <strong>${invoiceNumber}</strong> d'un montant de <strong>${amount} FCFA</strong> 
          est en attente de règlement depuis <strong>${daysOverdue} jours</strong>.</p>
          <p>Merci de procéder au paiement dans les plus brefs délais.</p>
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br>L'équipe BMS</p>
        </body>
      </html>
    `;

    return this.send({ to, subject, html });
  }
}

module.exports = new EmailService();
