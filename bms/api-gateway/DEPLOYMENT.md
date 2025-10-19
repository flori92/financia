# BMS API Gateway - Guide de Déploiement

## Installation des Dépendances

```bash
cd bms/api-gateway
npm install
```

## Configuration

1. Copier `.env.example` vers `.env`:
```bash
cp .env.example .env
```

2. Configurer les variables d'environnement dans `.env`

## Migrations de Base de Données

```bash
# Exécuter les migrations
npm run typeorm migration:run

# Créer une nouvelle migration
npm run typeorm migration:generate -- -n MigrationName

# Annuler la dernière migration
npm run typeorm migration:revert
```

## Seed Initial

```bash
# Seed du plan comptable SYSCOHADA
npm run seed
```

## Démarrage

### Développement
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Tests

```bash
# Tests unitaires
npm test

# Tests avec coverage
npm run test:cov

# Tests E2E
npm run test:e2e
```

## Docker

```bash
# Build
docker build -t bms-api-gateway .

# Run
docker run -p 3001:3001 --env-file .env bms-api-gateway
```

## Fonctionnalités Implémentées

### ✅ Multi-Tenancy
- Isolation des données par companyId
- Middleware de tenant
- Décorateur @CompanyId()

### ✅ Sécurité
- Helmet.js pour les headers de sécurité
- Rate limiting
- Encryption service pour les données sensibles
- JWT avec companyId

### ✅ GDPR
- Export des données utilisateur
- Suppression/anonymisation des données
- Gestion du consentement

### ✅ Intégrations Bancaires
- Open Banking (PSD2)
- Bridge API
- Budget Insight

### ✅ Intégrations E-commerce
- WooCommerce
- Shopify
- PrestaShop

### ✅ Passerelles de Paiement
- Stripe
- PayPal
- SEPA Direct Debit

### ✅ OCR & Automation
- Extraction de factures
- Extraction de reçus
- Extraction de relevés bancaires
- Moteur de workflow

## API Documentation

Une fois démarré, accéder à la documentation Swagger:
```
http://localhost:3001/api/docs
```

## Endpoints Principaux

### Authentication
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`

### GDPR
- GET `/api/v1/gdpr/export`
- DELETE `/api/v1/gdpr/delete`
- GET `/api/v1/gdpr/consent`

### Automation
- POST `/api/v1/automation/rules`
- GET `/api/v1/automation/rules`
- POST `/api/v1/automation/execute`

### Accounting
- GET `/api/v1/accounting/accounts`
- POST `/api/v1/accounting/journal-entries`
- GET `/api/v1/accounting/balance-sheet`
- GET `/api/v1/accounting/income-statement`

### CRM
- GET `/api/v1/crm/contacts`
- POST `/api/v1/crm/contacts`
- GET `/api/v1/crm/opportunities`

### Invoicing
- GET `/api/v1/invoices`
- POST `/api/v1/invoices`

## Monitoring

### Health Check
```
GET /health
```

### Metrics
```
GET /metrics
```

## Sécurité en Production

1. **Changer toutes les clés secrètes**
2. **Activer HTTPS**
3. **Configurer un pare-feu**
4. **Activer les logs**
5. **Configurer les backups automatiques**
6. **Mettre en place la surveillance**

## Support

Pour toute question: support@bms.com
