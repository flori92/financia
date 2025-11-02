#  Facturation et Relances Clients - Guide de Configuration

Ce guide explique comment configurer et utiliser les fonctionnalités d'envoi de factures et de relances automatiques dans BMS ERP.

##  Fonctionnalités disponibles

###  Envoi de factures
- **Email** : Envoi direct avec pièce jointe et lien de paiement
- **WhatsApp** : Notification avec résumé et lien vers la facture
- **SMS** : Message court avec montant et lien de paiement

###  Relances automatiques
- **4 niveaux d'urgence** selon le retard de paiement
- **Messages personnalisés** pour chaque niveau
- **Envoi multi-canaux** automatique
- **Calcul des pénalités de retard** (taux légal Bénin)

##  Niveaux de relances

| Niveau | Retard | Canaux utilisés | Type de message |
|--------|--------|----------------|-----------------|
| **Gentle** | 0-15 jours | Email | Rappel amical |
| **Firm** | 15-30 jours | Email + WhatsApp | Rappel ferme |
| **Formal** | 30-45 jours | Email + WhatsApp + SMS | Demande formelle |
| **Legal** | +45 jours | Email + WhatsApp + SMS | Mise en demeure légale |

##  Configuration

### 1. Variables d'environnement

Copiez le fichier `.env.example` vers `.env` et configurez les variables suivantes :

```bash
# Email Provider (console, smtp, sendgrid)
EMAIL_PROVIDER=smtp

# Configuration SMTP (recommandé pour commencer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM="BMS" <noreply@votre-entreprise.com>
```

### 2. Configuration Email (SMTP)

#### Option A : Gmail (recommandé pour tester)
1. Activez l'authentification 2 facteurs sur votre compte Gmail
2. Générez un "mot de passe d'application" :
   - Allez dans les paramètres Google → Sécurité → Mots de passe des applications
   - Créez un nouveau mot de passe pour "BMS ERP"
   - Utilisez ce mot de passe dans `SMTP_PASS`

#### Option B : SendGrid (production)
1. Créez un compte SendGrid
2. Générez une clé API
3. Configurez :
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=votre-cle-api
   SENDGRID_FROM=noreply@votre-entreprise.com
   ```

### 3. Configuration WhatsApp

#### Option A : Twilio WhatsApp (recommandé)
1. Créez un compte Twilio
2. Activez le Sandbox WhatsApp
3. Configurez :
   ```bash
   WHATSAPP_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=votre-sid
   TWILIO_AUTH_TOKEN=votre-token
   TWILIO_WHATSAPP_NUMBER=+14155238886
   ```

#### Option B : Meta WhatsApp Business
1. Créez une application WhatsApp Business Meta
2. Obtenez un token d'accès et un phone number ID
3. Configurez :
   ```bash
   WHATSAPP_PROVIDER=meta
   META_ACCESS_TOKEN=votre-token
   META_PHONE_NUMBER_ID=votre-phone-id
   ```

### 4. Configuration SMS (Twilio)

```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=votre-sid
TWILIO_AUTH_TOKEN=votre-token
TWILIO_PHONE_NUMBER=+1234567890
```

##  Utilisation

### Envoi de factures

1. **Depuis la page Factures** (`/invoices`) :
   - Cliquez sur l'icône  (Email) pour envoyer par email
   - Cliquez sur l'icône  (WhatsApp) pour envoyer par WhatsApp
   - Cliquez sur l'icône  (SMS) pour envoyer par SMS

2. **Automatiquement après création** :
   - Les factures peuvent être envoyées automatiquement lors de leur création

### Relances clients

1. **Accédez à la page Relances** (`/accountant/reminders`) :
   - Vue d'ensemble de toutes les factures en retard
   - Statistiques par niveau d'urgence
   - Aperçu des actions prévues

2. **Envoyez les relances** :
   - Cliquez sur "Envoyer toutes les relances"
   - Le système envoie automatiquement selon le niveau de chaque facture

3. **Relances automatiques** (optionnel) :
   - Configurez un cron job pour exécuter les relances automatiquement
   - Exemple : tous les jours à 9h00

##  Templates de messages

### Rappel amical (Email)
```
Bonjour [Nom du client],

Ceci est un rappel amical concernant votre facture :

 Facture : [Numéro]
 Montant : [Montant] FCFA
 Échéance : [Date]
⏰ En retard de : [Jours] jour(s)

Vous pouvez consulter et payer votre facture ici : [Lien]

Merci pour votre confiance !

Cordialement,
L'équipe [Votre Entreprise]
```

### Rappel ferme (WhatsApp)
```
 Rappel - Facture [Numéro] en retard

Bonjour [Nom du client],
Votre facture est en retard de paiement :
 Montant : [Montant] FCFA
⏰ Retard : [Jours] jour(s)

Merci de régulariser rapidement : [Lien]
```

##  Personnalisation

### Modifier les templates
Les messages sont configurés dans :
- `backend/src/notifications/notifications.service.ts`
- `backend/src/invoices/services/reminders.service.ts`

### Ajouter de nouveaux canaux
1. Étendez `NotificationsService`
2. Ajoutez les variables d'environnement nécessaires
3. Mettez à jour les méthodes d'envoi

##  Dépannage

### Emails non reçus
1. Vérifiez la configuration SMTP dans `.env`
2. Testez avec `EMAIL_PROVIDER=console` pour voir les logs
3. Vérifiez le dossier spam/indésirables

### WhatsApp non fonctionnel
1. Vérifiez que le numéro Twilio est bien configuré
2. Assurez-vous que le destinataire a bien le format `+229XXXXXX`
3. Testez d'abord avec le Sandbox Twilio

### Erreurs de timeout
1. Vérifiez votre connexion internet
2. Testez avec `EMAIL_PROVIDER=console` pour isoler le problème
3. Consultez les logs de l'application

##  Monitoring

### Logs des envois
Les notifications sont loggées avec le niveau `INFO` :
```
Sending email to client@example.com: Subject
Email sent successfully to client@example.com
WhatsApp message sent via Twilio: SID123
```

### Statistiques
- Page Relances : statistiques en temps réel
- Export CSV possible depuis la page Factures
- Logs détaillés dans la console de l'application

##  Support

Pour toute question ou problème :
1. Consultez les logs de l'application
2. Vérifiez la configuration `.env`
3. Testez avec le mode `console` pour débugger
4. Contactez le support technique

---

**Note** : En mode développement (`EMAIL_PROVIDER=console`), les messages s'affichent dans la console au lieu d'être réellement envoyés. C'est idéal pour tester les templates!
