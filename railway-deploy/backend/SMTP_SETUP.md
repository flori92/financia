# 📧 Configuration SMTP pour l'envoi d'emails

Ce guide explique comment configurer l'envoi d'emails pour le formulaire de contact/démo de BMS ERP.

## 🎯 Fonctionnalité

Le formulaire "Demander une démo" sur la landing page envoie automatiquement :
1. **Email à l'administrateur** (`florifavi@gmail.com`) avec les informations du prospect
2. **Email de confirmation** au prospect pour confirmer la réception de sa demande

---

## ⚙️ Configuration Gmail (Recommandé)

### Étape 1 : Activer l'authentification à 2 facteurs

1. Aller sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Activer la **Validation en deux étapes** si ce n'est pas déjà fait

### Étape 2 : Créer un mot de passe d'application

1. Aller sur [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionner **App:** Courrier
3. Sélectionner **Device:** Autre (nom personnalisé)
4. Entrer "BMS ERP" comme nom
5. Cliquer sur **Générer**
6. **Copier le mot de passe de 16 caractères** (format: `xxxx xxxx xxxx xxxx`)

### Étape 3 : Configurer les variables d'environnement

Créer un fichier `.env` dans `railway-deploy/backend/` avec :

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=florifavi@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application de l'étape 2
FRONTEND_URL=http://localhost:3000  # URL frontend pour production
```

### ⚠️ Important pour la production

Pour **Railway** ou autre hébergeur, configurer les variables d'environnement dans le dashboard :

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=florifavi@gmail.com
SMTP_PASS=votre_mot_de_passe_application
FRONTEND_URL=https://votre-domaine.com
```

---

## 🧪 Test de l'envoi d'email

### Test local

1. Démarrer le backend :
```bash
cd railway-deploy/backend
npm run start:dev
```

2. Accéder au frontend :
```bash
cd railway-deploy/frontend
npm run dev
```

3. Aller sur `http://localhost:3000` → cliquer sur **"Demander une démo"**

4. Remplir le formulaire et soumettre

5. Vérifier :
   - Email reçu sur `florifavi@gmail.com`
   - Email de confirmation reçu sur l'adresse du prospect

### Test de l'endpoint directement

```bash
curl -X POST http://localhost:3001/api/v1/contact-demo \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Utilisateur",
    "company": "Test Company",
    "email": "test@example.com",
    "phone": "+237 6XX XXX XXX",
    "message": "Ceci est un test"
  }'
```

---

## 📋 Format des emails envoyés

### Email à l'administrateur

- **To:** florifavi@gmail.com
- **Subject:** 🎯 Nouvelle Demande de Démo - [Nom Entreprise]
- **Contenu:**
  - 👤 Nom complet
  - 🏢 Entreprise
  - 📧 Email (cliquable)
  - 📱 Téléphone
  - 💬 Message (si fourni)
  - ⚡ Call-to-action : "Contacter dans les 24h"

### Email de confirmation au prospect

- **To:** Email du prospect
- **Subject:** ✅ Votre demande de démo BMS ERP
- **Contenu:**
  - Message de remerciement personnalisé
  - Récapitulatif de la demande
  - Délai de réponse (24-48h)
  - Suggestions en attendant la réponse

---

## 🔧 Alternatives à Gmail

### Utiliser SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_sendgrid_api_key
```

### Utiliser Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre_mailgun_password
```

### Utiliser AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=votre_aws_access_key
SMTP_PASS=votre_aws_secret_key
```

---

## 🐛 Dépannage

### Erreur : "Invalid login"

- Vérifier que le mot de passe d'application est correct
- Vérifier que l'authentification à 2 facteurs est activée
- Régénérer un nouveau mot de passe d'application

### Emails non reçus

- Vérifier les dossiers spam/courrier indésirable
- Vérifier les logs backend : `railway-deploy/backend/logs`
- Vérifier que `SMTP_USER` est bien configuré

### Erreur de connexion

- Vérifier que `SMTP_HOST` et `SMTP_PORT` sont corrects
- Vérifier que le serveur backend peut accéder à internet
- Essayer avec `SMTP_PORT=465` (SSL) au lieu de `587` (TLS)

---

## 📚 Ressources

- [Documentation nodemailer](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

## ✅ Checklist de déploiement

- [ ] Mot de passe d'application Gmail créé
- [ ] Variables d'environnement configurées sur Railway
- [ ] Test d'envoi d'email réussi
- [ ] Email admin reçu correctement
- [ ] Email confirmation prospect reçu correctement
- [ ] Logs backend vérifiés (pas d'erreurs)
- [ ] Landing page testée en production

---

**Note:** Pour des raisons de sécurité, **JAMAIS** commiter les vraies valeurs de `SMTP_PASS` dans le code source !
