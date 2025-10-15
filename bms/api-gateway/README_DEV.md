# 🚀 BMS API Gateway - Guide Développeur

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Copier .env.example vers .env
cp .env.example .env

# Éditer .env avec tes configurations
nano .env
```

## 🗄️ Base de Données

### Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer l'utilisateur et la base
CREATE USER bms WITH PASSWORD 'bms_dev_password';
CREATE DATABASE bms OWNER bms;
GRANT ALL PRIVILEGES ON DATABASE bms TO bms;
\q
```

### Lancer les migrations

```bash
# Le schéma se crée automatiquement au démarrage (synchronize: true en dev)
npm run start:dev
```

### Seed des données de test

```bash
# Peupler la base avec des données de test
npm run seed

# Cela créera:
# - 4 utilisateurs (admin, tax_admin, accountant, entrepreneur)
# - 1 entreprise de test
# - 2 factures (1 impayée, 1 payée)
# - Comptes OHADA de base
# - 1 demande NIF en attente
```

**Credentials de test:**
- Admin: `admin@bms.bj` / `password123`
- Tax Admin: `taxadmin@dgi.bj` / `password123`
- Comptable: `comptable@cabinet.bj` / `password123`
- Entrepreneur: `entrepreneur@test.bj` / `password123`

## 🚀 Démarrage

```bash
# Mode développement (hot reload)
npm run start:dev

# Mode debug
npm run start:debug

# Mode production
npm run build
npm run start:prod
```

Le serveur démarre sur `http://localhost:3001`

## 📚 Documentation API

**Swagger UI**: http://localhost:3001/api/docs

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Mode watch (relance auto)
npm run test:watch

# Coverage
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Tests Mobile Money

```bash
# Tester un paiement KkiaPay
curl -X POST http://localhost:3001/api/v1/mobile-money/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1000,
    "currency": "XOF",
    "phoneNumber": "+22997123456",
    "provider": "mtn"
  }'
```

## 🔐 Mobile Money (KkiaPay)

### Configuration

Dans `.env`:
```env
MOBILE_MONEY_PROVIDER=kkiapay
MOBILE_MONEY_PUBLIC_KEY=votre_cle_publique
MOBILE_MONEY_PRIVATE_KEY=votre_cle_privee
MOBILE_MONEY_SECRET_KEY=votre_cle_secrete
MOBILE_MONEY_SANDBOX=true
```

### Tester en sandbox

1. Utiliser le numéro de test KkiaPay: `+22997000000`
2. Le paiement sera automatiquement approuvé
3. Le webhook sera déclenché

## 🔑 Authentification

### Obtenir un JWT

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "entrepreneur@test.bj",
    "password": "password123"
  }'
```

Réponse:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": { ... }
}
```

### Utiliser le JWT

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/invoices
```

## 🎯 Endpoints Principaux

| Module | Base URL | Description |
|--------|----------|-------------|
| Auth | `/api/v1/auth` | Authentification |
| Invoices | `/api/v1/invoices` | Facturation |
| Payments | `/api/v1/payments` | Paiements |
| Mobile Money | `/api/v1/mobile-money` | Paiement mobile |
| Accounting | `/api/v1/accounting` | Comptabilité OHADA |
| NIF | `/api/v1/nif` | Demandes NIF |
| Scoring | `/api/v1/scoring` | Score crédit |
| Loans | `/api/v1/loans` | Prêts |
| Health | `/health` | Status serveur |

## 👮 Roles & Permissions

| Role | Description | Routes |
|------|-------------|--------|
| `user` | Entrepreneur | Tous endpoints sauf admin |
| `accountant` | Expert-comptable | Multi-clients, validation |
| `tax_admin` | Admin DGI | Routes NIF admin |
| `admin` | Super admin | Toutes routes |

### Routes protégées

```typescript
// Exemple: Routes admin NIF
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TAX_ADMIN)
@Get('admin/requests')
async getAllNifRequests() { ... }
```

## 📧 Notifications

### Mode développement (console)

Les notifications s'affichent dans le terminal:
```
📧 ===== EMAIL =====
To: client@example.com
Subject: Paiement reçu
Message: Votre paiement de 1000 FCFA...
===================
```

### Mode production

Configurer dans `.env`:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=votre_cle

SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
```

## 🐛 Debugging

### Logs

Les logs s'affichent dans la console avec:
- `LOG`: Info générale
- `WARN`: Avertissements
- `ERROR`: Erreurs
- `DEBUG`: Debug détaillé

### VSCode Debug

Créer `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": [
        "-r",
        "ts-node/register",
        "-r",
        "tsconfig-paths/register"
      ],
      "args": ["${workspaceFolder}/src/main.ts"],
      "autoAttachChildProcesses": true,
      "restart": true
    }
  ]
}
```

## 🔧 Commandes Utiles

```bash
# Formater le code
npm run format

# Linter
npm run lint

# Build production
npm run build

# Nettoyer node_modules
rm -rf node_modules && npm install

# Voir les logs PostgreSQL
tail -f /usr/local/var/log/postgres.log

# Reset base de données
psql -U postgres
DROP DATABASE bms;
CREATE DATABASE bms OWNER bms;
\q
npm run start:dev  # Recréera le schéma
npm run seed       # Repeuplera les données
```

## 📦 Structure Projet

```
api-gateway/
├── src/
│   ├── auth/              # Authentification JWT
│   ├── companies/         # Gestion entreprises
│   ├── invoices/          # Facturation
│   ├── payments/          # Paiements
│   ├── mobile-money/      # KkiaPay + FedaPay
│   ├── accounting/        # Comptabilité OHADA
│   ├── nif/               # Demandes NIF
│   ├── scoring/           # Score crédit
│   ├── loans/             # Prêts
│   ├── notifications/     # Email/SMS/WhatsApp
│   ├── sync/              # Synchronisation offline
│   └── database/
│       └── seeds/         # Données de test
├── test/                  # Tests
├── .env                   # Config (ne pas commit!)
└── package.json
```

## 🚨 Troubleshooting

### Port 3001 déjà utilisé

```bash
# Trouver le processus
lsof -ti :3001

# Le killer
kill -9 $(lsof -ti :3001)
```

### Erreur connexion PostgreSQL

```bash
# Vérifier que PostgreSQL tourne
pg_isready

# Démarrer PostgreSQL (macOS)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Erreurs TypeORM

```bash
# Clear le cache
rm -rf dist/
npm run build
```

---

**Besoin d'aide ?** Consulte la [doc complète](./README.md) ou ouvre une issue.
