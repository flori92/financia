# Module Communications

Module complet de gestion des communications pour BMS (emails, SMS, WhatsApp, templates).

## 📋 Fonctionnalités

### Emails
- Envoi d'emails individuels et en masse
- Gestion des dossiers (inbox, sent, draft, trash, archive)
- Suivi des statuts (draft, sent, delivered, failed)
- Support des pièces jointes
- Marquage lu/non-lu, favoris

### SMS
- Envoi de SMS individuels et en masse
- Support multi-providers (Twilio, Vonage, etc.)
- Suivi des statuts de livraison
- Historique complet

### WhatsApp
- Envoi de messages WhatsApp
- Gestion des conversations
- Support des médias (images, documents, audio, vidéo)
- Messages entrants et sortants
- Statuts de lecture

### Templates
- Templates réutilisables pour tous les types de communication
- Variables dynamiques ({{customer_name}}, {{amount}}, etc.)
- Catégorisation (invoice, reminder, welcome, etc.)
- Statistiques d'utilisation

## 🚀 Installation

### 1. Exécuter la migration

```bash
cd bms/api-gateway
npm run typeorm migration:run
```

### 2. Configurer les variables d'environnement

```bash
# Email Provider
EMAIL_PROVIDER=sendgrid  # ou 'console' pour dev
SENDGRID_API_KEY=your_key

# SMS Provider
SMS_PROVIDER=twilio  # ou 'console' pour dev
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Provider
WHATSAPP_PROVIDER=twilio  # ou 'console' pour dev
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### 3. Redémarrer le serveur

```bash
npm run start:dev
```

## 📡 API Endpoints

### Emails

#### GET /api/v1/communications/emails
Récupérer tous les emails

**Query Parameters:**
- `folder` (optional): inbox, sent, draft, trash, archive

**Response:**
```json
[
  {
    "id": "uuid",
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "subject": "Subject",
    "body": "Email body",
    "folder": "inbox",
    "status": "delivered",
    "read": false,
    "starred": false,
    "hasAttachment": false,
    "sentAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/v1/communications/emails
Envoyer un email

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Subject",
  "body": "Email body",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com"
}
```

#### GET /api/v1/communications/emails/:id
Récupérer un email spécifique

### SMS

#### GET /api/v1/communications/sms
Récupérer tous les SMS

**Response:**
```json
[
  {
    "id": "uuid",
    "to": "+22997123456",
    "message": "SMS message",
    "status": "delivered",
    "sentAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/v1/communications/sms
Envoyer un SMS

**Request Body:**
```json
{
  "to": "+22997123456",
  "message": "SMS message"
}
```

### WhatsApp

#### GET /api/v1/communications/whatsapp
Récupérer les conversations WhatsApp

**Response:**
```json
[
  {
    "id": "conv_22997123456",
    "contact": "+229 97 12 34 56",
    "contactName": "Jean Dupont",
    "lastMessage": "Last message",
    "lastMessageTime": "2024-01-01T00:00:00Z",
    "unreadCount": 2,
    "messages": [...]
  }
]
```

#### POST /api/v1/communications/whatsapp
Envoyer un message WhatsApp

**Request Body:**
```json
{
  "to": "+22997123456",
  "message": "WhatsApp message",
  "type": "text"
}
```

### Templates

#### GET /api/v1/communications/templates
Récupérer tous les templates

**Query Parameters:**
- `type` (optional): email, sms, whatsapp

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Facture envoyée",
    "type": "email",
    "category": "invoice",
    "subject": "Votre facture {{invoice_number}}",
    "body": "Template body with {{variables}}",
    "variables": ["invoice_number", "customer_name", "amount"],
    "isActive": true
  }
]
```

#### POST /api/v1/communications/templates
Créer un template

**Request Body:**
```json
{
  "name": "Template name",
  "type": "email",
  "category": "invoice",
  "subject": "Subject with {{variables}}",
  "body": "Body with {{variables}}",
  "variables": ["variable1", "variable2"]
}
```

#### GET /api/v1/communications/templates/:id
Récupérer un template spécifique

## 🔐 Permissions

Le module utilise le système RBAC de BMS. Permissions requises:

- `communications:read` - Lire les communications
- `communications:write` - Créer/envoyer des communications
- `communications:delete` - Supprimer des communications

## 🧪 Tests

### Test manuel avec curl

```bash
# Envoyer un email
curl -X POST http://localhost:3001/api/v1/communications/emails \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "body": "Test email"
  }'

