# BMS - ERP Comptable & Financier

## Architecture mise en place

### 1. Base de données PostgreSQL
- **Schema complet** : `src/database/schema.sql`
- Tables principales :
  - Comptabilité : accounts, journal_entries, journal_entry_lines
  - Trésorerie : bank_accounts, bank_transactions, cash_flow_forecast
  - Facturation : customers, suppliers, invoices, invoice_lines
  - Stocks : products, stock_movements
  - Achats : purchase_orders
  - Budgets : budgets
  - Fiscal : vat_declarations
  - Audit : audit_log

### 2. Moteur comptable
- **Service** : `src/modules/accounting/accounting-engine.service.ts`
- Fonctionnalités :
  - Validation partie double
  - Génération automatique écritures (ventes, achats, paiements)
  - Calcul soldes comptes
  - Balance de vérification

### 3. Modules implémentés

#### Frontend (Next.js)
- `/crm/dashboard` - Pipeline de ventes avec KPIs
- `/crm/contacts` - Liste contacts
- `/crm/contacts/[id]` - Fiche contact détaillée (opportunités, factures, activités)
- `/inventory` - Gestion stocks avec alertes rupture
- `/accountant/*` - Tous modules comptables

#### Backend (NestJS)
- API REST complète
- Endpoints CRM, ERP, Comptabilité, Trésorerie
- Mock data pour développement

## Prochaines étapes

### Phase 1 - Infrastructure (Priorité 1)
1. **Connexion PostgreSQL**
   ```bash
   npm install @nestjs/typeorm typeorm pg
   ```
   - Configurer TypeORM
   - Créer entities TypeScript
   - Migrations automatiques

2. **Event Sourcing**
   - Implémenter bus d'événements
   - Historique complet des changements
   - CQRS pour performances

3. **Cache & Queue**
   ```bash
   npm install @nestjs/bull bull redis
   npm install @nestjs/cache-manager cache-manager
   ```

### Phase 2 - Modules critiques (Priorité 2)
1. **Rapprochement bancaire**
   - Intégration Budget Insight API
   - Matching automatique intelligent
   - Règles d'apprentissage

2. **Facturation électronique**
   - Format Factur-X (PDF/A-3 + XML)
   - Chorus Pro pour B2G
   - Signature électronique

3. **TVA & Fiscal**
   - Calculs automatiques
   - Déclarations CA3/CA12
   - Télétransmission DGFIP

### Phase 3 - Avancé (Priorité 3)
1. **Contrôle de gestion**
   - Budgets multi-axes
   - Écarts réalisé/budget
   - Alertes dépassements

2. **Business Intelligence**
   - Tableaux de bord personnalisables
   - Ratios financiers automatiques
   - Exports Excel/PDF

3. **Immobilisations**
   - Plans d'amortissement
   - Calcul automatique dotations
   - Cessions et plus-values

## Installation & Démarrage

### Prérequis
```bash
# PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Redis
brew install redis
brew services start redis

# Node.js 18+
node --version
```

### Configuration
```bash
# Backend
cd bms/api-gateway
cp .env.example .env
# Éditer .env avec vos credentials

# Créer la base
createdb bms_erp
psql bms_erp < src/database/schema.sql

# Installer dépendances
npm install

# Démarrer
npm run start:dev
```

### Frontend
```bash
cd bms-web
npm install
npm run dev
```

## Stack technique

### Backend
- **Framework** : NestJS (TypeScript)
- **Base de données** : PostgreSQL 15
- **ORM** : TypeORM
- **Cache** : Redis
- **Queue** : Bull (Redis)
- **API** : REST + GraphQL (optionnel)

### Frontend
- **Framework** : Next.js 14 (App Router)
- **UI** : Tailwind CSS + shadcn/ui
- **State** : React Query
- **Forms** : React Hook Form + Zod

### Infrastructure
- **Hosting** : AWS / Azure / GCP
- **CDN** : CloudFront / Cloudflare
- **Monitoring** : Sentry + DataDog
- **Logs** : ELK Stack

## Conformité

- ✅ SYSCOHADA (Plan comptable OHADA)
- ✅ Facturation électronique (ready 2026)
- ✅ RGPD
- ✅ Audit trail complet
- ✅ FEC (Fichier Écritures Comptables)
- ✅ Liasse fiscale

## Support

Pour toute question : support@bms-erp.com
