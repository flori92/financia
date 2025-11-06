# 🚀 Roadmap BMS - Prochaines Étapes

**Date:** 6 novembre 2025  
**Statut:** Corrections API terminées - Prêt pour les nouvelles fonctionnalités

---

## 📊 État Actuel

### ✅ Backend Implémenté
- **Congés (Leaves):** Service complet avec workflow d'approbation multi-niveaux
- **Notes de frais (Expenses):** Service basique (stubs uniquement)
- **Recrutement (Recruitment):** Service basique (stubs uniquement)

### 🎨 Frontend Existant
- Pages de base créées pour: `/hr/leaves`, `/hr/expenses`, `/hr/timesheets`, `/hr/certificates`
- Navigation et sidebar configurés
- Aucune interface utilisateur fonctionnelle

---

## 🎯 Plan d'Action - 4 Semaines

### **SEMAINE 1: Module Congés (Leaves) - Frontend/UX**

#### Jour 1-2: Interface de Gestion des Congés
**Objectif:** Page de liste et détails des demandes

**Fichiers à créer:**

1. `bms-web/src/app/hr/leaves/page.tsx` - Liste des demandes avec filtres
2. `bms-web/src/app/hr/leaves/[id]/page.tsx` - Détails d'une demande
3. `bms-web/src/app/hr/leaves/new/page.tsx` - Formulaire de création
4. `bms-web/src/components/hr/LeaveRequestCard.tsx` - Carte de demande
5. `bms-web/src/components/hr/LeaveStatusBadge.tsx` - Badge de statut

**Fonctionnalités:**
- ✅ Liste des demandes avec filtres (statut, type, employé, dates)
- ✅ Création de nouvelle demande
- ✅ Affichage du solde de congés
- ✅ Workflow d'approbation visuel
- ✅ Historique des approbations

#### Jour 3-4: Workflow d'Approbation
**Objectif:** Interface pour approuver/rejeter les demandes

**Fichiers à créer:**
1. `bms-web/src/components/hr/LeaveApprovalFlow.tsx` - Composant de workflow
2. `bms-web/src/components/hr/LeaveApprovalModal.tsx` - Modal d'approbation
3. `bms-web/src/hooks/useLeaveApproval.ts` - Hook pour gérer les approbations

**Fonctionnalités:**
- ✅ Visualisation du workflow multi-niveaux
- ✅ Approbation/rejet avec commentaires
- ✅ Notifications en temps réel
- ✅ Historique des décisions

#### Jour 5: Calendrier et Soldes
**Objectif:** Vue calendrier et gestion des soldes

**Fichiers à créer:**
1. `bms-web/src/components/hr/LeaveCalendar.tsx` - Calendrier des congés
2. `bms-web/src/components/hr/LeaveBalanceCard.tsx` - Carte de solde
3. `bms-web/src/app/hr/leaves/calendar/page.tsx` - Page calendrier

**Fonctionnalités:**
- ✅ Calendrier avec vue mensuelle/annuelle
- ✅ Affichage des congés par employé
- ✅ Soldes de congés en temps réel
- ✅ Prévisions de soldes

---

### **SEMAINE 2: Tests Automatisés**

#### Jour 1-2: Tests Backend
**Objectif:** Couverture de tests pour les modules HR

**Fichiers à créer:**
1. `bms/api-gateway/src/modules/hr/leave.service.spec.ts`
2. `bms/api-gateway/src/modules/hr/expense.service.spec.ts`
3. `bms/api-gateway/src/modules/hr/recruitment.service.spec.ts`

**Tests à implémenter:**
- ✅ Création de demandes de congés
- ✅ Workflow d'approbation complet
- ✅ Calcul des soldes
- ✅ Validation des dates
- ✅ Gestion des erreurs

#### Jour 3-4: Tests Frontend
**Objectif:** Tests E2E et unitaires

**Fichiers à créer:**
1. `bms-web/src/app/hr/leaves/__tests__/leaves.test.tsx`
2. `bms-web/cypress/e2e/hr/leaves.cy.ts`
3. `bms-web/src/components/hr/__tests__/LeaveApprovalFlow.test.tsx`

**Tests à implémenter:**
- ✅ Création de demande (E2E)
- ✅ Approbation/rejet (E2E)
- ✅ Affichage des soldes
- ✅ Filtres et recherche
- ✅ Composants UI

