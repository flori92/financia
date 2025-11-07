# 📋 Structure de la Sidebar - Profil Comptable

## Vue d'ensemble

Quand un utilisateur se connecte en tant que **Comptable** ou **Expert-Comptable**, la sidebar affiche un menu spécialisé avec des sections et sous-sections dédiées à la comptabilité.

---

## 🎯 Détection du Profil

La sidebar détecte automatiquement le profil comptable de deux façons :
1. **Par la route** : Si l'URL commence par `/accountant`, la sidebar passe en mode comptable
2. **Par le rôle** : Si `user_role` dans localStorage est `'accountant'` ou `'expert-comptable'`

---

## 📊 Structure Complète de la Sidebar Comptable

### 1. **Tableau de bord** (Lien direct)
- 📊 **Dashboard Comptable** (`/accountant`)
  - Vue d'ensemble des KPIs financiers
  - Graphiques et statistiques
  - Alertes comptables

### 2. **Comptabilité** (Section avec sous-sections)
- 📚 **Plan comptable** (`/accountant/chart-of-accounts`)
- ✍️ **Saisie comptable** (`/accountant/journal`) - Badge: `OCR+IA`
- 📖 **Journal comptable** (`/accountant/journal`)
- 📄 **Grand livre** (`/accountant/general-ledger`)
- 🧮 **Balance générale** (`/accountant/trial-balance`)
- 🔗 **Lettrage & Pointage** (`/accountant/bank`) - Badge: `Auto`
- 🔒 **Clôtures** (`/accountant/close`)
- 🏢 **Immobilisations** (`/accountant/assets`)

### 3. **Trésorerie** (Section avec sous-sections)
- 🏦 **Multi-banques** (`/treasury`)
- 📱 **Mobile Money** (`/accountant/mobile-money`) - Badge: `KKia`
- 🔄 **Rapprochement bancaire** (`/accountant/bank`) - Badge: `API`
- 📈 **Prévisionnel trésorerie** (`/treasury/forecast`)
- ↔️ **Opérations** (`/treasury/operations`) - Badge: `SEPA`
- 💰 **Cash Management** (`/treasury`)

### 4. **Opérations** (Section avec sous-sections) - **NOUVEAU**
- ↔️ **Opérations trésorerie** (`/treasury/operations`) - Badge: `SEPA`
- 🔄 **Transactions** (`/transactions`)
- 📤 **Virements** (`/treasury/operations`)
- 💳 **Prélèvements** (`/entrepreneur/direct-debits`)

### 5. **CRM** (Section avec sous-sections) - **NOUVEAU**
- 📊 **Dashboard CRM** (`/crm/dashboard`)
- 👥 **Contacts** (`/crm/contacts`)
- 🎯 **Opportunités** (`/crm/opportunities`)
- 📈 **Pipeline** (`/crm/opportunities`)
- 📊 **Activités** (`/crm`)

### 6. **Communications** (Section avec sous-sections) - **NOUVEAU**
- 📧 **Emails** (`/communications/emails`)
- 📱 **SMS** (`/communications/sms`)
- 💬 **WhatsApp** (`/communications/whatsapp`)
- 📄 **Templates** (`/communications/templates`)

### 7. **Ressources Humaines** (Section avec sous-sections) - **NOUVEAU**
- 📊 **Dashboard RH** (`/hr`)
- 👥 **Employés** (`/hr/employees`)
- 💰 **Bulletins de paie** (`/hr/payroll`) - Badge: `36`
- ✅ **Attestations** (`/hr/certificates`)
- ⏰ **CRA / Timesheets** (`/hr/timesheets`)
- 📅 **Congés** (`/hr/leaves`) - Badge: `8`
- 💳 **Notes de frais** (`/hr/expenses`)
- ✅ **Présences** (`/hr/attendance`)

