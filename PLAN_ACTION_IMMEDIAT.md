# ⚡ PLAN D'ACTION IMMÉDIAT - BMS

**Date**: 19 Octobre 2025  
**Objectif**: Actions concrètes pour les 2 prochaines semaines  
**Focus**: CRM Frontend + Tests Critiques

---

## 🎯 SPRINT 1 (Semaine 1-2): CRM FRONTEND

### Jour 1-2: Setup & Liste Contacts

#### Backend (Vérification)
```bash
# Vérifier que le backend CRM est opérationnel
curl http://localhost:3000/api/v1/crm/contacts?companyId=<uuid>
curl http://localhost:3000/api/v1/crm/stats?companyId=<uuid>
```

#### Frontend (Création)

**1. Créer la structure de dossiers**
```bash
mkdir -p bms-web/src/app/crm/contacts
mkdir -p bms-web/src/app/crm/contacts/[id]
mkdir -p bms-web/src/app/crm/contacts/new
mkdir -p bms-web/src/components/crm
```

**2. Page Liste Contacts** (`bms-web/src/app/crm/contacts/page.tsx`)

Fonctionnalités:
- [x] Grid responsive 3 colonnes
- [x] Recherche temps réel
- [x] Filtres (type, statut, tags)
- [x] Pagination
- [x] Tri (nom, date, valeur)
- [x] Actions rapides (éditer, archiver)
- [x] Empty state
- [x] Loading state
- [x] Export CSV

**3. Composant ContactCard** (`bms-web/src/components/crm/ContactCard.tsx`)

Affichage:
- Avatar avec initiales
- Nom complet / Entreprise
- Type (badge coloré)
- Email, téléphone
- Valeur vie client
- Dernière interaction
- Actions (voir, éditer, archiver)

**Temps estimé**: 2 jours

---

### Jour 3-4: Fiche Contact Détaillée

**Page Détail Contact** (`bms-web/src/app/crm/contacts/[id]/page.tsx`)

Sections:
1. **En-tête**
   - Avatar
   - Nom complet
   - Type + Statut
   - Actions (éditer, archiver, fusionner)

2. **Informations Générales**
   - Entreprise
   - Poste
   - Email, téléphone, mobile
   - Site web
   - Adresse complète

3. **Statistiques**
   - Valeur vie client
   - Nombre opportunités
   - Nombre factures
   - Dernière interaction