#### Jour 5: CI/CD et Qualité
**Objectif:** Pipeline de tests automatisés

**Fichiers à créer:**
1. `.github/workflows/test-backend.yml`
2. `.github/workflows/test-frontend.yml`
3. `scripts/run-all-tests.sh`

**Configuration:**
- ✅ Tests automatiques sur PR
- ✅ Couverture de code > 80%
- ✅ Linting et formatage
- ✅ Tests de sécurité

---

### **SEMAINE 3: Documentation Swagger/ADR**

#### Jour 1-2: Documentation Swagger
**Objectif:** Documentation API complète

**Fichiers à modifier:**
1. `bms/api-gateway/src/modules/hr/hr.controller.ts` - Ajouter decorators Swagger
2. `bms/api-gateway/src/modules/hr/dto/*.dto.ts` - Documenter tous les DTOs

**Éléments à documenter:**
- ✅ Tous les endpoints HR (leaves, expenses, recruitment)
- ✅ Schémas de requêtes/réponses
- ✅ Codes d'erreur
- ✅ Exemples de requêtes
- ✅ Authentification et permissions

#### Jour 3-4: Architecture Decision Records (ADR)
**Objectif:** Documenter les décisions architecturales

**Fichiers à créer:**
1. `docs/adr/001-multi-tenant-architecture.md`
2. `docs/adr/002-leave-approval-workflow.md`
3. `docs/adr/003-expense-reimbursement-process.md`
4. `docs/adr/004-recruitment-pipeline.md`
5. `docs/adr/005-api-versioning-strategy.md`

**Contenu:**
- ✅ Contexte et problème
- ✅ Décision prise
- ✅ Alternatives considérées
- ✅ Conséquences
- ✅ Statut (accepté/rejeté/obsolète)

#### Jour 5: Documentation Utilisateur
**Objectif:** Guides utilisateur et développeur

**Fichiers à créer:**
1. `docs/user-guide/hr-leaves.md`
2. `docs/developer-guide/hr-module.md`
3. `docs/api-examples/hr-workflows.md`

---

### **SEMAINE 4: Notes de Frais (Expenses)**

#### Jour 1-2: Backend Complet
**Objectif:** Implémenter le service complet

**Fichier à modifier:**
`bms/api-gateway/src/modules/hr/expense.service.ts`

**Fonctionnalités:**
- ✅ Création de notes de frais avec lignes
- ✅ Upload de justificatifs (reçus)
- ✅ Workflow d'approbation
- ✅ Calcul des remboursements
- ✅ Intégration comptable (écritures)
- ✅ Export pour paiement

#### Jour 3-4: Frontend/UX
**Objectif:** Interface complète

**Fichiers à créer:**
1. `bms-web/src/app/hr/expenses/page.tsx` - Liste
2. `bms-web/src/app/hr/expenses/[id]/page.tsx` - Détails
3. `bms-web/src/app/hr/expenses/new/page.tsx` - Création
4. `bms-web/src/components/hr/ExpenseForm.tsx` - Formulaire
5. `bms-web/src/components/hr/ExpenseLineItem.tsx` - Ligne de frais
6. `bms-web/src/components/hr/ReceiptUpload.tsx` - Upload justificatifs

**Fonctionnalités:**
- ✅ Création multi-lignes
- ✅ Upload de photos/PDF
- ✅ Catégorisation automatique
- ✅ Calcul TVA récupérable
- ✅ Workflow d'approbation
- ✅ Suivi des remboursements

#### Jour 5: OCR et Automatisation
**Objectif:** Extraction automatique des données

**Fichiers à créer:**
1. `bms/api-gateway/src/modules/ai/ocr-expense.service.ts`
2. `bms-web/src/components/hr/ExpenseOCRScanner.tsx`

**Fonctionnalités:**
- ✅ Scan de reçus avec OCR
- ✅ Extraction automatique (montant, date, fournisseur)
- ✅ Validation et correction
- ✅ Apprentissage des catégories

---

## 🎯 SEMAINES 5-8: Module Recrutement

### Semaine 5: Backend Recrutement
**Objectif:** Service complet de recrutement

**Fonctionnalités:**
- ✅ Gestion des offres d'emploi
- ✅ Publication multi-canaux
- ✅ Réception des candidatures
- ✅ Parsing de CV (OCR)
- ✅ Scoring automatique
- ✅ Workflow d'entretiens

### Semaine 6: Frontend Recrutement
**Objectif:** Interface ATS (Applicant Tracking System)