### 8. **Facturation & Ventes** (Section avec sous-sections)
- 🛒 **Cycle de vente** (`/sales/cycle`)
- 📝 **Facturation** (`/invoices`) - Badge: `e-invoicing`
- 📦 **Catalogue produits** (`/inventory`)
- 💳 **Encaissements** (`/invoices/payments`)
- 🔔 **Relances clients** (`/invoices/reminders`) - Badge: `4` (nombre de relances)
- 📊 **Analyse ventes** (`/sales/analytics`)

### 9. **Achats & Fournisseurs** (Section avec sous-sections)
- 🛍️ **Cycle d'achat** (`/purchases`)
- 👥 **Gestion fournisseurs** (`/purchases/suppliers`)
- 📤 **Paiements** (`/purchases/payments`)
- 📈 **Analyse achats** (`/purchases/analytics`)

### 10. **Budget & Contrôle** (Section avec sous-sections)
- 🎯 **Budgets prévisionnels** (`/budget`)
- 📊 **Suivi budgétaire** (`/budget/tracking`)
- 📉 **Contrôle de gestion** (`/budget/control`)
- 📐 **Comptabilité analytique** (`/budget/analytics`) - Badge: `Multi-axes`

### 11. **Chiffre d'Affaires** (Section avec sous-sections) - **Uniquement pour Comptables**
- ✅ **Reconnaissance CA** (`/accountant/profit-loss`)
- 🔍 **Analyse multidimensionnelle** (`/accountant/multi-dimensional-analysis`)
- 🤖 **Prévisions CA** (`/accountant/ml-forecast`) - Badge: `ML`
- 🔄 **Cohérence CA-Trésorerie** (`/accountant/cash-flow-coherence`)

### 12. **Fiscalité** (Section avec sous-sections)
- 💰 **TVA** (`/accountant/tax/vat`) - Badge: `CA3`
- 📄 **IS / IR** (`/tax`)
- 📋 **Taxes annexes** (`/tax/other`)
- ✅ **Déclarations** (`/tax/declarations`) - Badge: `Télé`
- 🛡️ **Conformité & FEC** (`/accountant/validation`)
- 📅 **Calendrier fiscal** (`/tax/calendar`)

### 13. **Reporting & BI** (Section avec sous-sections)
- 📊 **États financiers** (`/accountant/balance-sheet`)
- 📈 **Ratios financiers** (`/accountant`)
- 🖥️ **Dashboards personnalisés** (`/dashboard`)
- 🗄️ **BI avancée** (`/dashboard/bi`) - Badge: `OLAP`
- ⚠️ **Alertes intelligentes** (`/dashboard/alerts`)

### 14. **Intelligence Artificielle** (Section avec sous-sections)
- 📸 **OCR Documents** (`/ai/ocr`) - Badge: `LIVE`
- 🤖 **Assistant virtuel** (`/ai/chat`) - Badge: `LIVE`

### 15. **Intégrations** (Lien direct)
- 🔌 **Intégrations** (`/settings/integrations`)

### 16. **Système** (Section avec sous-sections)
- ⚙️ **Paramètres** (`/settings`)
- 👤 **Utilisateurs & droits** (`/settings/users`)
- 🛡️ **Audit & traçabilité** (`/settings/audit`)

---

## 📝 Menu Alternatif (Sidebar.tsx)

Dans la version `Sidebar.tsx`, le menu pour comptable est plus simple avec une liste plate :

### Menu Principal (ACCOUNTANT_NAV)
1. **Dashboard Comptable** (`/accountant`)
2. **Centre de Validation** (`/accountant/validation`)
3. **CRM** (`/crm/contacts`)
4. **RH** (`/hr`)
5. **Communications** (`/communications/emails`)
6. **Opérations** (`/treasury/operations`)
7. **Plan Comptable SYSCOHADA** (`/accountant/chart-of-accounts`)
8. **Journal des Écritures** (`/accountant/journal`)
9. **Grand Livre** (`/accountant/general-ledger`)
10. **Balance Âgée** (`/accountant/aged-balance`)
11. **Balance de Vérification** (`/accountant/trial-balance`)
12. **Compte de Résultat** (`/accountant/profit-loss`)
13. **Bilan** (`/accountant/balance-sheet`)
14. **Rapprochement Bancaire** (`/accountant/bank`)
15. **Déclaration TVA** (`/accountant/tax/vat`)
16. **Clôture de Période** (`/accountant/close`)

