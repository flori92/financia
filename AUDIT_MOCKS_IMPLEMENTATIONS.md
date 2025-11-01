# 🔍 Audit Complet - Données Mockées → Vraies Implémentations

**Date :** 1 novembre 2025  
**Statut :** Audit et plan d'action  
**Objectif :** Remplacer toutes les données mockées par de vraies implémentations fonctionnelles

---

## 📊 Vue d'Ensemble

### **Statistiques Actuelles**

| Zone | Fichiers avec Mocks | Criticité | Priorité |
|------|---------------------|-----------|----------|
| **Backend Services** | 8 fichiers | 🔴 Haute | P0 |
| **Frontend Pages** | 6 fichiers | 🟡 Moyenne | P1 |
| **Tests** | ~10 fichiers | 🟢 Basse | P2 |

---

## 🔴 **PRIORITÉ 0 - Backend Services (Critical)**

### **1. Trésorerie (`cash-flow-forecast.service.ts`)**

**Mocks détectés :**
```typescript
❌ getCurrentBalance() → return 5000000; // Mock
❌ getInvoicesDueOn() → return []; // Mock
❌ getRecurringRevenue() → return 0; // Mock
❌ getBillsDueOn() → return []; // Mock
❌ getFixedCosts() → return 0; // Mock
❌ getDirectDebits() → return 0; // Mock
```

**✅ Solution à implémenter :**
- [ ] Connecter à `AccountingService` pour balance
- [ ] Query TypeORM sur table `invoices` pour factures échues
- [ ] Query sur `recurring_revenues` table
- [ ] Query sur `bills` table pour fournisseurs
- [ ] Query sur `fixed_costs` config table
- [ ] Query sur `direct_debits` schedule table

**Impact :** Prévisions de trésorerie = 100% précises

---

### **2. Lettrage (`lettrage.service.ts`)**

**Mocks détectés :**
```typescript
❌ getUnreconciledLines() → return []; // Mock
❌ getLinesByReconciliationKey() → return []; // Mock
❌ updateLine() → // Mock
❌ logAudit() → // Mock
```

**✅ Solution à implémenter :**
- [ ] Query sur `journal_entries` avec `reconciled = false`
- [ ] Query avec `reconciliation_key` filter
- [ ] UPDATE sur table `journal_entries`
- [ ] INSERT dans table `audit_logs`

**Impact :** Rapprochements bancaires automatiques

---

### **3. TVA (`vat.service.ts`)**

**Mocks détectés :**
```typescript
❌ signDeclaration(xml) → return xml; // Mock (pas de signature)
❌ sendToDGFIP(xml) → // Simulation
```

**✅ Solution à implémenter :**
- [ ] Implémenter signature numérique (certificat)
- [ ] API DGFIP réelle (credentials prod)
- [ ] Gestion retry et logs transmission
- [ ] Stockage références DGI

**Impact :** Télédéclarations TVA réelles

---

### **4. NIF Bénin (`nif.service.ts`)**

**Mocks détectés :**
```typescript
❌ callDGIApi() → Simulation retour DGI
```

**✅ Solution à implémenter :**
- [ ] Intégration API DGI Bénin (credentials)
- [ ] Mapping réponses DGI
- [ ] Cache résultats NIF validés
- [ ] Gestion erreurs API

**Impact :** Validation NIF réelle avec DGI

---

### **5. DGFIP Transmission (`dgfip.service.ts`)**

**Mocks détectés :**
```typescript
❌ transmitCA3() → Simulation télétransmission
```

**✅ Solution à implémenter :**
- [ ] EDI-TDFC (protocole DGFIP)
- [ ] Certificats qualifiés
- [ ] Parser retours AR (Accusé Réception)
- [ ] Archivage légal

**Impact :** Déclarations fiscales officielles

---

### **6. Campagnes CRM (`campaign.service.ts`)**

**Mocks détectés :**
```typescript
❌ sendMessage() → console.log (simulation)
```

**✅ Solution à implémenter :**
- [ ] Intégrer SMTP (SendGrid/Mailgun)
- [ ] Templates emails (Handlebars)
- [ ] Tracking ouvertures/clics
- [ ] Gestion unsubscribe

**Impact :** Emails marketing réels

