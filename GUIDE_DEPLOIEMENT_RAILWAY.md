# 🚂 Guide de Déploiement BMS sur Railway

## 📋 Prérequis

- [x] Railway CLI installé (`brew install railway`)
- [x] Compte Railway actif
- [x] Git configuré
- [x] Code sur la branche `clean-main`

## 🚀 Étapes de Déploiement

### 1. Connexion à Railway

```bash
railway login
```

### 2. Créer un Nouveau Projet

```bash
# Créer le projet
railway init

# Ou lier un projet existant
railway link
```

### 3. Créer les Services

#### Service Backend (API Gateway)

```bash
# Créer le service backend
railway service create backend

# Déployer le backend
cd bms/api-gateway
railway up --service backend
```

#### Service Frontend (Next.js)

```bash
# Créer le service frontend
railway service create frontend

# Déployer le frontend
cd ../../bms-web
railway up --service frontend
```

#### Service PostgreSQL

```bash
# Ajouter PostgreSQL depuis le dashboard Railway
# Ou via CLI:
railway add postgresql
```

### 4. Configurer les Variables d'Environnement

#### Backend

```bash
railway variables --service backend set \
  DATABASE_HOST=\${{PGHOST}} \
  DATABASE_PORT=\${{PGPORT}} \
  DATABASE_USER=\${{PGUSER}} \
  DATABASE_PASSWORD=\${{PGPASSWORD}} \
  DATABASE_NAME=\${{PGDATABASE}} \
  JWT_SECRET="votre-secret-jwt-super-securise" \
  JWT_EXPIRATION="7d" \
  JWT_REFRESH_EXPIRATION="30d" \
  PORT="3001" \
  NODE_ENV="production"
```

#### Frontend

```bash
railway variables --service frontend set \
  NEXT_PUBLIC_API_URL="https://votre-backend.railway.app" \
  NEXTAUTH_URL="https://votre-frontend.railway.app" \
  NEXTAUTH_SECRET="votre-secret-nextauth-super-securise"
```

### 5. Configurer les Domaines

```bash
# Générer un domaine pour le backend
railway domain --service backend

# Générer un domaine pour le frontend
railway domain --service frontend
```

### 6. Vérifier le Déploiement

```bash
# Voir les logs du backend
railway logs --service backend

# Voir les logs du frontend
railway logs --service frontend

# Vérifier le statut
railway status
```

## 🔧 Configuration Avancée

### Healthcheck

Le backend expose un endpoint de healthcheck:
```
GET /api/v1/health
```

### Migrations de Base de Données

```bash
# Se connecter au service backend
railway run --service backend npm run migrate
```

### Variables d'Environnement Complètes

#### Backend (.env)

```env
# Database (automatique avec Railway PostgreSQL)
DATABASE_HOST=${{PGHOST}}
DATABASE_PORT=${{PGPORT}}
DATABASE_USER=${{PGUSER}}
DATABASE_PASSWORD=${{PGPASSWORD}}
DATABASE_NAME=${{PGDATABASE}}

# JWT
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Application
PORT=3001
NODE_ENV=production

# Mobile Money (KkiaPay)
MOBILE_MONEY_PROVIDER=kkiapay
MOBILE_MONEY_PUBLIC_KEY=votre-cle-publique
MOBILE_MONEY_PRIVATE_KEY=votre-cle-privee
MOBILE_MONEY_SECRET_KEY=votre-cle-secrete
MOBILE_MONEY_SANDBOX=false

# Email
EMAIL_FROM=noreply@votredomaine.com
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=votre-cle-sendgrid

# SMS
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=votre-account-sid
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_PHONE_NUMBER=+229xxxxxxxx

# Frontend URL
WEB_APP_URL=${{FRONTEND_URL}}
```

#### Frontend (.env.local)

```env
# API Backend
NEXT_PUBLIC_API_URL=https://votre-backend.railway.app

# NextAuth
NEXTAUTH_URL=https://votre-frontend.railway.app
NEXTAUTH_SECRET=votre-secret-nextauth-super-securise-changez-moi

# Company ID (optionnel)
NEXT_PUBLIC_COMPANY_ID=votre-company-id
```

## 📊 Monitoring

### Logs en Temps Réel

```bash
# Backend
railway logs --service backend --follow

# Frontend
railway logs --service frontend --follow
```

### Métriques

Accédez au dashboard Railway pour voir:
- CPU usage
- Memory usage
- Network traffic
- Request count

## 🔄 Mises à Jour

### Déploiement Automatique

Railway redéploie automatiquement à chaque push sur la branche configurée.

### Déploiement Manuel

```bash
# Backend
cd bms/api-gateway
railway up --service backend

# Frontend
cd ../../bms-web
railway up --service frontend
```

## 🐛 Dépannage

### Erreur de Connexion à la Base de Données

```bash
# Vérifier les variables PostgreSQL
railway variables --service backend

# Tester la connexion
railway run --service backend node -e "console.log(process.env.PGHOST)"
```

### Erreur 502 Bad Gateway

- Vérifier que le PORT est bien configuré (3001 pour backend)
- Vérifier les logs: `railway logs --service backend`
- Vérifier le healthcheck endpoint

### Frontend ne peut pas contacter le Backend

- Vérifier NEXT_PUBLIC_API_URL dans les variables frontend
- Vérifier CORS dans le backend
- Vérifier que le backend est bien déployé

## 🔒 Sécurité

### Secrets à Générer

```bash
# Générer JWT_SECRET
openssl rand -base64 32

# Générer NEXTAUTH_SECRET
openssl rand -base64 32
```

### CORS

Le backend doit autoriser le domaine frontend:

```javascript
// Dans le backend
app.use(cors({
  origin: process.env.WEB_APP_URL || 'http://localhost:3000',
  credentials: true
}));
```

## 📱 URLs de Production

Après déploiement, notez vos URLs:

- **Frontend**: https://bms-frontend-production.up.railway.app
- **Backend**: https://bms-backend-production.up.railway.app
- **API Docs**: https://bms-backend-production.up.railway.app/api/docs

## 🎯 Checklist de Déploiement

- [ ] Railway CLI installé
- [ ] Projet Railway créé
- [ ] Services backend et frontend créés
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] Domaines générés
- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Connexion backend-frontend testée
- [ ] Base de données migrée
- [ ] Healthcheck fonctionnel
- [ ] Logs vérifiés
- [ ] Tests de bout en bout effectués

## 🆘 Support

En cas de problème:

1. Vérifier les logs: `railway logs --service <service>`
2. Vérifier les variables: `railway variables --service <service>`
3. Consulter la documentation Railway: https://docs.railway.app
4. Ouvrir un ticket sur le projet GitHub

## 🎉 Félicitations!

Votre application BMS est maintenant déployée sur Railway! 🚀