### Section Chiffre d'Affaires (REVENUE_ANALYSIS_NAV) - Sous-menu
1. **Reconnaissance CA** (`/accountant/revenue-recognition`)
2. **Analyse Multidimensionnelle** (`/accountant/multi-dimensional-analysis`)
3. **Prévision CA ML** (`/accountant/ml-forecast`)
4. **Cohérence CA Trésorerie** (`/accountant/cash-flow-coherence`)

---

## 🎨 Caractéristiques de la Sidebar

### Design
- **Couleur de fond** : `#0F3D3A` (Teal foncé)
- **Couleur active** : `#0D9488` (Teal)
- **Largeur** : 72px (réduite) / 288px (étendue)
- **Mode hover** : S'étend automatiquement au survol
- **Mode verrouillé** : Peut être verrouillée en position étendue

### Fonctionnalités
- ✅ **Sections pliables** : Chaque section peut être ouverte/fermée
- ✅ **Badges** : Indicateurs visuels pour les fonctionnalités spéciales
- ✅ **Icônes** : Chaque item a une icône Lucide React
- ✅ **États actifs** : Mise en surbrillance de la page active
- ✅ **Transitions fluides** : Animations lors de l'ouverture/fermeture

### Badges Disponibles
- `OCR+IA` - Reconnaissance optique de caractères avec IA
- `Auto` - Automatisation
- `API` - Intégration API
- `SEPA` - Système de paiement européen
- `e-invoicing` - Facturation électronique
- `Multi-axes` - Analyse multi-dimensionnelle
- `ML` - Machine Learning
- `CA3` - Déclaration CA3
- `Télé` - Télédéclaration
- `OLAP` - Online Analytical Processing
- `LIVE` - Fonctionnalité en direct
- `KKia` - Mobile Money
- `4` - Nombre d'alertes/relances

---

## 🔄 Logique de Détection

```typescript
// Détection automatique dans Sidebar.tsx
const isAccountantRoute = pathname?.startsWith('/accountant');
const NAV = isAccountantRoute ? ACCOUNTANT_NAV : ENTREPRENEUR_NAV;
```

La sidebar détecte automatiquement si l'utilisateur est sur une route comptable et affiche le menu approprié.

---

## 📊 Statistiques

- **Total de sections principales** : 16
- **Total de sous-sections** : ~70+
- **Sections avec sous-menus** : 14
- **Liens directs** : 2 (Dashboard, Intégrations)

---

## 🎯 Résumé

Pour un **Comptable**, la sidebar contient :

### Sections Principales
1. Tableau de bord
2. Comptabilité (8 sous-sections)
3. Trésorerie (6 sous-sections)
4. **Opérations** (4 sous-sections) - **NOUVEAU**
5. **CRM** (5 sous-sections) - **NOUVEAU**
6. **Communications** (4 sous-sections) - **NOUVEAU**
7. **Ressources Humaines** (8 sous-sections) - **NOUVEAU**
   - Bulletins de paie
   - Attestations
   - CRA / Timesheets
   - Congés
8. Facturation & Ventes (6 sous-sections)
9. Achats & Fournisseurs (4 sous-sections)
10. Budget & Contrôle (4 sous-sections)
11. Chiffre d'Affaires (4 sous-sections) - **Uniquement comptable**
12. Fiscalité (6 sous-sections)
13. Reporting & BI (5 sous-sections)
14. Intelligence Artificielle (2 sous-sections)
15. Intégrations
16. Système (3 sous-sections)

**Total : ~80+ pages accessibles** pour un comptable !

---

*Document généré automatiquement - Mise à jour continue*

