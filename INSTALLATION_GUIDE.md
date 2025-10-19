# 🚀 GUIDE D'INSTALLATION BMS - CRM COMPTABILITÉ

## 📋 Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+
- Redis 6+
- Git

## 🔧 Installation Backend (API Gateway)

### 1. Installer les dépendances

```bash
cd bms/api-gateway
npm install

# Installer les dépendances 2FA
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode
```

### 2. Configuration de l'environnement

Créer le fichier `.env` :

```bash
cp .env.example .env
```

Configurer les variables :

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=bms_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=bms_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=development

# 2FA (optionnel pour le moment)
# STRIPE_SECRET_KEY=sk_test_...
# BUDGET_INSIGHT_CLIENT_ID=...
# BUDGET_INSIGHT_CLIENT_SECRET=...
```

### 3. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE bms_db;
CREATE USER bms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bms_db TO bms_user;
\q
```

### 4. Exécuter les migrations

```bash
npm run typeorm migration:run
```

### 5. Seed initial (optionnel)

```bash
npm run seed:dev
```

### 6. Démarrer le serveur

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Le serveur démarre sur `http://localhost:3001`

## 🎨 Installation Frontend (Web)

### 1. Installer les dépendances

```bash
cd bms-web
npm install
```

### 2. Configuration de l'environnement

Créer le fichier `.env.local` :

```bash
cp .env.example .env.local
```

Configurer :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:3000`

## 🐳 Installation avec Docker (Recommandé)

### 1. Démarrer tous les services

```bash
# À la racine du projet
docker-compose up -d
```

Cela démarre :
- PostgreSQL (port 5432)
- Redis (port 6379)
- API Gateway (port 3001)
- Frontend Web (port 3000)

### 2. Vérifier les services

```bash
docker-compose ps
```

### 3. Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f api-gateway
```

### 4. Arrêter les services

```bash
docker-compose down
```

## ✅ Vérification de l'installation

### 1. Tester l'API

```bash
# Health check
curl http://localhost:3001/health

# Devrait retourner: {"status":"ok"}
```

### 2. Tester le frontend

Ouvrir `http://localhost:3000` dans le navigateur

### 3. Créer un compte utilisateur

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bms.local",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "BMS"
  }'
```

### 4. Se connecter

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bms.local",
    "password": "Admin123!"
  }'
```

Vous recevrez un token JWT à utiliser pour les requêtes authentifiées.

## 🔐 Configuration 2FA

### 1. Générer un secret 2FA

```bash
curl -X GET http://localhost:3001/auth/2fa/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Scanner le QR code

Utiliser Google Authenticator ou Authy pour scanner le QR code retourné.

### 3. Activer 2FA

```bash
curl -X POST http://localhost:3001/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

Vous recevrez 10 codes de secours à conserver précieusement.

## 📊 Utilisation du CRM

### 1. Créer un contact

Via l'interface web : `http://localhost:3000/crm/contacts/new`

Ou via l'API :

```bash
curl -X POST http://localhost:3001/crm/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "YOUR_COMPANY_ID",
    "type": "client",
    "companyName": "Entreprise Test SARL",
    "email": "contact@entreprise.com",
    "phone": "+22912345678",
    "city": "Cotonou",
    "country": "BJ"
  }'
```

### 2. Lister les contacts

```bash
curl -X GET "http://localhost:3001/crm/contacts?companyId=YOUR_COMPANY_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Voir les statistiques CRM

```bash
curl -X GET "http://localhost:3001/crm/stats?companyId=YOUR_COMPANY_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Tests

### Backend

```bash
cd bms/api-gateway

# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
cd bms-web

# Tests unitaires
npm run test

# Tests E2E avec Playwright
npm run test:e2e
```

## 🐛 Dépannage

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Vérifier les logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Erreur de connexion à Redis

```bash
# Vérifier que Redis est démarré
sudo systemctl status redis

# Tester la connexion
redis-cli ping
# Devrait retourner: PONG
```

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port 3001
lsof -i :3001

# Tuer le processus
kill -9 PID
```

### Réinitialiser la base de données

```bash
cd bms/api-gateway

# Supprimer toutes les tables
npm run typeorm schema:drop

# Recréer les tables
npm run typeorm migration:run

# Réinsérer les données de test
npm run seed:dev
```

## 📚 Documentation API

Une fois le serveur démarré, accéder à la documentation Swagger :

```
http://localhost:3001/api/docs
```

## 🔄 Mise à jour

```bash
# Backend
cd bms/api-gateway
git pull
npm install
npm run typeorm migration:run
npm run start:dev

# Frontend
cd bms-web
git pull
npm install
npm run dev
```

## 🎯 Prochaines étapes

1. ✅ 2FA configuré et fonctionnel
2. ✅ CRM contacts opérationnel
3. 🔄 Intégrations bancaires (Budget Insight)
4. 🔄 Passerelles de paiement (Stripe)
5. 🔄 Tests automatisés (70% coverage)

## 📞 Support

Pour toute question ou problème :
- Email: support@bms.local
- Documentation: https://docs.bms.local
- Issues GitHub: https://github.com/your-org/bms/issues

---

**BMS - Business Management System**  
*Comptabilité, Trésorerie et Fiscalité pour l'Afrique*
