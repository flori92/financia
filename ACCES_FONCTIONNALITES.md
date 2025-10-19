# 🎯 Comment Accéder aux Fonctionnalités BMS

## 📍 Via la Sidebar (Menu de Gauche)

### 🏠 Tableau de bord
Vue d'ensemble de votre activité

### 👥 CRM
- Contacts clients
- Opportunités de vente
- Pipeline commercial
- Dashboard CRM

### 💰 Factures
- Créer et envoyer des factures
- Suivi des paiements
- Relances clients

### 🛒 Achats
- **Fournisseurs** : Gestion des fournisseurs
- **Commandes** : Bons de commande
- **Réceptions** : Contrôle marchandises
- **Appels d'offres** : Demandes de devis

### 🏭 Production
- **Ordres de Fabrication** : Gérer les OF
- **Nomenclatures (BOM)** : Composants produits
- **Planification MRP** : Calcul besoins matières

### 📦 Stock
- Gestion des stocks
- Multi-entrepôts
- Traçabilité

### 👨💼 RH
- **Employés** : Gestion du personnel
- **Paie** : Calcul et fiches de paie
- **Congés** : Demandes et validation
- **Notes de frais** : Remboursements

### 📊 Projets
- Liste des projets
- Suivi progression
- Budget vs dépensé
- Gantt et timesheet

### 💵 Budget
- Budget prévisionnel
- Réalisé vs Budget
- Analyse des écarts

### 💰 Trésorerie
- Solde bancaire
- Prévisions de trésorerie
- Cash flow

### ⚙️ Paramètres
- Configuration société
- Utilisateurs
- Préférences

## 🧮 Profil Comptable

Allez sur `/accountant` pour accéder au menu comptable :

- **Dashboard Comptable** : KPIs financiers + CA du mois
- **Plan Comptable** : SYSCOHADA
- **Journal** : Écritures comptables
- **Grand Livre** : Par compte
- **Balance Âgée** : Créances/Dettes
- **Compte de Résultat** : CA détaillé (Produits classe 7)
- **Bilan** : Actif/Passif
- **TVA** : Déclarations
- **Clôture** : Clôture de période

## 🎯 Exemples d'Utilisation

### Voir le Chiffre d'Affaires
1. **Dashboard Comptable** (`/accountant`) → KPI "CA du Mois"
2. **Compte de Résultat** (`/accountant/profit-loss`) → Produits (classe 7)

### Envoyer une Facture
1. **Factures** (`/invoices`)
2. Cliquer "Nouvelle facture"
3. Remplir les informations
4. Cliquer "Envoyer par email"

### Voir le Budget
1. **Budget** (`/budget`)
2. Voir Réalisé vs Budget par catégorie
3. Analyser les écarts

### Gérer la Production
1. **Production** (`/manufacturing`)
2. **Ordres de Fabrication** → Créer un OF
3. Suivre l'avancement

### Gérer les Achats
1. **Achats** (`/purchases`)
2. **Fournisseurs** → Ajouter fournisseur
3. **Commandes** → Créer bon de commande

### Gérer le Personnel
1. **RH** (`/hr`)
2. **Employés** → Liste du personnel
3. **Paie** → Calculer la paie
4. **Congés** → Valider les demandes

### Suivre les Projets
1. **Projets** (`/projects`)
2. Voir progression et budget
3. Accéder au Gantt et timesheet

## 📊 Backend API

Tous les services backend sont implémentés et fonctionnels :
- 60+ services
- 120+ endpoints API
- Documentation complète dans `API_IMPLEMENTATION_COMPLETE.md`

## 🚀 Démarrage Rapide

1. Démarrer le backend : `cd bms/api-gateway && node server-mock.js`
2. Démarrer le frontend : `cd bms-web && npm run dev`
3. Ouvrir : http://localhost:3000
4. Se connecter : demo@bms.com / demo

## 📚 Documentation

- `GUIDE_UTILISATEUR_BMS.md` - Guide complet
- `ERP_PAGES_STATUS.md` - État des pages
- `API_IMPLEMENTATION_COMPLETE.md` - API complète
- `ERP_CRM_COMPLETE.md` - Services backend
