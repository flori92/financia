# 🚀 ROADMAP PHASE 1 - CONSOLIDATION (3 Mois)

**Objectif**: Transformer BMS en solution complète PME avec CRM + Facturation avancée + Banque auto  
**Période**: Novembre 2025 - Janvier 2026  
**Effort**: 15 semaines développement  
**Résultat**: Leader marché PME Afrique francophone

---

## 📅 PLANNING GLOBAL

| Semaine | Sprint | Module | Livrables |
|---------|--------|--------|-----------|
| S1-S2 | Sprint 1 | CRM - Contacts | Fiches contacts CRUD, Import/Export |
| S3-S4 | Sprint 2 | CRM - Pipeline | Opportunités, Kanban, Étapes |
| S5-S6 | Sprint 3 | CRM - Communication | Emails, Historique, Templates |
| S7-S8 | Sprint 4 | Devis | Création, Validation, Transformation |
| S9-S10 | Sprint 5 | Facturation Avancée | Avoirs, Templates, Récurrence |
| S11-S12 | Sprint 6 | Banque Auto | API Bridge/Budget Insight, Import auto |
| S13-S14 | Sprint 7 | Tests & Polish | Tests E2E, Corrections, Documentation |
| S15 | Sprint 8 | Release | Déploiement production, Formation clients |

---

## 🎯 MODULE 1: CRM COMPLET (Semaines 1-6)

### Priorité Absolue 🔴

Le CRM est le **plus grand gap** de l'application. Sans lui, BMS ne peut pas être adopté par les PME qui ont besoin de gérer leurs relations commerciales.

### Objectifs Fonctionnels

✅ **Gestion Contacts**
- CRUD complet (clients, prospects, fournisseurs, partenaires)
- Recherche et filtres avancés
- Tags et catégorisation
- Champs personnalisables
- Import/Export CSV
- Fusion de doublons automatique

✅ **Pipeline Commercial**
- Opportunités (deals) avec montant et probabilité
- Étapes personnalisables du cycle de vente
- Tableau Kanban drag & drop
- Prévisions de CA
- Affectation commerciaux
- Scoring automatique des leads

✅ **Communication**
- Historique complet des interactions
- Envoi d'emails intégrés
- Templates d'emails personnalisables
- Journal d'activités (appels, réunions, notes)
- Rappels automatiques
- Timeline par contact

### Architecture Technique

```
Backend (NestJS):
├── src/crm/
│   ├── entities/
│   │   ├── contact.entity.ts (Fiche contact complète)
│   │   ├── opportunity.entity.ts (Deal commercial)
│   │   ├── activity.entity.ts (Interaction)
│   │   ├── tag.entity.ts (Catégories)
│   │   └── pipeline-stage.entity.ts (Étapes vente)
│   ├── dto/
│   │   ├── create-contact.dto.ts
│   │   ├── filter-contacts.dto.ts
│   │   └── create-opportunity.dto.ts
│   ├── crm.service.ts (Logique métier)
│   ├── crm.controller.ts (Endpoints API)
│   └── crm.module.ts
│
Frontend (Next.js):
├── app/crm/
│   ├── contacts/
│   │   ├── page.tsx (Liste contacts)
│   │   ├── [id]/page.tsx (Fiche contact)
│   │   └── new/page.tsx (Nouveau contact)
│   ├── opportunities/
│   │   ├── page.tsx (Pipeline Kanban)
│   │   └── [id]/page.tsx (Détail deal)
│   └── activities/
│       └── page.tsx (Calendrier & Timeline)
└── components/crm/
    ├── ContactCard.tsx
    ├── OpportunityKanban.tsx
    ├── ActivityTimeline.tsx
    └── EmailComposer.tsx
```

### Endpoints API (15 endpoints)

**Contacts**
- `POST /api/v1/crm/contacts` - Créer contact
- `GET /api/v1/crm/contacts` - Liste avec filtres
- `GET /api/v1/crm/contacts/:id` - Détail contact
- `PUT /api/v1/crm/contacts/:id` - Modifier
- `DELETE /api/v1/crm/contacts/:id` - Archiver
- `POST /api/v1/crm/contacts/import` - Import CSV
- `POST /api/v1/crm/contacts/:id/merge/:otherId` - Fusion

**Opportunités**
- `POST /api/v1/crm/opportunities` - Créer deal
- `GET /api/v1/crm/opportunities` - Pipeline
- `PUT /api/v1/crm/opportunities/:id` - Modifier
- `PUT /api/v1/crm/opportunities/:id/stage` - Changer étape

**Activités**
- `POST /api/v1/crm/activities` - Logger interaction
- `GET /api/v1/crm/activities` - Historique
- `GET /api/v1/crm/contacts/:id/timeline` - Timeline contact

