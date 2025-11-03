# 📧 Intégration Communications BMS

## Stack retenue pour Railway + Afrique

### ✅ Email: **Resend** (recommandé)
- **3000 emails/mois gratuit**
- API moderne et simple
- Parfait pour factures/relances
- Alternative: SendGrid, SMTP

### ✅ SMS: **Africa's Talking** (recommandé)
- **Focus Afrique de l'Ouest**
- Support MTN, Moov, Orange Money
- Prix: ~15 FCFA/SMS au Bénin
- Aussi: Mobile Money, Voice, USSD
- Alternative: Twilio

---

## 🚀 Installation

### 1. Installer les packages
```bash
cd backend

# Email avec Resend
npm install resend

# SMS avec Africa's Talking  
npm install africastalking

# Alternatives (optionnel)
npm install @sendgrid/mail twilio nodemailer
```

### 2. Configuration Railway

Dans votre projet Railway, ajoutez les variables d'environnement:

#### **Pour Resend (Email)**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_votre_cle_api
RESEND_FROM=BMS <noreply@votre-domaine.com>
```

**Obtenir clé API:**
1. Inscrivez-vous sur https://resend.com
2. Vérifiez votre domaine (ou utilisez resend.dev pour tests)
3. Créez une API Key dans Settings
4. Plan gratuit: 3000 emails/mois

#### **Pour Africa's Talking (SMS)**
```env
SMS_PROVIDER=africastalking
AFRICASTALKING_USERNAME=votre_username
AFRICASTALKING_API_KEY=votre_api_key
AFRICASTALKING_SENDER_ID=BMS
```

**Obtenir clé API:**
1. Inscrivez-vous sur https://africastalking.com
2. Mode Sandbox: gratuit pour tests (numéros test uniquement)
3. Mode Live: achetez du crédit SMS (à partir de 10$)
4. Créez une API Key dans votre dashboard
5. Prix indicatifs: 
   - Bénin: ~15 FCFA/SMS
   - Côte d'Ivoire: ~20 FCFA/SMS
   - Sénégal: ~25 FCFA/SMS

---

## 📚 Utilisation API

### Email

#### Envoyer un email simple
```bash
POST /api/v1/communications/email/send
Content-Type: application/json

{
  "to": "client@example.com",
  "subject": "Test Email BMS",
  "html": "<h1>Bonjour</h1><p>Ceci est un test</p>",
  "text": "Bonjour, ceci est un test"
}
```

#### Envoyer facture par email
```bash
POST /api/v1/communications/email/invoice
Content-Type: application/json

{
  "to": "client@example.com",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "pdfUrl": "https://storage.bms.com/invoices/F-2025-001.pdf",
  "customerName": "Jean Dupont"
}
```

#### Envoyer relance paiement
```bash
POST /api/v1/communications/email/reminder
Content-Type: application/json

{
  "to": "client@example.com",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "daysOverdue": 15,
  "customerName": "Jean Dupont"
}
```

### SMS

#### Envoyer un SMS simple
```bash
POST /api/v1/communications/sms/send
Content-Type: application/json

{
  "to": "+22997123456",
  "message": "Bonjour, ceci est un test BMS",
  "from": "BMS"
}
```

#### Notifier facture par SMS
```bash
POST /api/v1/communications/sms/invoice
Content-Type: application/json

{
  "to": "+22997123456",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "customerName": "Jean Dupont"
}
```

#### Confirmer paiement par SMS
```bash
POST /api/v1/communications/sms/payment-confirmation
Content-Type: application/json

{
  "to": "+22997123456",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "customerName": "Jean Dupont"
}
```

#### Envoyer code OTP
```bash
POST /api/v1/communications/sms/otp
Content-Type: application/json

{
  "to": "+22997123456",
  "code": "123456",
  "expiresInMinutes": 5
}
```

---

## 🧪 Mode Console (Tests sans API)

Par défaut, BMS utilise le mode `console` qui affiche les messages dans les logs sans les envoyer réellement.

```env
EMAIL_PROVIDER=console
SMS_PROVIDER=console
```

Les logs afficheront:
```
📧 [EMAIL CONSOLE] À: client@example.com | Sujet: Facture F-2025-001
📱 [SMS CONSOLE] À: +22997123456 | Message: Bonjour...
```

---

## 💡 Intégration Frontend

### Exemple modal Email
```typescript
const handleSendEmail = async () => {
  try {
    const response = await apiPost('/api/v1/communications/email/send', {
      to: emailTo,
      subject: emailSubject,
      html: emailContent
    });
    
    if (response.success) {
      alert('Email envoyé avec succès !');
    }
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
};
```

### Exemple modal SMS
```typescript
const handleSendSMS = async () => {
  try {
    const response = await apiPost('/api/v1/communications/sms/send', {
      to: phoneNumber,
      message: smsContent
    });
    
    if (response.success) {
      alert('SMS envoyé avec succès !');
    }
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
};
```

---

## 🔐 Bonnes pratiques

### Sécurité
- ✅ Ne jamais exposer les API keys côté frontend
- ✅ Toujours valider les numéros de téléphone (+229XXXXXXXX)
- ✅ Limiter le nombre d'envois par minute (rate limiting)
- ✅ Logger tous les envois pour audit

### Coûts
- 📧 **Email**: Resend gratuit jusqu'à 3000/mois
- 📱 **SMS**: Africa's Talking facturé à l'envoi (~15 FCFA)
- 💰 Surveillez votre consommation dans les dashboards

### Format numéros téléphone
```
Format attendu: +[code pays][numéro]
Exemples valides:
  +22997123456 (Bénin MTN)
  +22991234567 (Bénin Moov)
  +22596123456 (Côte d'Ivoire)
```

---

## 📊 Monitoring

### Vérifier l'envoi
Les endpoints retournent:
```json
{
  "success": true,
  "provider": "resend",
  "id": "abc123",
  "cost": "15 FCFA"
}
```

### Logs Railway
Surveillez les logs Railway pour:
- ✅ Confirmations d'envoi
- ❌ Erreurs API
- 💰 Coûts par envoi (SMS)

---

## 🆘 Support

### Email (Resend)
- Dashboard: https://resend.com/emails
- Docs: https://resend.com/docs
- Status: https://status.resend.com

### SMS (Africa's Talking)
- Dashboard: https://account.africastalking.com
- Docs: https://developers.africastalking.com
- Support: support@africastalking.com

---

## ✅ Checklist déploiement

- [ ] Packages installés (`resend`, `africastalking`)
- [ ] Variables d'environnement configurées sur Railway
- [ ] Domaine vérifié sur Resend (pour emails de production)
- [ ] Crédit SMS acheté sur Africa's Talking (pour production)
- [ ] Tests en mode console validés
- [ ] Tests avec vraies API validés
- [ ] Rate limiting configuré
- [ ] Monitoring des coûts activé

---

**Implémenté le 3 Nov 2025** 
Stack: Resend + Africa's Talking + Railway
