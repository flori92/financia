# 💻 BMS - Plan Web App (Next.js)

**Date**: 15 Octobre 2025  
**Décision**: Mobile + Web en parallèle  
**Pays Pilot**: Bénin 🇧🇯

---

## 🎯 CIBLE & OBJECTIFS

### **Utilisateurs**
- **Experts-Comptables**: Gestion multi-clients, comptabilité complète
- **Entrepreneurs**: Version bureau pour saisie intensive

### **Plateformes**
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

---

## 🛠️ STACK TECHNIQUE

### **Core**
```typescript
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+
- Node.js 18+
```

### **Styling & UI**
```typescript
- TailwindCSS 3+
- shadcn/ui (composants)
- Radix UI (primitives accessibles)
- Lucide Icons
- Framer Motion (animations)
```

### **State & Data**
```typescript
- Zustand (state global léger)
- TanStack Query / React Query (server state)
- React Hook Form (formulaires)
- Zod (validation schémas)
```

### **Auth & API**
```typescript
- NextAuth.js (auth)
- Axios (HTTP client)
- SWR (alternative React Query)
```

### **Charts & Export**
```typescript
- Recharts (graphiques)
- React-PDF (@react-pdf/renderer)
- xlsx (export Excel)
- jsPDF (export PDF avancé)
```

### **Tables & Data Display**
```typescript
- TanStack Table / React Table
- React Virtualized (grandes listes)
```

### **Dev Tools**
```typescript
- ESLint + Prettier
- Husky (pre-commit hooks)
- Jest + React Testing Library
- Playwright (E2E tests)
- Storybook (doc composants)
```

---

## 📁 ARCHITECTURE

```
bms-web/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (entrepreneur)/  # Dashboard Entrepreneur
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   ├── [id]/
│   │   │   │   └── [id]/edit/
│   │   │   ├── payments/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── clients/
│   │   │   ├── accounting/
│   │   │   ├── reports/
│   │   │   ├── nif/
│   │   │   ├── score/
│   │   │   ├── loans/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (cabinet)/    # Dashboard Expert-Comptable
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── accounting/
│   │   │   │   ├── journal-entries/
│   │   │   │   ├── accounts/
│   │   │   │   └── validation/
│   │   │   ├── reports/
│   │   │   │   ├── balance/
│   │   │   │   ├── income-statement/
│   │   │   │   ├── balance-sheet/
│   │   │   │   └── general-ledger/
│   │   │   ├── declarations/
│   │   │   │   ├── tva/
│   │   │   │   └── ir-is/
│   │   │   ├── billing/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/          # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   └── webhooks/
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/       # Composants
│   │   ├── ui/           # shadcn/ui base
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MetricsGrid.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── invoices/
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceTable.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   ├── InvoiceFilters.tsx
│   │   │   └── InvoiceActions.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── PaymentList.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PaymentAllocation.tsx
│   │   │   └── PaymentHistory.tsx
│   │   │
│   │   ├── accounting/
│   │   │   ├── JournalEntryForm.tsx
│   │   │   ├── AccountPicker.tsx
│   │   │   ├── EntryValidation.tsx
│   │   │   └── AccountingGrid.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── BalanceSheet.tsx
│   │   │   ├── IncomeStatement.tsx
│   │   │   ├── GeneralLedger.tsx
│   │   │   ├── BalanceGenerale.tsx
│   │   │   └── ReportFilters.tsx
│   │   │
│   │   ├── clients/
│   │   │   ├── ClientList.tsx
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientSwitcher.tsx
│   │   │   └── ClientStats.tsx
│   │   │
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── UserMenu.tsx
│   │       ├── NotificationBell.tsx
│   │       └── SearchCommand.tsx
│   │
│   ├── lib/              # Utils & Config
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── invoices.ts
│   │   │   ├── payments.ts
│   │   │   ├── accounting.ts
│   │   │   └── reports.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useInvoices.ts
│   │   │   ├── usePayments.ts
│   │   │   ├── useAccounting.ts
│   │   │   └── useClients.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── cn.ts (classnames)
│   │   │   └── helpers.ts
│   │   └── constants.ts
│   │
│   ├── stores/           # Zustand Stores
│   │   ├── authStore.ts
│   │   ├── invoiceStore.ts
│   │   ├── clientStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/            # TypeScript Types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   ├── forms.ts
│   │   └── reports.ts
│   │
│   └── config/
│       ├── site.ts
│       └── navigation.ts
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
└── __tests__/
    ├── components/
    ├── pages/
    └── e2e/
```

---

## ✨ FONCTIONNALITÉS MVP

### **Phase 1: Core (Semaines 1-2)** ⭐⭐⭐