**Tags**
- `POST /api/v1/crm/tags` - Créer tag
- `GET /api/v1/crm/tags` - Liste tags

---

## 💼 MODULE 2: DEVIS COMPLETS (Semaines 7-8)

### Objectifs

✅ Création devis avec produits/services
✅ Calculs automatiques (HT, TVA, remises, TTC)
✅ Workflow validation (brouillon → envoyé → accepté/refusé)
✅ Transformation devis → facture en 1 clic
✅ Signature électronique client
✅ Relances automatiques si pas de réponse
✅ Versions multiples (historique modifications)

### Endpoints API (8 endpoints)

- `POST /api/v1/invoices/quotes` - Créer devis
- `GET /api/v1/invoices/quotes` - Liste devis
- `GET /api/v1/invoices/quotes/:id` - Détail
- `PUT /api/v1/invoices/quotes/:id` - Modifier
- `POST /api/v1/invoices/quotes/:id/send` - Envoyer client
- `POST /api/v1/invoices/quotes/:id/accept` - Accepter
- `POST /api/v1/invoices/quotes/:id/convert` - Transformer en facture
- `POST /api/v1/invoices/quotes/:id/duplicate` - Dupliquer

---

## 🧾 MODULE 3: FACTURATION AVANCÉE (Semaines 9-10)

### Objectifs

✅ Avoirs (totaux et partiels)
✅ Templates factures personnalisables (logo, couleurs, mentions)
✅ Factures récurrentes (abonnements)
✅ Multi-devises (base)
✅ Conditions générales de vente intégrées
✅ Pièces jointes multiples

### Endpoints API (6 endpoints)

- `POST /api/v1/invoices/:id/credit-note` - Créer avoir
- `GET /api/v1/invoices/templates` - Templates
- `POST /api/v1/invoices/templates` - Créer template
- `POST /api/v1/invoices/recurring` - Facture récurrente
- `GET /api/v1/invoices/recurring` - Liste abonnements
- `PUT /api/v1/invoices/recurring/:id` - Modifier abonnement

---

## 🏦 MODULE 4: CONNEXIONS BANCAIRES AUTO (Semaines 11-12)

### Objectifs

✅ Intégration API Budget Insight ou Bridge
✅ Connexion sécurisée aux banques (OAuth)
✅ Import automatique relevés quotidien
✅ Rapprochement intelligent amélioré (ML)
✅ Multi-comptes bancaires
✅ Notifications solde/transactions

### Intégrations Cibles

**Banques Afrique Francophone** (priorité):
- Ecobank
- UBA (United Bank for Africa)
- Orabank
- Bank of Africa
- Coris Bank
- Banque Atlantique

