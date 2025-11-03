# 🚂 Configuration Railway - BMS Communications

## ✅ Status Installation Locale

### Email (Resend) - ✅ FONCTIONNEL
- Provider: `resend`
- API Key: Configurée
- Status: ✅ Tests réussis

### SMS (Africa's Talking) - ⚠️ CONFIG REQUISE
- Provider: `africastalking`
- API Key: Configurée
- Status: ⚠️ Erreur 401 - Vérifier configuration

---

## 🔧 Configuration Railway

### 1. Accéder aux variables d'environnement
```
Railway Dashboard → Votre projet → Settings → Variables
```

### 2. Ajouter les variables suivantes

#### **Email (Resend)**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_DYTehtRB_CoLfwoh4ZhhCW8rvHkM6MZtx
RESEND_FROM=BMS <noreply@bms.bj>
```

#### **SMS (Africa's Talking)**
```env
SMS_PROVIDER=africastalking
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=atsk_ce146689e915e1294892d09d2ad6c948ebe42514a165d8646d2c1a923205528dfb14714d
AFRICASTALKING_SENDER_ID=BMS
```

### 3. Redémarrer le service
Après avoir ajouté les variables, Railway redémarrera automatiquement le backend.

---

## 🧪 Tester localement

```bash
cd backend
node test-communications.js
```

---

## 📋 Vérifications Africa's Talking

Si erreur 401 persiste:

### 1. Vérifier le dashboard
- https://account.africastalking.com
- Onglet "API Keys"
- Vérifier que la clé API est active

### 2. Username
Le username doit correspondre à:
- Mode **Sandbox**: `sandbox`
- Mode **Live**: votre nom d'utilisateur réel

### 3. Régénérer clé API
Si problème persiste:
1. Aller sur https://account.africastalking.com/apps/sandbox/settings/key
2. Cliquer "Generate New API Key"
3. Copier la nouvelle clé
4. Mettre à jour dans `.env` et Railway

---

## 💰 Crédits et Limites

### Resend (Email)
- **Gratuit**: 3000 emails/mois
- **Au-delà**: $1 par 1000 emails
- Dashboard: https://resend.com/emails

### Africa's Talking (SMS)
- **Sandbox**: Gratuit, numéros test uniquement
- **Live**: Paiement requis
  - Bénin: ~15 FCFA/SMS
  - Côte d'Ivoire: ~20 FCFA/SMS
  - Sénégal: ~25 FCFA/SMS
- Dashboard: https://account.africastalking.com

---

## 🔐 Sécurité

### ✅ Bonnes pratiques appliquées
- `.env` ajouté au `.gitignore`
- Clés API non committées dans le repo
- Variables séparées pour dev/prod

### ⚠️ Important
- **Ne jamais** commit les clés API
- **Ne jamais** exposer les clés côté frontend
- Utiliser Railway Variables pour la production

---

## 🚀 Endpoints disponibles

### Email
```bash
# Email simple
POST /api/v1/communications/email/send
{
  "to": "client@example.com",
  "subject": "Test",
  "html": "<h1>Test</h1>"
}

# Email facture
POST /api/v1/communications/email/invoice
{
  "to": "client@example.com",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "pdfUrl": "https://...",
  "customerName": "Client"
}

# Email relance
POST /api/v1/communications/email/reminder
{
  "to": "client@example.com",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "daysOverdue": 15,
  "customerName": "Client"
}
```

### SMS
```bash
# SMS simple
POST /api/v1/communications/sms/send
{
  "to": "+22997123456",
  "message": "Votre message"
}

# SMS facture
POST /api/v1/communications/sms/invoice
{
  "to": "+22997123456",
  "invoiceNumber": "F-2025-001",
  "amount": 150000,
  "customerName": "Client"
}

# Code OTP
POST /api/v1/communications/sms/otp
{
  "to": "+22997123456",
  "code": "123456",
  "expiresInMinutes": 5
}
```

---

## 📞 Support

### Resend
- Dashboard: https://resend.com
- Docs: https://resend.com/docs
- Status: https://status.resend.com

### Africa's Talking
- Dashboard: https://account.africastalking.com
- Docs: https://developers.africastalking.com
- Support: support@africastalking.com

---

**Dernière mise à jour:** 3 Nov 2025
**Status:** Email ✅ | SMS ⚠️ (config à vérifier)