4. **Timeline Activités**
   - Liste chronologique
   - Filtres (type d'activité)
   - Ajouter activité

5. **Opportunités Liées**
   - Liste des deals
   - Statut pipeline
   - Montants

6. **Documents**
   - Factures
   - Devis
   - Contrats

**Temps estimé**: 2 jours

---

### Jour 5-6: Formulaire Contact

**Page Nouveau Contact** (`bms-web/src/app/crm/contacts/new/page.tsx`)

Formulaire en 4 sections:

1. **Type & Statut**
   - Radio buttons: Client, Prospect, Fournisseur, Partenaire
   - Select: Actif, Inactif

2. **Informations Entreprise**
   - Nom entreprise
   - Prénom / Nom contact
   - Poste
   - NIF / TVA

3. **Coordonnées**
   - Email (requis, validation)
   - Téléphone
   - Mobile
   - Site web

4. **Adresse**
   - Ligne 1, Ligne 2
   - Ville, Code postal
   - Pays (select)

5. **Autres**
   - Tags (multi-select)
   - Assigné à (select utilisateur)
   - Notes (textarea)

**Validation**:
- Email obligatoire et format valide
- Téléphone format international
- Vérification email unique

**Temps estimé**: 2 jours

---

### Jour 7-8: Timeline & Dashboard CRM

**1. Composant Timeline** (`bms-web/src/components/crm/ActivityTimeline.tsx`)

Affichage:
- Liste chronologique inversée
- Icônes par type (email, appel, réunion, note)
- Date/heure relative
- Auteur
- Description
- Pièces jointes

Actions:
- Ajouter activité
- Filtrer par type
- Rechercher

**2. Dashboard CRM** (`bms-web/src/app/crm/page.tsx`)

KPIs:
- Total contacts
- Nouveaux ce mois
- Par type (clients, prospects, fournisseurs)
- Par statut (actif, inactif)
- Activités récentes (7 jours)

Graphiques:
- Évolution contacts (12 mois)
- Répartition par type (pie chart)
- Top 10 clients (valeur vie)

Listes:
- Contacts récents
- À relancer (nextFollowUpDate)
- Sans activité >30j

**Temps estimé**: 2 jours

---

### Jour 9-10: Import CSV & Tests

**1. Import CSV Contacts**

Page: `bms-web/src/app/crm/contacts/import/page.tsx`

Workflow:
1. Upload fichier CSV
2. Mapping colonnes (drag & drop)
3. Prévisualisation (10 premières lignes)
4. Validation (emails, doublons)
5. Import (avec progress bar)
6. Rapport (succès, erreurs)

Format CSV attendu:
```csv
Type,Entreprise,Prénom,Nom,Email,Téléphone,Ville,Pays
client,ABC Corp,Jean,Dupont,jean@abc.com,+229 21 30 40 50,Cotonou,BJ
```

**2. Tests Manuels**

Scénarios:
- [ ] Créer contact client
- [ ] Créer contact prospect
- [ ] Rechercher contact
- [ ] Filtrer par type
- [ ] Éditer contact
- [ ] Archiver contact
- [ ] Fusionner doublons
- [ ] Ajouter activité
- [ ] Import CSV 100 contacts
- [ ] Export CSV

**Temps estimé**: 2 jours

---

## 📋 CHECKLIST SPRINT 1

### Backend (Vérification)
- [x] Endpoints CRM fonctionnels
- [x] Service CRM complet
- [x] Entities (Contact, Tag, Activity, Opportunity)
- [x] DTOs validation
- [x] Tests unitaires service

### Frontend (Développement)
- [ ] Page liste contacts
- [ ] Page détail contact
- [ ] Formulaire nouveau contact
- [ ] Formulaire édition contact
- [ ] Timeline activités
- [ ] Dashboard CRM
- [ ] Import CSV
- [ ] Export CSV
- [ ] Composants réutilisables (ContactCard, ActivityTimeline)

### Tests
- [ ] Tests manuels (10 scénarios)
- [ ] Tests E2E Playwright (3 parcours)
- [ ] Tests accessibilité
- [ ] Tests responsive

---

## 🛠️ OUTILS & RESSOURCES

### Développement

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui (composants)
- React Hook Form (formulaires)
- Zod (validation)
- Lucide React (icônes)

**Backend**:
- NestJS
- TypeORM
- PostgreSQL
- Swagger

### Design

**Figma** (si disponible):
- Maquettes pages CRM
- Composants design system
- Prototypes interactions

**Inspiration**:
- HubSpot CRM
- Pipedrive
- Salesforce Essentials

### Tests

**Outils**:
- Jest (tests unitaires)
- Playwright (tests E2E)
- React Testing Library
- Postman (tests API)

---

## 📊 MÉTRIQUES SPRINT 1

### Objectifs

- **Pages créées**: 6
- **Composants créés**: 5
- **Endpoints testés**: 15
- **Tests E2E**: 3 parcours
- **Bugs corrigés**: 0 (nouveau code)

### Définition of Done

Une page est "Done" quand:
- ✅ Code TypeScript sans erreurs
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Validation formulaires
- ✅ Tests manuels passés
- ✅ Accessible (navigation clavier)
- ✅ Documentée (commentaires)

---

## 🚀 DÉMARRAGE RAPIDE

### Setup Environnement

```bash
# Backend
cd bms/api-gateway
npm install
npm run start:dev

# Frontend
cd bms-web
npm install
npm run dev

# Vérifier que tout fonctionne
curl http://localhost:3000/api/health
curl http://localhost:3001
```

### Créer les Fichiers

```bash
# Pages CRM
touch bms-web/src/app/crm/page.tsx
touch bms-web/src/app/crm/contacts/page.tsx
touch bms-web/src/app/crm/contacts/new/page.tsx
touch bms-web/src/app/crm/contacts/[id]/page.tsx
touch bms-web/src/app/crm/contacts/import/page.tsx

# Composants
touch bms-web/src/components/crm/ContactCard.tsx
touch bms-web/src/components/crm/ContactForm.tsx
touch bms-web/src/components/crm/ActivityTimeline.tsx
touch bms-web/src/components/crm/ContactStats.tsx
touch bms-web/src/components/crm/ContactFilters.tsx
```

### Tester Backend CRM

```bash
# Obtenir un companyId
curl http://localhost:3000/api/v1/companies | jq '.[0].id'

# Créer un contact
curl -X POST http://localhost:3000/api/v1/crm/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "<uuid>",
    "type": "client",
    "companyName": "ABC Corporation",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@abc.com",
    "phone": "+229 21 30 40 50",
    "city": "Cotonou",
    "country": "BJ"
  }'

# Lister contacts
curl http://localhost:3000/api/v1/crm/contacts?companyId=<uuid>

# Statistiques
curl http://localhost:3000/api/v1/crm/stats?companyId=<uuid>
```

---

## 📅 PLANNING DÉTAILLÉ

### Semaine 1

| Jour | Tâche | Développeur | Heures |
|------|-------|-------------|--------|
| Lundi | Setup + Liste contacts (structure) | Dev 1 | 8h |
| Mardi | Liste contacts (fonctionnalités) | Dev 1 | 8h |
| Mercredi | Fiche détail (structure) | Dev 1 | 8h |
| Jeudi | Fiche détail (timeline) | Dev 1 | 8h |
| Vendredi | Formulaire contact | Dev 1 | 8h |

### Semaine 2

| Jour | Tâche | Développeur | Heures |
|------|-------|-------------|--------|
| Lundi | Formulaire contact (validation) | Dev 1 | 8h |
| Mardi | Dashboard CRM | Dev 1 | 8h |
| Mercredi | Import CSV | Dev 1 | 8h |
| Jeudi | Tests manuels | Dev 1 + QA | 8h |
| Vendredi | Corrections + Polish | Dev 1 | 8h |

**Total**: 80 heures (2 semaines × 1 développeur)

---

## 🎯 CRITÈRES DE SUCCÈS

### Fonctionnel

- ✅ Créer 100 contacts via UI
- ✅ Importer 1000 contacts via CSV
- ✅ Rechercher contact en <1s
- ✅ Afficher timeline 50 activités
- ✅ Fusionner 2 doublons
- ✅ Exporter 1000 contacts CSV

### Technique

- ✅ Temps chargement page <2s
- ✅ Responsive 100%
- ✅ 0 erreur console
- ✅ Lighthouse score >85
- ✅ Accessibilité WCAG AA

### UX

- ✅ Navigation intuitive
- ✅ Feedback utilisateur clair
- ✅ Empty states élégants
- ✅ Loading states fluides
- ✅ Messages d'erreur explicites

---

## 🔄 DAILY STANDUP

### Questions Quotidiennes

1. **Qu'ai-je fait hier ?**
2. **Que vais-je faire aujourd'hui ?**
3. **Ai-je des blocages ?**

### Métriques à Suivre

- Pages complétées / 6
- Composants créés / 5
- Tests passés / 10
- Bugs trouvés / corrigés

---

## 📞 SUPPORT & RESSOURCES

### Documentation

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeORM Docs](https://typeorm.io/)

### Exemples Code

- `bms-web/src/app/accountant/page.tsx` (Dashboard)
- `bms-web/src/app/invoices/page.tsx` (Liste avec filtres)
- `bms-web/src/app/crm/opportunities/page.tsx` (Kanban)

### API Backend

- Swagger: `http://localhost:3000/api`
- Endpoints CRM: `/api/v1/crm/*`

---

## ✅ VALIDATION FINALE

### Avant de Merger

- [ ] Code review (pair programming)
- [ ] Tests manuels (10 scénarios)
- [ ] Tests E2E (3 parcours)
- [ ] Lighthouse audit
- [ ] Accessibilité check
- [ ] Documentation mise à jour
- [ ] Changelog mis à jour
- [ ] Demo stakeholders

### Critères de Merge

- ✅ 0 erreur TypeScript
- ✅ 0 warning ESLint
- ✅ Tests passés
- ✅ Code formaté (Prettier)
- ✅ Commit messages conventionnels
- ✅ Branch à jour avec main

---

**🚀 Prêt à démarrer le Sprint 1 !**

_Prochaine revue: Vendredi soir (fin Sprint 1)_