**API Partenaires**:
- **Budget Insight** (300+ banques africaines)
- **Bridge** (open banking européen + Afrique)
- **Mono** (fintech Afrique de l'Ouest)

### Endpoints API (5 endpoints)

- `POST /api/v1/banking/connect` - Connecter banque
- `GET /api/v1/banking/accounts` - Comptes bancaires
- `POST /api/v1/banking/sync` - Synchroniser
- `GET /api/v1/banking/transactions` - Transactions
- `PUT /api/v1/banking/accounts/:id/reconcile` - Rapprocher

---

## 🧪 TESTS & QUALITÉ (Semaines 13-14)

### Tests Automatisés

✅ **Tests Unitaires** (Jest)
- Services backend (80% coverage)
- Composants React (70% coverage)

✅ **Tests d'Intégration** (Supertest)
- Endpoints API complets
- Workflows métier

✅ **Tests E2E** (Playwright)
- Parcours utilisateur critiques
- Scénarios multi-société

### Scénarios de Test Prioritaires

1. Création contact → opportunité → devis → facture → paiement (cycle complet)
2. Import CSV 1000 contacts + fusion doublons
3. Rapprochement bancaire 500 transactions
4. Changement société avec rechargement données
5. Workflow validation devis multi-utilisateurs

---

## 📦 DÉPLOIEMENT PRODUCTION (Semaine 15)

### Checklist Pré-Release

✅ Tests E2E 100% passés
✅ Documentation API Swagger complète
✅ Guides utilisateur (vidéos + PDF)
✅ Formation équipe support
✅ Sauvegardes automatiques configurées
✅ Monitoring (Sentry, DataDog)
✅ Plan rollback testé

### Migration Données

1. Backup complet base actuelle
2. Migration entités CRM (sans impact données existantes)
3. Tests migration environnement staging
4. Go/No-Go validation
5. Migration production (fenêtre maintenance 2h)
6. Tests post-déploiement

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Techniques

- **Performance**: < 150ms temps réponse API
- **Disponibilité**: > 99.9% uptime
- **Bugs**: < 5 critiques/mois
- **Tests**: > 75% coverage

### KPIs Business

- **Contacts CRM**: 1000+ contacts gérés
- **Opportunités**: 200+ deals créés
- **Devis**: 500+ devis/mois
- **Taux conversion**: Devis → Facture > 40%
- **Transactions bancaires**: Import auto 1000+ transactions/jour

---

## 💰 BUDGET ESTIMÉ

### Ressources Humaines (3 mois)

- **1 Développeur Senior Full-Stack**: 12k€/mois × 3 = 36k€
- **1 Développeur Junior Backend**: 5k€/mois × 3 = 15k€
- **1 Designer UI/UX** (50%): 3k€/mois × 3 = 9k€
- **1 QA Engineer** (50%): 3k€/mois × 3 = 9k€

**Total RH**: 69k€

### Infrastructure & Services

- **Budget Insight API**: 500€/mois × 3 = 1.5k€
- **Hosting AWS** (upgrade): 200€/mois × 3 = 600€
- **Monitoring** (Sentry, DataDog): 150€/mois × 3 = 450€
- **Outils dev** (GitHub, Figma, etc.): 100€/mois × 3 = 300€

**Total Infra**: 2.85k€

### **BUDGET TOTAL PHASE 1**: **~72k€**

---

## 🚀 QUICK START - SEMAINE 1

### Jour 1-2: Setup Infrastructure

```bash
# 1. Créer modules backend
cd bms/api-gateway/src
nest g module crm
nest g service crm
nest g controller crm

# 2. Créer entités TypeORM
# Fichiers: contact.entity.ts, tag.entity.ts, activity.entity.ts

# 3. Migrations DB
npm run migration:generate -- -n CreateCrmTables
npm run migration:run

# 4. Setup frontend
cd ../../../bms-web/src/app
mkdir -p crm/contacts crm/opportunities crm/activities
```

### Jour 3-5: CRUD Contacts

1. Implémenter `contact.entity.ts` (toutes propriétés)
2. Créer DTOs validation (create, update, filter)
3. Service CRM avec méthodes CRUD
4. Controller avec endpoints
5. Page frontend liste contacts
6. Formulaire création/édition

### Jour 6-10: Filtres & Import

1. Recherche full-text
2. Filtres avancés (type, tags, assigné)
3. Pagination & tri
4. Import CSV avec parsing
5. Export CSV
6. Tests unitaires

---

## 📚 DOCUMENTATION TECHNIQUE

### Technologies Utilisées

**Backend**:
- NestJS 10
- TypeORM 0.3
- PostgreSQL 15
- JWT Auth
- Swagger/OpenAPI

**Frontend**:
- Next.js 14 (App Router)
- TypeScript 5
- TailwindCSS 3
- shadcn/ui
- React Hook Form
- Zod validation

**Intégrations**:
- Budget Insight API
- Bridge by Bankin'
- SendGrid (emails)

### Conventions Code

- **Entities**: PascalCase (`Contact`, `Opportunity`)
- **DTOs**: Suffix `Dto` (`CreateContactDto`)
- **Services**: Suffix `Service` (`CrmService`)
- **Endpoints**: REST standard (`POST /contacts`, `GET /contacts/:id`)
- **Commits**: Format `✨ [FEAT] Description` ou `🐛 [FIX] Bug`

---

## ✅ CHECKLIST LANCEMENT

### Avant de Commencer

- [ ] Budget validé (72k€)
- [ ] Équipe recrutée (1 senior + 1 junior min)
- [ ] Environnement dev configuré
- [ ] Accès API Budget Insight ou Bridge
- [ ] Figma maquettes CRM validées
- [ ] Rétroplanning Gantt créé
- [ ] Clients beta identifiés (5-10 entreprises)

### Semaine 1 Prête

- [ ] Modules backend CRM créés
- [ ] Migrations DB exécutées
- [ ] Routes frontend `/crm/*` créées
- [ ] Composants de base (`ContactCard`, `ContactForm`)
- [ ] Tests premiers endpoints
- [ ] Documentation Swagger

---

## 🎯 SUITE: PHASE 2

Après Phase 1, enchaîner avec:
- Applications mobiles iOS/Android (8 semaines)
- Comptabilité analytique (4 semaines)
- Fiscal avancé FEC + Liasse (3 semaines)

**Objectif 6 mois**: Application BMS complète leader marché PME Afrique

---

**Document de référence - Mise à jour hebdomadaire recommandée**  
**Prochaine revue**: Fin Sprint 1 (Semaine 2)
