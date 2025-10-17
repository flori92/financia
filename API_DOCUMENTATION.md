# 📘 Documentation API BMS - Business Management System

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000`  
**Swagger UI**: `http://localhost:3000/api`  
**Date**: 17 Octobre 2025

---

## 🔐 Authentification

Toutes les routes sont protégées par JWT (à activer via `@UseGuards(JwtAuthGuard)`).

```http
Authorization: Bearer {token}
```

---

## 📦 Modules Disponibles

1. [Comptabilité (Accounting)](#comptabilité)
2. [Banque (Banking)](#banque)
3. [Trésorerie (Treasury)](#trésorerie)
4. [Fiscalité (Tax)](#fiscalité)
5. [Clôture (Accounting Closure)](#clôture)

---

## 💼 Comptabilité

### Plan Comptable

#### `GET /api/v1/accounting/accounts`
Récupère tous les comptes comptables SYSCOHADA.

**Query Parameters**:
- `companyId` (required): UUID de la société

**Response 200**:
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "accountNumber": "411",
    "accountName": "Clients",
    "accountType": "asset",
    "balance": 150000.00,
    "isActive": true
  }
]
```

---

#### `POST /api/v1/accounting/accounts`
Créer un nouveau compte comptable.

**Body**:
```json
{
  "companyId": "uuid",
  "accountNumber": "445721",
  "accountName": "TVA Collectée",
  "accountType": "liability"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "accountNumber": "445721",
  "accountName": "TVA Collectée",
  "accountType": "liability",
  "balance": 0,
  "isActive": true
}
```

---

### Journal des Écritures

#### `POST /api/v1/accounting/entries`
Créer une écriture comptable (partie double).

**Body**:
```json
{
  "companyId": "uuid",
  "entryDate": "2025-10-17",
  "description": "Vente client ABC",
  "journalType": "sales",
  "lines": [
    {
      "accountId": "uuid",
      "label": "Facture client ABC",
      "debit": 590000,
      "credit": 0
    },
    {
      "accountId": "uuid2",
      "label": "Vente marchandises",
      "debit": 0,
      "credit": 500000
    },
    {
      "accountId": "uuid3",
      "label": "TVA collectée 18%",
      "debit": 0,
      "credit": 90000
    }
  ]
}
```

**Validation**:
- ✅ Total Débit = Total Crédit (partie double stricte)
- ✅ Date non clôturée
- ✅ Minimum 2 lignes

**Response 201**: Écriture créée avec `status: 'draft'`

---

#### `GET /api/v1/accounting/entries`
Liste des écritures comptables.

**Query Parameters**:
- `companyId` (required)
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `status` (optional): `draft | posted | cancelled`

---

#### `PATCH /api/v1/accounting/entries/:id/post`
Valider une écriture (passer de draft à posted).

---

### États Comptables

#### `GET /api/v1/accounting/trial-balance`
Balance de vérification.

**Query Parameters**:
- `companyId` (required)
- `startDate` (optional)
- `endDate` (optional)

**Response 200**:
```json
{
  "accounts": [
    {
      "accountNumber": "411",
      "accountName": "Clients",
      "totalDebit": 500000,
      "totalCredit": 200000,
      "balance": 300000
    }
  ],
  "totals": {
    "debit": 5000000,
    "credit": 5000000
  }
}
```

---

#### `GET /api/v1/accounting/profit-loss`
Compte de résultat (Produits - Charges).

**Response 200**:
```json
{
  "revenue": [
    { "accountNumber": "707", "accountName": "Ventes", "amount": 5000000 }
  ],
  "expenses": [
    { "accountNumber": "607", "accountName": "Achats", "amount": 3000000 }
  ],
  "totalRevenue": 5000000,
  "totalExpenses": 3000000,
  "netIncome": 2000000
}
```

---

#### `GET /api/v1/accounting/balance-sheet`
Bilan (Actif / Passif).

**Response 200**:
```json
{
  "assets": {
    "currentAssets": [...],
    "fixedAssets": [...],
    "total": 10000000
  },
  "liabilities": {
    "currentLiabilities": [...],
    "longTermLiabilities": [...],
    "equity": [...],
    "total": 10000000
  }
}
```

---

#### `GET /api/v1/accounting/general-ledger`
Grand Livre avec solde progressif.

**Query Parameters**:
- `companyId` (required)
- `accountNumber` (optional): Filtrer par compte
- `startDate` (optional)
- `endDate` (optional)

**Response 200**:
```json
{
  "account": {
    "number": "411",
    "name": "Clients",
    "type": "asset"
  },
  "movements": [
    {
      "date": "2025-10-17",
      "entryNumber": "JNL-2025-001",
      "description": "Facture client ABC",
      "reference": "FINV-2025-003",
      "debit": 590000,
      "credit": 0,
      "balance": 590000
    }
  ],
  "summary": {
    "totalDebit": 590000,
    "totalCredit": 0,
    "finalBalance": 590000
  }
}
```

---

#### `GET /api/v1/accounting/aged-balance`
Balance âgée des créances/dettes par ancienneté.

**Query Parameters**:
- `companyId` (required)
- `type` (required): `receivables | payables`
- `asOfDate` (optional): YYYY-MM-DD (default: aujourd'hui)

**Response 200**:
```json
{
  "type": "receivables",
  "asOfDate": "2025-10-17",
  "items": [
    {
      "party": "ABC Corporation",
      "total": 250000,
      "current": 100000,
      "days30_60": 80000,
      "days60_90": 50000,
      "over90": 20000,
      "oldestDate": "2025-05-15"
    }
  ],
  "totals": {
    "total": 1250000,
    "current": 600000,
    "days30_60": 350000,
    "days60_90": 200000,
    "over90": 100000
  }
}
```

---

### Dashboard Comptable

#### `GET /api/v1/accounting/dashboard/metrics`
Métriques complètes du dashboard.

**Query Parameters**:
- `companyId` (required)

**Response 200**:
```json
{
  "kpiMonth": {
    "revenue": 5000000,
    "expenses": 3200000,
    "netIncome": 1800000,
    "margin": 36
  },
  "evolutionChart": [
    { "month": "oct. 25", "revenue": 5000000, "expenses": 3200000 }
  ],
  "topClients": [
    { "name": "ABC Corp", "amount": 2500000 }
  ],
  "topSuppliers": [
    { "name": "Supplier A", "amount": 1200000 }
  ],
  "financialRatios": {
    "liquidityRatio": 1.875,
    "solvencyRatio": 0.833
  },
  "alerts": [
    {
      "type": "info",
      "title": "Situation saine",
      "message": "Aucune alerte comptable détectée"
    }
  ],
  "recentActivity": {
    "entries": [...]
  }
}
```

---

### Automatisation

#### `POST /api/v1/accounting/auto/sale`
Générer automatiquement une écriture de vente.

**Body**:
```json
{
  "companyId": "uuid",
  "entryDate": "2025-10-17",
  "customerName": "ABC Corporation",
  "amountExclTax": 500000,
  "taxRate": 18,
  "serviceType": "services"
}
```

**Génération automatique**:
- Débit 411 Clients (590000)
- Crédit 706/707 Ventes (500000)
- Crédit 4457 TVA Collectée (90000)

---

## 🏦 Banque

### Comptes Bancaires

#### `GET /api/v1/banking/accounts`
Liste des comptes bancaires avec soldes calculés.

**Query Parameters**:
- `companyId` (required)

**Response 200**:
```json
[
  {
    "id": "uuid",
    "name": "Compte Courant Ecobank",
    "accountNumber": "BJ0123456789",
    "iban": "BJ12ECOBANK0123456789",
    "bankName": "Ecobank Bénin",
    "currency": "XOF",
    "openingBalance": 1000000,
    "currentBalance": 2500000,
    "lastTransactionDate": "2025-10-15",
    "isActive": true,
    "transactionCount": 45
  }
]
```

---

#### `POST /api/v1/banking/accounts`
Créer un compte bancaire.

**Body**:
```json
{
  "companyId": "uuid",
  "name": "Compte Courant Ecobank",
  "accountNumber": "BJ0123456789",
  "iban": "BJ12ECOBANK0123456789",
  "bic": "ECOCBJBJXXX",
  "bankName": "Ecobank Bénin",
  "currency": "XOF",
  "openingBalance": 1000000
}
```

---

### Rapprochement Bancaire

#### `POST /api/v1/banking/import`
Importer des transactions depuis un CSV.

**Body**:
```json
{
  "companyId": "uuid",
  "csvContent": "Date;Montant;Libellé;Référence\n17/10/2025;250000;Virement client ABC;VIR20251017"
}
```

**Format CSV supporté**:
- Colonnes requises: Date, Montant, Libellé
- Colonnes optionnelles: Référence
- Séparateurs: `;` ou `,`

---

#### `GET /api/v1/banking/transactions/:id/suggest`
Suggestions de rapprochement automatique.

**Matching**:
- Montant ±5%
- Date ±7 jours

---

#### `POST /api/v1/banking/reconcile`
Rapprocher une transaction avec un paiement.

**Body**:
```json
{
  "bankTransactionId": "uuid",
  "paymentId": "uuid",
  "userId": "uuid"
}
```

---

## 💰 Trésorerie

#### `GET /api/v1/treasury/summary`
Résumé trésorerie.

**Query Parameters**:
- `companyId` (required)
- `startDate` (optional)
- `endDate` (optional)

**Response 200**:
```json
{
  "totalIn": 5000000,
  "totalOut": 3200000,
  "netCashFlow": 1800000,
  "bankBalance": 2500000
}
```

---

#### `GET /api/v1/treasury/forecast`
Prévisions de trésorerie.

**Query Parameters**:
- `companyId` (required)
- `horizonDays` (default: 30)

**Response 200**:
```json
{
  "currentBalance": 2500000,
  "forecastedBalance": 3200000,
  "expectedInflows": 1500000,
  "expectedOutflows": 800000
}
```

---

## 💸 Fiscalité

#### `GET /api/v1/tax/vat/return`
Calcul déclaration TVA.

**Query Parameters**:
- `companyId` (required)
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

**Response 200**:
```json
{
  "period": { "start": "2025-10-01", "end": "2025-10-31" },
  "revenue": 5000000,
  "expenses": 3000000,
  "vatCollected": 900000,
  "vatDeductible": 540000,
  "vatNet": 360000
}
```

---

#### `GET /api/v1/tax/vat/export`
Export CSV pour DGI.

**Response**: Fichier CSV avec en-têtes DGI Bénin.

---

## 🔒 Clôture

#### `GET /api/v1/accounting/close/preview`
Aperçu avant clôture.

**Query Parameters**:
- `companyId` (required)
- `startDate` (required)
- `endDate` (required)

**Response 200**:
```json
{
  "totalRevenues": 5000000,
  "totalExpenses": 3000000,
  "resultAmount": 2000000,
  "canClose": true
}
```

---

#### `POST /api/v1/accounting/close`
Clôturer une période (irréversible).

**Body**:
```json
{
  "companyId": "uuid",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "closedBy": "uuid"
}
```

**Actions automatiques**:
1. Calcul résultat (Produits - Charges)
2. Génération OD de clôture
3. Transfert résultat → Compte 120
4. Verrouillage période (plus d'écritures possibles)
5. Status → `closed`

---

## 📊 Codes de Statut

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Bad Request (données invalides) |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 500 | Erreur serveur |

---

## ⚠️ Règles de Validation

### Partie Double
```
Total Débit = Total Crédit (strict)
```

### Dates Clôturées
```
Si période clôturée → BadRequestException
```

### Comptes SYSCOHADA
```
Classes 1-8 respectées
Validation numérotation
```

---

## 🚀 Démarrage Rapide

### 1. Seed Plan Comptable
```http
POST /api/v1/accounting/seed-syscohada?companyId={uuid}
```

### 2. Créer une Écriture
```http
POST /api/v1/accounting/entries
Content-Type: application/json

{
  "companyId": "uuid",
  "entryDate": "2025-10-17",
  "description": "Test",
  "journalType": "general",
  "lines": [...]
}
```

### 3. Consulter le Dashboard
```http
GET /api/v1/accounting/dashboard/metrics?companyId={uuid}
```

---

## 📝 Notes

- **Monnaie**: XOF (Franc CFA)
- **Format dates**: YYYY-MM-DD (ISO 8601)
- **Timezone**: UTC+01:00 (WAT - West Africa Time)
- **Norme comptable**: SYSCOHADA Révisé 2017
- **TVA Bénin**: 18%

---

_Documentation générée automatiquement - Version 1.0.0_  
_Pour plus de détails, consultez Swagger UI: http://localhost:3000/api_
