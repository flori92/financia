# Guide Utilisateur BMS - Business Management System

## 🎯 Comment accéder aux fonctionnalités

### 📊 Dashboard & Vue d'ensemble
- **Dashboard Principal** : http://localhost:3000/
- **Dashboard Comptable** : http://localhost:3000/accountant

### 👥 CRM (Gestion Relation Client)
- **Contacts** : http://localhost:3000/crm/contacts
  - Créer/modifier des contacts
  - Voir l'historique client
  - Gérer les informations de contact
  
- **Opportunités** : http://localhost:3000/crm/opportunities
  - Pipeline de ventes
  - Suivi des opportunités
  - Prévisions de CA

- **Dashboard CRM** : http://localhost:3000/crm/dashboard
  - Vue d'ensemble CRM
  - Statistiques clients
  - Performance commerciale

### 💰 Facturation & Ventes
- **Factures Clients** : http://localhost:3000/invoices
  - Créer des factures
  - Envoyer par email
  - Suivi des paiements
  - Relances automatiques

- **Devis** : http://localhost:3000/quotes
  - Créer des devis
  - Convertir en facture
  - Suivi des acceptations

### 💵 Trésorerie & Finance
- **Trésorerie** : http://localhost:3000/treasury
  - Solde bancaire
  - Prévisions de trésorerie
  - Cash flow

- **Transactions** : http://localhost:3000/transactions
  - Enregistrer paiements
  - Historique des transactions
  - Rapprochement bancaire

### 📈 Budgets & Contrôle de Gestion
- **Budgets** : http://localhost:3000/budget
  - Budget prévisionnel
  - Suivi réalisé vs budget
  - Analyse des écarts

- **Centres de coûts** : http://localhost:3000/budget/cost-centers
  - Gestion des centres de coûts
  - Allocation des charges
  - Rentabilité par centre

### 📊 Comptabilité (Profil Comptable)
- **Plan Comptable** : http://localhost:3000/accountant/chart-of-accounts
- **Journal** : http://localhost:3000/accountant/journal
- **Grand Livre** : http://localhost:3000/accountant/general-ledger
- **Balance Âgée** : http://localhost:3000/accountant/aged-balance
- **Compte de Résultat** : http://localhost:3000/accountant/profit-loss
- **Bilan** : http://localhost:3000/accountant/balance-sheet
- **TVA** : http://localhost:3000/accountant/tax/vat
- **Clôture** : http://localhost:3000/accountant/close

### 🏭 ERP - Production & Stock
- **Production** : http://localhost:3000/manufacturing
  - Ordres de fabrication
  - Nomenclatures (BOM)
  - Planification MRP

- **Stock** : http://localhost:3000/inventory
  - Gestion multi-entrepôts
  - Traçabilité
  - Inventaires

### 👨‍💼 Ressources Humaines
- **Employés** : http://localhost:3000/hr/employees
- **Paie** : http://localhost:3000/hr/payroll
- **Congés** : http://localhost:3000/hr/leaves
- **Notes de frais** : http://localhost:3000/hr/expenses

### 🛒 Achats
- **Fournisseurs** : http://localhost:3000/purchases/suppliers
- **Commandes** : http://localhost:3000/purchases/orders
- **Réceptions** : http://localhost:3000/purchases/receipts

### ⚙️ Paramètres
- **Société** : http://localhost:3000/settings/companies
- **Utilisateurs** : http://localhost:3000/settings/users
- **Configuration** : http://localhost:3000/settings

## 🚀 Fonctionnalités Clés

### Envoyer une Facture
1. Aller sur `/invoices`
2. Cliquer sur "Nouvelle facture"
3. Remplir les informations client
4. Ajouter les lignes de produits/services
5. Cliquer sur "Envoyer par email"

### Voir le CA (Chiffre d'Affaires)
1. **Dashboard Comptable** : `/accountant` - KPI "CA du Mois"
2. **Compte de Résultat** : `/accountant/profit-loss` - Produits (classe 7)
3. **CRM Dashboard** : `/crm/dashboard` - Analyse CA multidimensionnelle

### Budget Prévisionnel
1. Aller sur `/budget`
2. Créer un nouveau budget
3. Définir les montants par catégorie
4. Suivre réalisé vs prévisionnel

### Pipeline CRM
1. Aller sur `/crm/opportunities`
2. Voir le pipeline visuel (Kanban)
3. Déplacer les opportunités entre les étapes
4. Voir les prévisions de ventes

## 📱 API Endpoints Disponibles

Tous les endpoints sont documentés et accessibles via :
- Base URL : `http://localhost:3001/api/v1/`
- Documentation : Voir `API_IMPLEMENTATION_COMPLETE.md`

## 🔑 Connexion

- **URL** : http://localhost:3000/login
- **Email** : demo@bms.com
- **Mot de passe** : demo (ou n'importe quoi en mode mock)

## 💡 Conseils

- Utilisez la **sidebar** pour naviguer rapidement
- Le **dashboard comptable** donne une vue d'ensemble financière
- Le **CRM** permet de gérer toute la relation client
- Les **budgets** aident au contrôle de gestion
- La **trésorerie** montre la santé financière en temps réel
