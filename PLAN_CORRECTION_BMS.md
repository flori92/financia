# Plan de Correction BMS - Élimination des Placeholders

## Phase 1: Rapports Financiers Critiques (PRIORITÉ MAXIMALE)

### 1.1 Balance Sheet (Bilan OHADA)
**Page:** `bms-web/src/app/accountant/balance-sheet/page.tsx`
**Endpoint Backend:** ✅ `/api/v1/accounting/reports/balance-sheet` (EXISTE)
**Action:**
- Remplacer useState mock par apiGet
- Connecter au vrai endpoint
- Ajouter filtres de période
- Gérer loading/error states

**Code à modifier:**
```typescript
// AVANT (mock)
const [assets] = useState([
  { account: "211000", name: "Terrains", value: 50000000 },
  // ...
]);

// APRÈS (real API)
const [balanceSheet, setBalanceSheet] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadBalanceSheet = async () => {
    try {
      const companyId = getCompanyId();
      const data = await apiGet("/api/v1/accounting/reports/balance-sheet", {
        companyId,
        asOfDate: selectedDate
      });
      setBalanceSheet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadBalanceSheet();
}, [selectedDate]);
```

### 1.2 Profit & Loss (Compte de Résultat)
**Page:** `bms-web/src/app/accountant/profit-loss/page.tsx`
**Endpoint Backend:** ✅ `/api/v1/accounting/reports/income-statement` (EXISTE)
**Action:**
- Même approche que Balance Sheet
- Connecter au vrai endpoint
- Ajouter filtres de période

### 1.3 Trial Balance (Balance Générale)
**Page:** `bms-web/src/app/accountant/trial-balance/page.tsx`
**Endpoint Backend:** ✅ `/api/v1/accounting/trial-balance` (EXISTE)
**Action:**
- Remplacer mock data
- Connecter au vrai endpoint
- Ajouter export CSV fonctionnel

### 1.4 Chart of Accounts - Create/Edit
**Page:** `bms-web/src/app/accountant/chart-of-accounts/page.tsx`
**Endpoints Backend:**
- ✅ POST `/api/v1/accounting/accounts` (EXISTE)
- ✅ PUT `/api/v1/accounting/accounts/:id` (EXISTE)

**Action:**
```typescript
// Remplacer simulation par vrai appel
const handleSave = async (formData) => {
  try {
    if (editing) {
      await apiPut(`/api/v1/accounting/accounts/${account.id}`, formData);
    } else {
      await apiPost("/api/v1/accounting/accounts", formData);
    }
    loadAccounts(); // Recharger la liste
    closeModal();
    triggerToast("success", "Compte enregistré avec succès !");
  } catch (err) {
    triggerToast("error", "Erreur lors de l'enregistrement");
  }
};
```

---

## Phase 2: Trésorerie et Sécurité

### 2.1 Treasury Dashboard
**Page:** `bms-web/src/app/treasury/page.tsx`
**Endpoints Backend:**
- ✅ `/api/v1/treasury/dashboard` (EXISTE)
- ✅ `/api/v1/treasury/forecast` (EXISTE)
- ✅ `/api/v1/treasury/alerts` (EXISTE)

**Action:**
- Connecter aux 3 endpoints en parallèle
- Afficher vraies données de comptes bancaires
- Afficher vraies prévisions de trésorerie
- Afficher vraies alertes de seuils

### 2.2 Users Management
**Page:** `bms-web/src/app/settings/users/page.tsx`
**Endpoints Backend:**
- ⚠️ MANQUANT - À créer dans backend
- Besoin: GET /api/v1/users, POST /api/v1/users, PUT /api/v1/users/:id, DELETE /api/v1/users/:id

**Action Backend:**
1. Créer `users.controller.ts`
2. Implémenter CRUD complet
3. Ajouter permissions RBAC

**Action Frontend:**
```typescript
const loadUsers = async () => {
  const data = await apiGet("/api/v1/users", { companyId: getCompanyId() });
  setUsers(data);
};

const handleCreateUser = async (userData) => {
  await apiPost("/api/v1/users", userData);
  loadUsers();
};
```