#### **1. Auth & Layout**
```
✅ Login/Register
✅ Forgot password
✅ Session management (NextAuth)
✅ Layout responsive
   - Sidebar collapsible
   - Header avec search
   - Breadcrumbs
   - User menu
✅ Navigation
   - Routes protégées
   - Role-based (entrepreneur/expert)
```

#### **2. Dashboard Entrepreneur**
```
✅ Métriques clés (cards)
   - CA du mois
   - Factures en attente
   - Paiements reçus
   - Évolution %
✅ Graphique CA (6-12 mois)
✅ Top clients
✅ Activités récentes
✅ Actions rapides
```

#### **3. Dashboard Expert-Comptable**
```
✅ Vue multi-clients
   - Liste clients
   - Switch rapide
   - Stats agrégées
✅ Alertes & tâches
   - Dossiers en retard
   - Validations en attente
   - Échéances fiscales
✅ Métriques cabinet
   - CA total clients
   - Nouveaux clients
   - Taux activité
```

### **Phase 2: Factures & Compta (Semaines 3-4)** ⭐⭐⭐

#### **4. Facturation Complète**
```
✅ Liste factures (table avancée)
   - Tri multi-colonnes
   - Filtres (statut, période, client)
   - Recherche
   - Pagination
   - Actions par lot
✅ Créer facture
   - Formulaire multi-étapes
   - Ajout items dynamique
   - Calculs auto (TVA, total)
   - Templates
✅ Éditer facture
✅ Détail facture
   - Toutes infos
   - Historique
   - Actions (envoyer, annuler)
✅ Génération PDF
✅ Envoi email
✅ QR Code mobile money
```

#### **5. Gestion Paiements**
```
✅ Liste paiements
✅ Enregistrer paiement
✅ Allocation factures
   - Paiement partiel
   - Multi-factures
✅ Rapprochements
✅ Historique transactions
```

#### **6. Gestion Clients**
```
✅ CRUD clients complet
✅ Détail client
   - Infos de base
   - Factures historique
   - Paiements historique
   - CA total
✅ Import CSV
✅ Export Excel
```

#### **7. Comptabilité Base**
```
✅ Plan comptable SYSCOHADA
   - Navigation hiérarchique
   - Recherche compte
   - Créer compte custom
✅ Saisie écritures
   - Guide comptable
   - Ligne débit/crédit
   - Vérification équilibre
   - Pièce jointe
✅ Journaux
   - Ventes (auto depuis factures)
   - Achats
   - Banque
   - Caisse
   - OD (Opérations Diverses)
```

### **Phase 3: Rapports & Multi-Clients (Semaines 5-6)** ⭐⭐

#### **8. Rapports OHADA**
```
✅ Balance Générale
   - Filtres période
   - Détail par compte
   - Export PDF/Excel
✅ Grand Livre
   - Par compte
   - Détail écritures
   - Soldes progressifs
✅ Compte de Résultat
   - Format SYSCOHADA
   - Comparatif N vs N-1
   - Graphiques
✅ Bilan
   - Actif/Passif
   - Format SYSCOHADA
   - Export PDF
✅ Balance Âgée
   - Clients
   - Fournisseurs
   - Par échéance
✅ Tableau Trésorerie
   - Entrées/Sorties
   - Prévisions
```

#### **9. Multi-Clients (Experts)**
```
✅ Gestion clients cabinet
   - Ajouter client
   - Inviter client
   - Permissions
✅ Switch client
   - Dropdown rapide
   - Tous les dossiers accessibles
✅ Vue consolidée
   - Stats tous clients
   - CA total
   - Alertes globales
✅ Facturation cabinet
   - Factures honoraires
   - Forfaits mensuels
   - Suivi paiements
```

#### **10. Déclarations Fiscales**
```
✅ Calcul TVA
   - TVA collectée
   - TVA déductible
   - TVA à payer
✅ Déclaration TVA
   - Formulaire DGI
   - Préremplissage auto
   - Export PDF
✅ Calcul IR/IS
   - Base imposable
   - Impôt calculé
✅ Export format DGI
✅ Historique déclarations
```

---

## 🎨 DESIGN PAGES PRINCIPALES

### **1. Dashboard Entrepreneur**

