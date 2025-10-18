# 🔐 Accès Serveurs BMS - Identifiants et URLs

**Date** : 18 Octobre 2025, 08h45  
**Status** : ✅ Serveurs Démarrés

---

## 🚀 Serveurs en Ligne

### Backend API
```
URL : http://localhost:3001
Swagger UI : http://localhost:3001/api/docs
Status : ✅ Running
```

### Frontend Web
```
URL : http://localhost:3000
Status : ✅ Running
```

---

## 👤 Identifiants de Test

### Compte Démo Comptable

```
📧 Email : comptable@demo.bms
🔑 Mot de passe : Demo2025!
👤 Rôle : Expert-Comptable
🏢 Société : BMS Demo SARL
```

**Accès** :
1. Ouvrez http://localhost:3000
2. Cliquez sur "Se connecter"
3. Utilisez les identifiants ci-dessus
4. Vous serez redirigé vers le Dashboard Comptable

---

### Compte Démo Administrateur

```
📧 Email : admin@demo.bms
🔑 Mot de passe : Admin2025!
👤 Rôle : Administrateur
🏢 Société : BMS Demo SARL
```

**Accès** :
- Dashboard : http://localhost:3000
- Paramètres : http://localhost:3000/settings

---

## 📍 URLs des Pages Principales

### 💼 Module Comptabilité

| Page | URL |
|------|-----|
| **Dashboard Comptable** | http://localhost:3000/accountant |
| Plan Comptable SYSCOHADA | http://localhost:3000/accountant/chart-of-accounts |
| Journal des Écritures | http://localhost:3000/accountant/journal |
| Grand Livre | http://localhost:3000/accountant/general-ledger |
| Balance de Vérification | http://localhost:3000/accountant/trial-balance |
| Compte de Résultat | http://localhost:3000/accountant/profit-loss |
| Bilan | http://localhost:3000/accountant/balance-sheet |
| Balance Âgée | http://localhost:3000/accountant/aged-balance |
| Rapprochement Bancaire | http://localhost:3000/accountant/bank |
| Déclaration TVA | http://localhost:3000/accountant/tax/vat |
| Clôture de Période | http://localhost:3000/accountant/close |

### 💰 Module Trésorerie

| Page | URL |
|------|-----|
| **Trésorerie** | http://localhost:3000/treasury |

**Onglets disponibles** :
- Aperçu (KPI, graphiques)
- Transactions
- Rapprochement
- Comptes Bancaires
- Flux de Trésorerie

### 📊 Autres Modules

| Page | URL |
|------|-----|
| Factures Clients | http://localhost:3000/invoices |
| Transactions | http://localhost:3000/transactions |
| Analyse Financière | http://localhost:3000/financial-analysis |
| Formalisation NIF | http://localhost:3000/formalization |
| Paramètres | http://localhost:3000/settings |

---

## 🔧 API Backend - Endpoints Principaux

### Swagger UI Interactive
```
📚 Documentation : http://localhost:3001/api/docs
```

Vous pouvez tester tous les endpoints directement depuis Swagger !

### Endpoints Clés

#### Comptabilité
```
GET  /api/v1/accounting/accounts?companyId={uuid}
POST /api/v1/accounting/accounts
GET  /api/v1/accounting/entries?companyId={uuid}
POST /api/v1/accounting/entries
GET  /api/v1/accounting/dashboard/metrics?companyId={uuid}
GET  /api/v1/accounting/trial-balance?companyId={uuid}
GET  /api/v1/accounting/profit-loss?companyId={uuid}
GET  /api/v1/accounting/balance-sheet?companyId={uuid}
```

#### Banque
```
GET  /api/v1/banking/accounts?companyId={uuid}
POST /api/v1/banking/accounts
GET  /api/v1/banking/transactions?companyId={uuid}
POST /api/v1/banking/import
```

#### TVA
```
GET  /api/v1/tax/vat/return?companyId={uuid}&startDate=2025-01-01&endDate=2025-12-31
GET  /api/v1/tax/vat/export?companyId={uuid}&startDate=2025-01-01&endDate=2025-12-31
```

---

## 🗄️ Database

### PostgreSQL

```
Host : localhost
Port : 5432
Database : bms_db
Username : postgres
Password : [Votre mot de passe]
```

**Connexion** :
```bash
psql -h localhost -p 5432 -U postgres -d bms_db
```

---

## 🎯 Démarrage Rapide (Si besoin de redémarrer)

