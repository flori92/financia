const moment = require('moment');
const database = require('../database');

class CommunicationService {
  // Templates
  async getTemplates() {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Mode dynamique : templates depuis base ou générés
      return [
        {
          id: '1',
          name: 'Facture Envoyée',
          channel: 'email',
          category: 'notification',
          subject: 'Votre facture #{invoiceNumber}',
          content: 'Bonjour {clientName},\n\nVeuillez trouver ci-joint votre facture #{invoiceNumber} d\'un montant de {amount} FCFA.\n\nDate d\'échéance : {dueDate}\n\nCordialement,\nL\'équipe BMS',
          usageCount: 45
        },
        {
          id: '2',
          name: 'Relance Paiement',
          channel: 'sms',
          category: 'reminder',
          content: 'Bonjour {clientName}, votre facture #{invoiceNumber} de {amount} FCFA est en attente de paiement depuis {daysOverdue} jours. Merci de régulariser.',
          usageCount: 23
        },
        {
          id: '3',
          name: 'Confirmation Commande',
          channel: 'whatsapp',
          category: 'notification',
          content: '✅ Commande confirmée !\n\nNuméro : {orderNumber}\nMontant : {amount} FCFA\nLivraison prévue : {deliveryDate}\n\nMerci pour votre confiance !',
          usageCount: 67
        },
        {
          id: '4',
          name: 'Bienvenue Client',
          channel: 'email',
          category: 'onboarding',
          subject: 'Bienvenue chez {companyName}',
          content: 'Cher {clientName},\n\nNous vous remercions de votre confiance !\n\nVotre compte est maintenant actif.\n\nN\'hésitez pas à nous contacter.\n\nCordialement',
          usageCount: 12
        },
        {
          id: '5',
          name: 'Promotion Spéciale',
          channel: 'sms',
          category: 'marketing',
          content: '🎉 OFFRE SPÉCIALE ! Profitez de -20% sur tous nos services jusqu\'au {endDate}. Code : {promoCode}',
          usageCount: 89
        }
      ];
    } else {
      // Mode statique
      return [
        {
          id: '1',
          name: 'Template Facture',
          channel: 'email',
          category: 'notification',
          subject: 'Votre facture',
          content: 'Contenu template facture...',
          usageCount: 10
        }
      ];
    }
  }

  // SMS
  async getSMSMessages() {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return [
        {
          id: '1',
          recipient: '+229 12345678',
          message: 'Votre facture F001 de 500 000 FCFA est disponible.',
          type: 'notification',
          status: 'delivered',
          sentAt: moment().subtract(2, 'hours').toISOString(),
          cost: 50
        },
        {
          id: '2',
          recipient: '+229 87654321',
          message: 'Relance : Votre paiement est en retard de 15 jours.',
          type: 'reminder',
          status: 'sent',
          sentAt: moment().subtract(1, 'day').toISOString(),
          cost: 50
        },
        {
          id: '3',
          recipient: '+229 98765432',
          message: '🎉 Promotion spéciale : -20% jusqu\'au 30/11 !',
          type: 'marketing',
          status: 'delivered',
          sentAt: moment().subtract(3, 'days').toISOString(),
          cost: 50
        },
        {
          id: '4',
          recipient: '+229 45678901',
          message: 'Votre commande a été expédiée.',
          type: 'notification',
          status: 'pending',
          sentAt: moment().subtract(30, 'minutes').toISOString(),
          cost: 50
        },
        {
          id: '5',
          recipient: '+229 23456789',
          message: 'Bienvenue ! Votre compte est maintenant actif.',
          type: 'onboarding',
          status: 'failed',
          sentAt: moment().subtract(2, 'days').toISOString(),
          cost: 0
        }
      ];
    } else {
      return [
        {
          id: '1',
          recipient: '+229 12345678',
          message: 'Votre facture est disponible',
          type: 'notification',
          status: 'sent',
          sentAt: '2025-11-01',
          cost: 50
        }
      ];
    }
  }

  // Emails
  async getEmails() {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return [
        {
          id: '1',
          from: 'contact@bms.bj',
          subject: 'Facture F001 - BMS Demo',
          preview: 'Veuillez trouver ci-joint votre facture d\'un montant de 500 000 FCFA...',
          date: moment().subtract(2, 'hours').toISOString(),
          read: false,
          starred: true,
          folder: 'inbox',
          hasAttachment: true
        },
        {
          id: '2',
          from: 'no-reply@system.bj',
          subject: 'Confirmation de votre commande',
          preview: 'Votre commande #CMD-2025-001 a été confirmée et sera expédiée...',
          date: moment().subtract(1, 'day').toISOString(),
          read: true,
          starred: false,
          folder: 'inbox',
          hasAttachment: false
        },
        {
          id: '3',
          from: 'support@bms.bj',
          subject: 'Relance de paiement',
          preview: 'Nous vous informons que votre facture F001 est en attente de paiement...',
          date: moment().subtract(3, 'days').toISOString(),
          read: false,
          starred: false,
          folder: 'inbox',
          hasAttachment: true
        },
        {
          id: '4',
          from: 'marketing@bms.bj',
          subject: 'Offre spéciale -20%',
          preview: 'Profitez de notre offre exceptionnelle sur tous les services...',
          date: moment().subtract(5, 'days').toISOString(),
          read: true,
          starred: false,
          folder: 'inbox',
          hasAttachment: false
        },
        {
          id: '5',
          from: 'moi@bms.bj',
          subject: 'Re: Question sur ma facture',
          preview: 'Merci pour votre message. Ci-joint les détails demandés...',
          date: moment().subtract(1, 'week').toISOString(),
          read: true,
          starred: true,
          folder: 'sent',
          hasAttachment: true
        }
      ];
    } else {
      return [
        {
          id: '1',
          from: 'contact@bms.bj',
          subject: 'Facture F001',
          preview: 'Veuillez trouver ci-joint votre facture...',
          date: '2025-11-01',
          read: false,
          starred: false,
          folder: 'inbox',
          hasAttachment: true
        }
      ];
    }
  }

  // WhatsApp
  async getWhatsAppMessages() {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return [
        {
          id: '1',
          contact: 'Client Alpha',
          phone: '+229 12345678',
          message: '✅ Votre commande #CMD-2025-001 est confirmée ! Montant : 500 000 FCFA. Livraison prévue demain.',
          type: 'notification',
          status: 'delivered',
          sentAt: moment().subtract(1, 'hour').toISOString()
        },
        {
          id: '2',
          contact: 'Client Beta',
          phone: '+229 87654321',
          message: 'Bonjour, votre facture F002 de 300 000 FCFA est disponible. Merci de votre confiance !',
          type: 'notification',
          status: 'read',
          sentAt: moment().subtract(3, 'hours').toISOString()
        },
        {
          id: '3',
          contact: 'Fournisseur A',
          phone: '+229 98765432',
          message: 'Votre livraison a été réceptionnée. Merci pour la ponctualité !',
          type: 'notification',
          status: 'delivered',
          sentAt: moment().subtract(1, 'day').toISOString()
        },
        {
          id: '4',
          contact: 'Client Gamma',
          phone: '+229 45678901',
          message: '🎉 OFFRE SPÉCIALE : Profitez de -20% sur tous nos services jusqu\'au 30/11 !',
          type: 'marketing',
          status: 'sent',
          sentAt: moment().subtract(2, 'days').toISOString()
        },
        {
          id: '5',
          contact: 'Client Delta',
          phone: '+229 23456789',
          message: 'Relance : Votre paiement est attendu depuis 10 jours. Merci de régulariser rapidement.',
          type: 'reminder',
          status: 'failed',
          sentAt: moment().subtract(4, 'days').toISOString()
        }
      ];
    } else {
      return [
        {
          id: '1',
          contact: 'Client Alpha',
          phone: '+229 12345678',
          message: 'Confirmation commande',
          type: 'notification',
          status: 'delivered',
          sentAt: '2025-11-01'
        }
      ];
    }
  }

  // Actions CRUD
  async createTemplate(templateData) {
    const newTemplate = {
      id: `template_${Date.now()}`,
      ...templateData,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };

    // En mode dynamique, sauvegarder en base
    if (await database.isDynamicMode()) {
      await database.run(`
        INSERT INTO communication_templates (name, channel, category, subject, content, usage_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [newTemplate.name, newTemplate.channel, newTemplate.category, newTemplate.subject, newTemplate.content, 0]);
    }

    return newTemplate;
  }

  async updateTemplate(templateId, updateData) {
    return {
      id: templateId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
  }

  async deleteTemplate(templateId) {
    return { success: true, message: 'Template supprimé avec succès' };
  }

  async sendSMS(smsData) {
    const newSMS = {
      id: `sms_${Date.now()}`,
      ...smsData,
      status: 'pending',
      sentAt: new Date().toISOString(),
      cost: 50 // Coût fixe par SMS
    };

    // Simuler l'envoi
    setTimeout(() => {
      newSMS.status = Math.random() > 0.1 ? 'sent' : 'failed';
    }, 2000);

    return newSMS;
  }

  async sendEmail(emailData) {
    const newEmail = {
      id: `email_${Date.now()}`,
      from: 'noreply@bms.bj',
      ...emailData,
      status: 'sent',
      sentAt: new Date().toISOString(),
      read: false,
      starred: false,
      folder: 'sent',
      hasAttachment: emailData.attachment ? true : false
    };

    return newEmail;
  }

  async sendWhatsApp(whatsappData) {
    const newMessage = {
      id: `wa_${Date.now()}`,
      ...whatsappData,
      status: 'pending',
      sentAt: new Date().toISOString()
    };

    // Simuler l'envoi
    setTimeout(() => {
      newMessage.status = Math.random() > 0.05 ? 'delivered' : 'failed';
    }, 3000);

    return newMessage;
  }

  // Stats
  async getCommunicationStats() {
    const emails = await this.getEmails();
    const sms = await this.getSMSMessages();
    const whatsapp = await this.getWhatsAppMessages();

    return {
      emails: {
        total: emails.length,
        sent: emails.filter(e => e.folder === 'sent').length,
        received: emails.filter(e => e.folder === 'inbox').length,
        unread: emails.filter(e => !e.read).length,
        starred: emails.filter(e => e.starred).length
      },
      sms: {
        total: sms.length,
        sent: sms.filter(s => s.status === 'sent').length,
        delivered: sms.filter(s => s.status === 'delivered').length,
        failed: sms.filter(s => s.status === 'failed').length,
        pending: sms.filter(s => s.status === 'pending').length,
        totalCost: sms.reduce((sum, s) => sum + (s.cost || 0), 0)
      },
      whatsapp: {
        total: whatsapp.length,
        sent: whatsapp.filter(w => w.status === 'sent').length,
        delivered: whatsapp.filter(w => w.status === 'delivered').length,
        read: whatsapp.filter(w => w.status === 'read').length,
        failed: whatsapp.filter(w => w.status === 'failed').length
      },
      templates: {
        total: (await this.getTemplates()).length,
        mostUsed: (await this.getTemplates()).sort((a, b) => b.usageCount - a.usageCount)[0]
      }
    };
  }
}

module.exports = new CommunicationService();