```
╔══════════════════════════════════════════════════════════════════╗
║ [≡] BMS            🔍 Rechercher...      [🔔] [⚙️] [👤 Jean]   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║ Dashboard                                                        ║
║ Accueil > Dashboard                                             ║
║                                                                  ║
║ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       ║
║ │ 💰 CA ce mois  │ │ ⏰ En attente  │ │ ✅ Encaissé    │       ║
║ │ 2,450,000 FCFA │ │ 850,000 FCFA   │ │ 1,600,000 FCFA │       ║
║ │ 📈 +15%        │ │ 4 factures     │ │ 8 paiements    │       ║
║ └────────────────┘ └────────────────┘ └────────────────┘       ║
║                                                                  ║
║ ┌──────────────────────────────────────────────────────────┐   ║
║ │ 📊 Évolution du Chiffre d'Affaires                       │   ║
║ │ [Graphique ligne avec 6 derniers mois]                   │   ║
║ │                                                           │   ║
║ │ Mai  Juin  Juil  Août  Sept  Oct                        │   ║
║ └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║ ┌──────────────────────────┐  ┌──────────────────────────┐     ║
║ │ 🚀 Actions Rapides       │  │ 📋 Activités Récentes    │     ║
║ │ [+ Nouvelle Facture]     │  │ #2024-0125  125k ⏰      │     ║
║ │ [💰 Enregistrer Paiement]│  │ Paiement    75k  ✅      │     ║
║ │ [👥 Nouveau Client]      │  │ #2024-0123  50k  ❌      │     ║
║ └──────────────────────────┘  └──────────────────────────┘     ║
╚══════════════════════════════════════════════════════════════════╝
```

### **2. Liste Factures (Table)**

```
╔══════════════════════════════════════════════════════════════════╗
║ Factures                                                         ║
║ Accueil > Factures                                              ║
╠══════════════════════════════════════════════════════════════════╣
║ [+ Nouvelle Facture]  [📊 Exporter]  [⚙️ Colonnes]             ║
║                                                                  ║
║ Filtres: [Statut ▼] [Période ▼] [Client ▼] [🔍 Recherche...]  ║
║                                                                  ║
║ ┌──────────────────────────────────────────────────────────────┐║
║ │ ☐ │ # │ Date │ Client │ Montant │ Statut │ Actions │       │║
║ ├──────────────────────────────────────────────────────────────┤║
║ │ ☐ │2125│15/10│Resto Le...│59,000│⏰Attente│[👁️][✏️][🗑️][📧]││║
║ │ ☐ │2124│14/10│Salon Mo...│125k  │✅Payé   │[👁️][📄]        ││║
║ │ ☐ │2123│13/10│Garage A...│85,000│❌Retard │[👁️][📧][✏️]    ││║
║ │ ☐ │2122│12/10│Boutique...│45,000│✅Payé   │[👁️][📄]        ││║
║ │ ☐ │2121│11/10│Taxi Cot...│30,000│⏰Attente│[👁️][✏️][📧]    ││║
║ │ ... │ ...  │ ... │ ...    │ ...  │ ...     │ ...            ││║
║ └──────────────────────────────────────────────────────────────┘║
║                                                                  ║
║ 2 sélectionnées  [Envoyer par email] [Exporter PDF]            ║
║                                                                  ║
║ Affichage 1-10 de 125         [◀] 1 2 3 ... 13 [▶]            ║
╚══════════════════════════════════════════════════════════════════╝
```

### **3. Saisie Comptable (Expert)**

```
╔══════════════════════════════════════════════════════════════════╗
║ Nouvelle Écriture Comptable                                     ║
║ Comptabilité > Écritures > Nouvelle                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║ Journal: [Opérations Diverses ▼]                                ║
║ Date: [📅 15/10/2025]  Numéro: [OD-2024-0125] (auto)           ║
║ Libellé: [Vente marchandises client ABC_____________]          ║
║ Pièce jointe: [📎 Choisir fichier]                             ║
║                                                                  ║
║ ┌──────────────────────────────────────────────────────────────┐║
║ │ Compte   │ Libellé             │ Débit    │ Crédit   │ Tiers││
║ ├──────────────────────────────────────────────────────────────┤║
║ │ [411___] │ [Clients_________]  │[125,000] │[_______] │[___] ││
║ │ [701___] │ [Ventes_________]   │[_______] │[125,000] │[___] ││
║ │ [      ] │ [                ]  │[       ] │[       ] │[   ] ││
║ │ [+ Ajouter ligne]                                            ││
║ └──────────────────────────────────────────────────────────────┘║
║                                                                  ║
║ Totaux:  Débit: 125,000 FCFA  Crédit: 125,000 FCFA  ✅ Équilibré ║
║                                                                  ║
║ [Enregistrer Brouillon]  [Valider & Poster]  [Annuler]         ║
╚══════════════════════════════════════════════════════════════════╝
```

### **4. Balance Générale (Rapport)**