# Récupérer les emails
curl http://localhost:3001/api/v1/communications/emails \
  -H "Authorization: Bearer YOUR_TOKEN"

# Envoyer un SMS
curl -X POST http://localhost:3001/api/v1/communications/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "to": "+22997123456",
    "message": "Test SMS"
  }'
```

### Tests unitaires

```bash
npm run test -- communications
```

## 📊 Providers Supportés

### Email
- **Console** (développement) - Affiche dans la console
- **SendGrid** - Service email transactionnel
- **Mailgun** - Service email transactionnel
- **SMTP** - Serveur SMTP personnalisé
- **Amazon SES** - Service email AWS

### SMS
- **Console** (développement) - Affiche dans la console
- **Twilio** - Service SMS global
- **Vonage** (Nexmo) - Service SMS global
- **Africa's Talking** - Service SMS Afrique

### WhatsApp
- **Console** (développement) - Affiche dans la console
- **Twilio WhatsApp** - API WhatsApp Business
- **Meta WhatsApp Business API** - API officielle Meta

## 🔧 Configuration Avancée

### Utiliser SendGrid pour les emails

```typescript
// Dans .env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx

// Le service détectera automatiquement le provider
```

### Utiliser Twilio pour SMS et WhatsApp

```typescript
// Dans .env
SMS_PROVIDER=twilio
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Templates avec variables

```typescript
// Créer un template
const template = {
  name: "Facture envoyée",
  type: "email",
  subject: "Facture {{invoice_number}}",
  body: `
    Bonjour {{customer_name}},
    
    Votre facture {{invoice_number}} d'un montant de {{amount}} FCFA
    est disponible.
    
    Cordialement,
    {{company_name}}
  `,
  variables: ["customer_name", "invoice_number", "amount", "company_name"]
};

// Utiliser le template
const email = {
  to: "client@example.com",
  templateId: template.id,
  variables: {
    customer_name: "Jean Dupont",
    invoice_number: "INV-2024-001",
    amount: "50000",
    company_name: "BMS"
  }
};
```

## 📈 Statistiques

Le service fournit des statistiques sur les communications:

```typescript
const stats = await communicationsService.getCommunicationStats(companyId);

// Retourne:
{
  emails: {
    total: 156,
    sent: 145,
    delivered: 142,
    opened: 98,
    clicked: 45
  },
  sms: {
    total: 89,
    sent: 87,
    delivered: 85,
    failed: 2
  },
  whatsapp: {
    total: 234,
    sent: 230,
    delivered: 228,
    read: 215,
    failed: 4
  }
}
```

## 🐛 Troubleshooting

### Les emails ne sont pas envoyés

1. Vérifier la configuration du provider dans `.env`
2. Vérifier les logs du serveur
3. Tester avec `EMAIL_PROVIDER=console` pour voir les emails dans la console

### Les SMS ne sont pas livrés

1. Vérifier les crédits Twilio
2. Vérifier le format du numéro de téléphone (+22997123456)
3. Vérifier les logs Twilio

### Erreur "Permission denied"

1. Vérifier que l'utilisateur a les permissions `communications:read` ou `communications:write`
2. Vérifier le token JWT

## 🚀 Prochaines Améliorations

- [ ] Support des pièces jointes pour emails
- [ ] Webhooks pour les statuts de livraison
- [ ] Planification d'envoi différé
- [ ] A/B testing pour les templates
- [ ] Analytics avancés (taux d'ouverture, clics, etc.)
- [ ] Support des listes de diffusion
- [ ] Désabonnement automatique
- [ ] Bounce handling
- [ ] Spam score checking

## 📝 Licence

Propriétaire - BMS ERP System