---

### **7. OCR Controller (`ai.controller.ts`)**

**Mocks détectés :**
```typescript
❌ message: 'Service OCR opérationnel (mode simulation)'
```

**✅ Solution à implémenter :**
- [x] **FAIT** - Tesseract.js implémenté
- [x] **FAIT** - Extraction réelle factures/reçus
- [ ] Améliorer précision avec preprocessing
- [ ] Cache OCR results

**Impact :** ✅ DÉJÀ RÉSOLU (Tesseract.js)

---

### **8. Banking API (`bank-api.service.ts`)**

**Mocks détectés :**
- Tests uniquement (pas de mocks dans service réel)

**✅ OK - Pas d'action nécessaire**

---

## 🟡 **PRIORITÉ 1 - Frontend (Moderate)**

### **1. Budget (`/budget/page.tsx`)**

**Mocks détectés :**
```typescript
❌ handleRevisionSubmit() → Toast "simulation"
❌ handleNewBudgetSubmit() → Toast "simulation"
```

**✅ Solution à implémenter :**
- [ ] POST `/api/v1/budget/revisions`
- [ ] POST `/api/v1/budget/new`
- [ ] Calculs automatiques variances
- [ ] Graphiques évolution

**Impact :** Gestion budgétaire fonctionnelle

---

### **2. Balance de Vérification (`/trial-balance/page.tsx`)**

**Mocks détectés :**
```typescript
❌ Export XLS → Toast "simulation"
```

**✅ Solution à implémenter :**
- [ ] GET `/api/v1/accounting/export/trial-balance` (déjà créé)
- [ ] Format Excel avec formules
- [ ] Onglets multiples (détail/synthèse)

**Impact :** Exports Excel fonctionnels

---

### **3. Plan Comptable (`/chart-of-accounts/page.tsx`)**

**Mocks détectés :**
```typescript
❌ handleExport() → Toast "simulation"
```

**✅ Solution à implémenter :**
- [ ] Utiliser endpoint export existant
- [ ] Format SYSCOHADA complet
- [ ] Hiérarchie classes/comptes

**Impact :** Export plan comptable complet

---

### **4. Journal Comptable - Modal OCR (`/journal/page.tsx`)**

**Mocks détectés :**
```typescript
❌ Modal OCR → Toast "simulation"
```

**✅ Solution à implémenter :**
- [x] **FAIT** - Remplacé par lien vers page OCR dédiée
- [x] **FAIT** - Extraction réelle Tesseract.js

**Impact :** ✅ DÉJÀ RÉSOLU

---

### **5. TVA Page (`/tax/vat/page.tsx`)**

**Mocks détectés :**
```typescript
❌ handleRecalculate() → Toast "simulation"
❌ Export FEC → Toast "simulation"
❌ PDF CA3 → Toast "simulation"
```

**✅ Solution à implémenter :**
- [ ] POST `/api/v1/tax/vat/recalculate`
- [ ] GET `/api/v1/tax/export/fec`
- [ ] GET `/api/v1/tax/generate-ca3-pdf`

**Impact :** Gestion TVA complète

---

### **6. Déclarations Fiscales (`/tax/declarations/page.tsx`)**

**Mocks détectés :**
```typescript
❌ Step 3: "Simulation & calcul automatique"
❌ "Simulation du montant TVA"
```

**✅ Solution à implémenter :**
- [ ] Wizard multi-steps avec vraies données
- [ ] Calculs automatiques TVA
- [ ] Validation pré-transmission
- [ ] Intégration DGFIP

**Impact :** Workflow déclarations complet

---

## 🟢 **PRIORITÉ 2 - Améliorations (Low)**

### **1. Tests Unitaires**