```
╔══════════════════════════════════════════════════════════════════╗
║ Balance Générale                                                ║
║ Rapports > Balance Générale                                     ║
╠══════════════════════════════════════════════════════════════════╣
║ Période: [Du 01/01/2025] [Au 31/12/2025]  [Afficher]           ║
║ [📊 Exporter PDF]  [📄 Exporter Excel]                          ║
║                                                                  ║
║ ┌──────────────────────────────────────────────────────────────┐║
║ │ Compte│ Libellé         │ Débit     │ Crédit    │ Solde     │║
║ ├──────────────────────────────────────────────────────────────┤║
║ │ 101   │ Capital         │           │ 1,000,000 │-1,000,000 │║
║ │ 120   │ Résultat        │           │   450,000 │  -450,000 │║
║ │ 411   │ Clients         │ 2,500,000 │ 2,000,000 │   500,000 │║
║ │ 401   │ Fournisseurs    │ 1,200,000 │ 1,500,000 │  -300,000 │║
║ │ 512   │ Banque          │ 3,000,000 │ 2,500,000 │   500,000 │║
║ │ 571   │ Caisse          │   800,000 │   600,000 │   200,000 │║
║ │ 601   │ Achats          │ 1,500,000 │           │ 1,500,000 │║
║ │ 701   │ Ventes          │           │ 3,500,000 │-3,500,000 │║
║ │ ...   │ ...             │ ...       │ ...       │ ...       │║
║ ├──────────────────────────────────────────────────────────────┤║
║ │ TOTAL │                 │12,000,000 │12,000,000 │         0 │║
║ └──────────────────────────────────────────────────────────────┘║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🚀 ROADMAP WEB

### **Semaine 1 : Setup & Auth**
- [ ] Init Next.js 14 (App Router)
- [ ] Setup TailwindCSS + shadcn/ui
- [ ] Config TypeScript
- [ ] Pages auth (login/register)
- [ ] NextAuth.js config
- [ ] Layout base (sidebar/header)
- [ ] Navigation

### **Semaine 2 : Dashboards**
- [ ] Dashboard entrepreneur
- [ ] Métriques cards
- [ ] Graphiques (Recharts)
- [ ] Dashboard expert
- [ ] Liste clients
- [ ] Switch client

### **Semaine 3 : Factures**
- [ ] Table factures (TanStack Table)
- [ ] Filtres & recherche
- [ ] Formulaire création
- [ ] Multi-étapes
- [ ] Calculs auto
- [ ] Détail facture
- [ ] Actions (éditer, supprimer)

### **Semaine 4 : Paiements & Clients**
- [ ] Table paiements
- [ ] Enregistrer paiement
- [ ] Allocation factures
- [ ] CRUD clients
- [ ] Import/Export CSV
- [ ] Génération PDF factures

### **Semaine 5 : Comptabilité**
- [ ] Plan comptable SYSCOHADA
- [ ] Saisie écritures
- [ ] Guide comptable
- [ ] Validation
- [ ] Journaux multiples
- [ ] Lettrage comptes

### **Semaine 6 : Rapports**
- [ ] Balance générale
- [ ] Grand livre
- [ ] Compte de résultat OHADA
- [ ] Bilan OHADA
- [ ] Balance âgée
- [ ] Export PDF/Excel tous rapports

### **Semaine 7 : Multi-Clients & Déclarations**
- [ ] Gestion clients cabinet
- [ ] Permissions
- [ ] Facturation cabinet
- [ ] Calcul TVA
- [ ] Formulaire déclaration TVA
- [ ] Export DGI

### **Semaine 8 : Polish & Tests**
- [ ] Responsive mobile/tablet
- [ ] Animations Framer Motion
- [ ] Loading states
- [ ] Error handling
- [ ] Toasts notifications
- [ ] Tests E2E (Playwright)
- [ ] Tests unitaires

### **Semaine 9-10 : Deploy & Monitoring**
- [ ] Build production
- [ ] Deploy Vercel/Netlify
- [ ] DNS & SSL
- [ ] CDN setup
- [ ] Analytics (Google/Plausible)
- [ ] Monitoring (Sentry)
- [ ] Performance optimization

---

## ✅ CHECKLIST AVANT LANCEMENT

### **Fonctionnel**
- [ ] Auth complète
- [ ] CRUD factures
- [ ] CRUD paiements
- [ ] CRUD clients
- [ ] Saisie comptable
- [ ] Tous rapports OHADA
- [ ] Multi-clients (experts)
- [ ] Déclarations fiscales

### **UX/UI**
- [ ] Responsive (desktop/tablet/mobile)
- [ ] Animations fluides
- [ ] Loading states
- [ ] Error messages clairs
- [ ] Formulaires validés
- [ ] Keyboard navigation
- [ ] Accessibilité WCAG AA

### **Performance**
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size optimisé

### **SEO & Meta**
- [ ] Meta tags
- [ ] Open Graph
- [ ] Sitemap
- [ ] Robots.txt

---

## 📊 KPIs Web

**Techniques**:
- Lighthouse Performance > 90
- Accessibility > 95
- SEO > 95
- Bundle size < 500 KB (initial)
- API response < 500ms

**Utilisateur**:
- Temps création facture < 3 min
- Temps saisie écriture < 2 min
- Génération rapport < 5s
- Satisfaction > 4.5/5

---

**Prochaine étape**: Voir Timeline & Budget (DEV_PLAN_3_TIMELINE.md)