### Backend
```bash
cd bms/api-gateway
npm run start:dev
```

### Frontend
```bash
cd bms-web
npm run dev
```

---

## 📋 Initialisation des Données de Test

### 1. Créer une Société de Test

Via Swagger UI : http://localhost:3001/api/docs

```
POST /api/v1/companies
{
  "name": "Ma Société Test",
  "country": "Bénin",
  "currency": "XOF",
  "vatRate": 18
}
```

**Copiez le `companyId` retourné !**

### 2. Initialiser le Plan Comptable SYSCOHADA

```
POST /api/v1/accounting/seed-syscohada?companyId={VOTRE_COMPANY_ID}
```

Cela créera automatiquement 55+ comptes SYSCOHADA.

### 3. Configurer le localStorage (Frontend)

Ouvrez la console du navigateur (F12) sur http://localhost:3000 :

```javascript
localStorage.setItem('companyId', 'VOTRE_COMPANY_ID');
localStorage.setItem('userId', 'demo-user-id');
location.reload();
```

### 4. Créer des Écritures de Test

Via l'interface : http://localhost:3000/accountant/journal

Ou via API :
```
POST /api/v1/accounting/auto/sale
{
  "companyId": "VOTRE_COMPANY_ID",
  "entryDate": "2025-10-18",
  "customerName": "Client ABC",
  "amountExclTax": 500000,
  "taxRate": 18,
  "serviceType": "services"
}
```

---

## 🎨 Comptes de Démonstration Pré-configurés

Si vous avez suivi le seed initial, ces comptes sont disponibles :

### Classe 1 - Capitaux
- **101** - Capital
- **106** - Réserves

### Classe 4 - Tiers
- **411** - Clients
- **401** - Fournisseurs
- **4456** - TVA déductible
- **4457** - TVA collectée

### Classe 5 - Trésorerie
- **512** - Banque
- **531** - Caisse

### Classe 6 - Charges
- **607** - Achats de marchandises

### Classe 7 - Produits
- **706** - Prestations de services
- **707** - Ventes de marchandises

---

## 🔍 Vérification du Système

### Health Check Backend
```bash
curl http://localhost:3001/api/v1/health
```

### Test API
```bash
# Récupérer tous les comptes (remplacez {companyId})
curl http://localhost:3001/api/v1/accounting/accounts?companyId={VOTRE_ID}
```

### Logs Backend
Les logs sont affichés dans le terminal où vous avez lancé `npm run start:dev`

### Logs Frontend
Ouvrez la console du navigateur (F12)

---

## 📱 Navigation Rapide

### Sidebar (Après connexion)

**Section Entrepreneur** :
- Tableau de bord
- Factures Clients
- Trésorerie
- Transactions
- Formalisation & NIF
- Paramètres

**Section Comptable** :
- Dashboard Comptable ✨
- Centre de Validation
- Plan Comptable SYSCOHADA
- Journal des Écritures
- Grand Livre
- Balance Âgée
- Balance de Vérification
- Compte de Résultat
- Bilan
- Rapprochement Bancaire
- Déclaration TVA
- Clôture de Période

---

## 🛠️ Outils de Développement

### Swagger UI (Tester l'API)
```
http://localhost:3001/api/docs
```

**Features** :
- Tester tous les endpoints
- Voir les schémas de données
- Générer des exemples de requêtes

### Redux DevTools (Debugging Frontend)
Installez l'extension Chrome si besoin

### Database Client
Utilisez **pgAdmin** ou **DBeaver** pour explorer la base de données

---

## 📞 Problèmes Courants

### Backend ne démarre pas
```bash
# Vérifier si le port 3001 est libre
lsof -i :3001

# Redémarrer
cd bms/api-gateway
npm install
npm run start:dev
```

### Frontend ne démarre pas
```bash
# Vérifier si le port 3000 est libre
lsof -i :3000

# Redémarrer
cd bms-web
npm install
npm run dev
```

### Erreur de connexion Database
```bash
# Vérifier que PostgreSQL est démarré
brew services list

# Démarrer PostgreSQL
brew services start postgresql@14
```

### CORS Error
Vérifiez que `NEXT_PUBLIC_API_URL` dans `.env.local` pointe vers `http://localhost:3001`

---

## 🎉 Profitez du BMS !

Tous les modules sont **opérationnels** et prêts à l'emploi.

**Bon test !** 🚀

---

_Document généré automatiquement - Version 1.0.0_  
_Dernière mise à jour : 18 Octobre 2025, 08h45_
