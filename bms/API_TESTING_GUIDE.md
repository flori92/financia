# 🧪 Guide de Test API - Accounting & Payments

## 🚀 Démarrage

```bash
cd /Users/floriace/MERP/bms/api-gateway
npm install
npm run start:dev
```

API disponible sur: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api`

---

## 📊 Tests Accounting Module

### 1. Créer un compte
```bash
curl -X POST http://localhost:3000/api/v1/accounting/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "411",
    "accountName": "Clients",
    "accountType": "asset",
    "syscohadaClass": 4,
    "companyId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 2. Créer une écriture comptable
```bash
curl -X POST http://localhost:3000/api/v1/accounting/journal-entries \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2025-10-15",
    "description": "Vente client ACME",
    "journalType": "sales",
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "createdBy": "550e8400-e29b-41d4-a716-446655440001",
    "lines": [
      {"accountId": "ACCOUNT_ID_1", "label": "Clients", "debit": 100000, "credit": 0},
      {"accountId": "ACCOUNT_ID_2", "label": "Ventes", "debit": 0, "credit": 100000}
    ]
  }'
```

### 3. Générer le Bilan
```bash
curl "http://localhost:3000/api/v1/accounting/reports/balance-sheet?companyId=550e8400-e29b-41d4-a716-446655440000&date=2025-10-15"
```

---

## 💰 Tests Payments Module

### 1. Créer un paiement
```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "paymentDate": "2025-10-15",
    "amount": 100000,
    "paymentMethod": "mobile_money",
    "partyType": "customer",
    "partyId": "550e8400-e29b-41d4-a716-446655440002",
    "companyId": "550e8400-e29b-41d4-a716-446655440000",
    "createdBy": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### 2. Allouer un paiement
```bash
curl -X POST http://localhost:3000/api/v1/payments/PAYMENT_ID/allocate \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 50000
  }'
```

### 3. Récapitulatif
```bash
curl "http://localhost:3000/api/v1/payments/summary?companyId=550e8400-e29b-41d4-a716-446655440000&startDate=2025-01-01&endDate=2025-12-31"
```

---

## 🧪 Lancer les tests unitaires

```bash
npm run test
npm run test:cov  # Avec coverage
```