**Pages à créer:**
- ✅ Liste des offres d'emploi
- ✅ Création/édition d'offre
- ✅ Pipeline de candidatures (Kanban)
- ✅ Profil candidat
- ✅ Planification d'entretiens
- ✅ Évaluation et scoring

### Semaine 7: Portail Candidat
**Objectif:** Interface publique pour candidatures

**Fonctionnalités:**
- ✅ Page carrières publique
- ✅ Formulaire de candidature
- ✅ Upload CV et lettre de motivation
- ✅ Suivi de candidature
- ✅ Notifications par email

### Semaine 8: Intégrations et Analytics
**Objectif:** Connexions externes et rapports

**Intégrations:**
- ✅ LinkedIn Jobs
- ✅ Indeed
- ✅ Welcome to the Jungle
- ✅ Calendrier (Google/Outlook)
- ✅ Visioconférence (Zoom/Teams)

**Analytics:**
- ✅ Temps de recrutement moyen
- ✅ Taux de conversion par étape
- ✅ Sources de candidatures
- ✅ Coût par embauche

---

## 📋 Checklist Globale

### Infrastructure
- [ ] Redis caching activé
- [ ] Backups automatiques configurés
- [ ] Monitoring et alertes
- [ ] Performance optimisée

### Modules HR
- [ ] Congés: Frontend complet
- [ ] Congés: Tests automatisés
- [ ] Notes de frais: Backend complet
- [ ] Notes de frais: Frontend complet
- [ ] Notes de frais: OCR intégré
- [ ] Recrutement: Backend complet
- [ ] Recrutement: Frontend complet
- [ ] Recrutement: Portail candidat

### Documentation
- [ ] Swagger complet et à jour
- [ ] ADR pour décisions majeures
- [ ] Guide utilisateur
- [ ] Guide développeur
- [ ] Exemples d'API

### Qualité
- [ ] Couverture tests > 80%
- [ ] CI/CD configuré
- [ ] Linting et formatage
- [ ] Sécurité validée
- [ ] Performance testée

---

## 🚀 Démarrage Rapide

### 1. Commencer par les Congés (Cette semaine)

```bash
# Créer la branche
git checkout -b feature/hr-leaves-frontend

# Lancer le dev
cd bms-web
npm run dev

# Créer les composants
mkdir -p src/components/hr
touch src/components/hr/LeaveRequestCard.tsx
touch src/components/hr/LeaveStatusBadge.tsx
touch src/components/hr/LeaveApprovalFlow.tsx
```

### 2. Structure des Composants

```typescript
// LeaveRequestCard.tsx - Carte de demande
// LeaveStatusBadge.tsx - Badge de statut
// LeaveApprovalFlow.tsx - Workflow visuel
// LeaveCalendar.tsx - Calendrier
// LeaveBalanceCard.tsx - Solde de congés
```

### 3. API Endpoints Disponibles

```
GET    /api/v1/hr/leaves?companyId={id}
POST   /api/v1/hr/leaves
GET    /api/v1/hr/leaves/{id}
PATCH  /api/v1/hr/leaves/{id}
POST   /api/v1/hr/leaves/{id}/submit
POST   /api/v1/hr/leaves/{id}/approve
POST   /api/v1/hr/leaves/{id}/reject
POST   /api/v1/hr/leaves/{id}/cancel
GET    /api/v1/hr/leaves/balance?companyId={id}&employeeId={id}
```

---

## 📊 Métriques de Succès

### Technique
- Temps de réponse API < 200ms
- Couverture de tests > 80%
- Zero bugs critiques
- Uptime > 99.9%

### Utilisateur
- Temps de création de demande < 2 min
- Taux d'approbation automatique > 70%
- Satisfaction utilisateur > 4.5/5
- Adoption > 90% des employés

### Business
- Réduction du temps de traitement de 50%
- Économie de 10h/semaine pour les RH
- Zéro erreur de calcul de soldes
- Conformité légale 100%

---

## 🎓 Ressources

### Documentation Technique
- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- TypeORM: https://typeorm.io
- Tailwind CSS: https://tailwindcss.com

### Outils
- Swagger UI: http://localhost:3001/api/docs
- Database: pgAdmin ou DBeaver
- API Testing: Postman
- E2E Testing: Cypress

---

**Prêt à démarrer ? Commençons par le module Congés ! 🚀**