---

## Phase 3: Opérations

### 3.1 Purchase Orders
**Page:** `bms-web/src/app/purchases/orders/page.tsx`
**Endpoints Backend:**
- ✅ POST `/api/v1/purchases/orders` (EXISTE)
- ⚠️ GET endpoint manquant

**Action:**
- Ajouter GET endpoint dans purchases.controller.ts
- Connecter frontend au backend

### 3.2 Manufacturing Orders
**Page:** `bms-web/src/app/manufacturing/production-orders/page.tsx`
**Endpoints Backend:**
- ✅ Module manufacturing existe avec contrôleur
- ⚠️ Endpoints à vérifier

**Action:**
- Vérifier disponibilité des endpoints
- Connecter frontend

### 3.3 Suppliers (Fix Critical)
**Backend:** `bms/api-gateway/src/purchases/purchases.controller.ts`

**Problème actuel:**
```typescript
private suppliers: any[] = []; // ❌ EN MÉMOIRE - NE PERSISTE PAS
```

**Solution:**
1. Créer `Supplier` entity
2. Créer `SupplierRepository`
3. Remplacer in-memory storage par database
4. Implémenter CRUD complet

---

## Phase 4: Backend - Corrections Critiques

### 4.1 Fix Tax Controller Mock Data
**Fichier:** `bms/api-gateway/src/tax/tax.controller.ts`

**Problème:**
```typescript
// TEMPORARY FIX: Return mock data due to database schema mismatch
console.log('[TVA] Returning mock data - database schema mismatch');
return {
  revenueHT: 12500000, // ❌ HARDCODÉ
  vatCollected: 2500000, // ❌ HARDCODÉ
  // ...
};
```

**Solution:**
1. Fixer le schema mismatch (company_id vs companyId)
2. Implémenter vraie logique de calcul TVA
3. Requêter les vraies données de la DB

### 4.2 Database Migrations
**Problème:** Utilise `synchronize: true` (dangereux)

**Solution:**
```bash
# Générer migration initiale
npm run migration:generate -- -n InitialSchema

# Créer migrations pour futures modifications
npm run migration:create -- -n AddSupplierEntity
```

**Config:**
```typescript
// database.module.ts
synchronize: false, // ✅ Désactiver en production
migrations: ['dist/migrations/*.js'],
migrationsRun: true
```

### 4.3 Fix Schema Mismatch
**Problème:** Incohérence company_id (snake_case) vs companyId (camelCase)

**Solution:**
1. Choisir une convention (recommandé: camelCase pour TypeORM)
2. Ajouter dans toutes les entities:
```typescript
@Column({ name: 'company_id' })
companyId: string;
```

---

## Résumé des Tâches

### Immédiat (Cette semaine)
- [ ] Balance Sheet - Connecter à l'API
- [ ] Profit & Loss - Connecter à l'API
- [ ] Trial Balance - Connecter à l'API
- [ ] Chart of Accounts - Fix Create/Edit
- [ ] Treasury Dashboard - Connecter à l'API

### Court terme (Semaine prochaine)
- [ ] Users Management - Créer backend + connecter frontend
- [ ] Suppliers - Créer entity + migrer de mémoire vers DB
- [ ] Tax Controller - Remplacer mock par vraies données
- [ ] Database Migrations - Mettre en place

### Moyen terme
- [ ] Purchase Orders - Compléter intégration
- [ ] Manufacturing - Connecter frontend
- [ ] Corrections diverses (TODOs)

---

## Métriques de Succès

**Avant:**
- 35 pages avec mock data
- 10% des endpoints mockés
- 0 migrations DB

**Après (Objectif):**
- 0 page avec mock data
- 0% endpoints mockés
- Migrations DB complètes
- 100% des features critiques fonctionnelles

---

**Estimé:** 2-3 semaines pour Phase 1-3
**Complexité:** Moyenne (la plupart des endpoints backend existent déjà)
**Impact:** TRÈS ÉLEVÉ (transformation d'un prototype en produit production-ready)