- Tests avec mocks sont OK (c'est le principe des tests)
- Pas d'action nécessaire

---

## 📋 **Plan d'Action Global**

### **Phase 1 - Services Critiques (Semaine 1)**

| Service | Temps Estimé | Complexité |
|---------|--------------|------------|
| Trésorerie | 4h | Moyenne |
| Lettrage | 3h | Moyenne |
| TVA Signature | 6h | Haute |

**Total : 13h**

---

### **Phase 2 - Intégrations Externes (Semaine 2)**

| Service | Temps Estimé | Complexité |
|---------|--------------|------------|
| DGI Bénin API | 6h | Haute |
| DGFIP EDI-TDFC | 8h | Très haute |
| CRM Emails | 4h | Faible |

**Total : 18h**

---

### **Phase 3 - Frontend Pages (Semaine 3)**

| Page | Temps Estimé | Complexité |
|------|--------------|------------|
| Budget | 3h | Faible |
| Exports Excel | 2h | Faible |
| TVA Recalcul | 4h | Moyenne |
| Déclarations | 6h | Moyenne |

**Total : 15h**

---

## 🎯 **Ordre d'Implémentation Recommandé**

### **Jour 1-2 : Trésorerie + Lettrage**
1. ✅ Implémenter `getCurrentBalance()` avec query DB
2. ✅ Implémenter `getInvoicesDueOn()` avec TypeORM
3. ✅ Implémenter méthodes lettrage avec queries
4. ✅ Tester avec vraies données

### **Jour 3-4 : Exports et Budgets**
1. ✅ Finaliser exports Excel (Trial Balance, Plan)
2. ✅ Implémenter endpoints budget
3. ✅ Connecter frontend budget
4. ✅ Tests E2E

### **Jour 5-7 : TVA et Fiscalité**
1. ✅ Implémenter recalcul TVA automatique
2. ✅ Export FEC conforme
3. ✅ Génération PDF CA3
4. ✅ Préparer intégration DGFIP (credentials)

### **Jour 8-10 : Intégrations Externes**
1. ⚠️ DGI Bénin (nécessite credentials API)
2. ⚠️ DGFIP (nécessite certificats qualifiés)
3. ✅ CRM Emails (SendGrid/Mailgun)
4. ✅ Tests intégration

---

## 🚀 **Quick Wins (Rapides)**

Ces implémentations peuvent être faites **immédiatement** :

1. **Exports Excel** (2h)
   - Utiliser endpoints existants
   - Format XLSX avec `xlsx` npm package

2. **Budget Frontend** (3h)
   - POST vers endpoints backend
   - Retirer messages "simulation"

3. **Lettrage Queries** (3h)
   - Simple queries TypeORM
   - Pas de complexité externe

---

## 🛑 **Bloquants Identifiés**

### **1. Credentials DGI Bénin**
- ❌ Besoin API key DGI
- ❌ Documentation API
- ⏳ En attente accès production

### **2. Certificats DGFIP**
- ❌ Certificat qualifié requis
- ❌ Procédure longue (2-3 semaines)
- ⏳ À commander auprès autorité

### **3. SMTP Production**
- ⚠️ Nécessite compte SendGrid/Mailgun
- ✅ Facile à obtenir (même jour)

---

## 📊 **Métriques de Progression**

| Zone | Mocks Initiaux | Mocks Résolus | % Progression |
|------|----------------|---------------|---------------|
| Backend | 8 | 1 (OCR) | 12.5% |
| Frontend | 6 | 1 (OCR) | 16.7% |
| **TOTAL** | **14** | **2** | **14.3%** |

**Objectif :** 100% en 2-3 semaines

---

## 💡 **Recommandations**

### **Immédiat (Cette Semaine)**
1. ✅ Implémenter Trésorerie (4h)
2. ✅ Implémenter Lettrage (3h)
3. ✅ Exports Excel (2h)

### **Court Terme (Semaine Prochaine)**
1. ✅ Budget frontend + backend (5h)
2. ✅ TVA recalcul automatique (4h)
3. ✅ CRM Emails (4h)

### **Moyen Terme (Semaines 3-4)**
1. ⏳ Obtenir credentials DGI
2. ⏳ Commander certificat DGFIP
3. ✅ Implémenter dès reçus

---

## 🎬 **Next Steps**

**Action immédiate :**
1. Je vais commencer par les **Quick Wins**
2. Implémenter **Trésorerie** en premier
3. Puis **Lettrage**
4. Puis **Exports**

**Validation :**
- Chaque implémentation sera testée
- Commit atomique par fonctionnalité
- Documentation mise à jour

---

**Prêt à démarrer l'implémentation ! 🚀**

*Dernière mise à jour : 1 novembre 2025*
