# 📱 BMS - Plan Mobile App (React Native)

**Date**: 15 Octobre 2025  
**Décision**: Mobile + Web en parallèle  
**Pays Pilot**: Bénin 🇧🇯

---

## 🎯 CIBLE & OBJECTIFS

### **Utilisateurs**
- Entrepreneurs (micro-entreprises, TPE, PME)
- Usage quotidien en mobilité
- Besoin de simplicité maximale

### **Plateformes**
- iOS 13+
- Android 8+ (API 26+)
- Taille app : ~30 MB

---

## 🛠️ STACK TECHNIQUE

### **Core**
```javascript
- React Native 0.72+
- Expo SDK 49+ (managed workflow)
- TypeScript 5+
- Node.js 18+
```

### **Navigation & State**
```javascript
- React Navigation v6 (tabs + stack)
- Redux Toolkit (state global)
- React Query / TanStack Query (API calls)
- Zustand (alternative légère à Redux)
```

### **UI/UX**
```javascript
- React Native Paper (Material Design)
- React Native Elements
- NativeWind (Tailwind pour RN)
- Lottie React Native (animations)
- React Native SVG (icônes custom)
```

### **Storage & Offline**
```javascript
- AsyncStorage (simple key-value)
- WatermelonDB (base SQLite performante)
- MMKV (ultra-rapide pour settings)
- NetInfo (détection connexion)
```

### **Features Natives**
```javascript
- Expo Camera (scan documents)
- Expo Sharing (partage WhatsApp/Email)
- Expo Print (génération PDF)
- Expo Notifications (push)
- Expo SecureStore (tokens)
- React Native QRCode (génération QR)
- React Native PDF (lecture PDF)
```

### **API & Auth**
```javascript
- Axios (HTTP client)
- Axios interceptors (auth auto)
- JWT tokens (access + refresh)
- Biométrie (Face ID / Touch ID)
```

---

## 📁 ARCHITECTURE

```
bms-mobile/
├── app.json              # Config Expo
├── package.json
├── tsconfig.json
├── babel.config.js
│
├── src/
│   ├── api/              # API Client
│   │   ├── client.ts
│   │   ├── interceptors.ts
│   │   └── endpoints/
│   │       ├── auth.ts
│   │       ├── invoices.ts
│   │       ├── payments.ts
│   │       └── dashboard.ts
│   │
│   ├── components/       # Composants réutilisables
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── invoices/
│   │   │   ├── InvoiceCard.tsx
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoiceQRCode.tsx
│   │   │   └── InvoicePreview.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── PaymentCard.tsx
│   │   │   └── MobileMoneyButton.tsx
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── TabBar.tsx
│   │       └── Modal.tsx
│   │
│   ├── screens/          # Écrans
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   │
│   │   ├── invoices/
│   │   │   ├── InvoiceListScreen.tsx
│   │   │   ├── InvoiceCreateScreen.tsx
│   │   │   ├── InvoiceEditScreen.tsx
│   │   │   ├── InvoiceDetailScreen.tsx
│   │   │   └── InvoiceSendScreen.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── PaymentListScreen.tsx
│   │   │   ├── PaymentRecordScreen.tsx
│   │   │   └── PaymentHistoryScreen.tsx
│   │   │
│   │   ├── clients/
│   │   │   ├── ClientListScreen.tsx
│   │   │   ├── ClientCreateScreen.tsx
│   │   │   └── ClientDetailScreen.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── CompanyScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   │
│   │   └── features/
│   │       ├── NifRequestScreen.tsx
│   │       ├── CreditScoreScreen.tsx
│   │       └── LoanApplicationScreen.tsx
│   │
│   ├── navigation/       # Navigation
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   │
│   ├── store/            # State Management
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── invoicesSlice.ts
│   │   │   ├── paymentsSlice.ts
│   │   │   ├── clientsSlice.ts
│   │   │   └── syncSlice.ts
│   │   └── store.ts
│   │
│   ├── services/         # Services métier
│   │   ├── auth.service.ts
│   │   ├── invoice.service.ts
│   │   ├── payment.service.ts
│   │   ├── sync.service.ts
│   │   ├── offline.service.ts
│   │   └── notification.service.ts
│   │
│   ├── database/         # Base locale (WatermelonDB)
│   │   ├── models/
│   │   │   ├── Invoice.ts
│   │   │   ├── Payment.ts
│   │   │   └── Client.ts
│   │   ├── schema.ts
│   │   └── migrations.ts
│   │
│   ├── utils/            # Utilitaires
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── api-error-handler.ts
│   │
│   ├── hooks/            # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useInvoices.ts
│   │   ├── usePayments.ts
│   │   ├── useOffline.ts
│   │   ├── useSync.ts
│   │   └── useNetInfo.ts
│   │
│   ├── types/            # TypeScript Types
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   ├── navigation.types.ts
│   │   └── forms.types.ts
│   │
│   └── theme/            # Design System
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       └── theme.ts
│
├── assets/               # Assets statiques
│   ├── images/
│   │   ├── logo.png
│   │   ├── onboarding/
│   │   └── placeholders/
│   ├── icons/
│   └── animations/
│       ├── loading.json
│       └── success.json
│
└── __tests__/            # Tests
    ├── components/
    ├── screens/
    └── services/
```

---

## ✨ FONCTIONNALITÉS MVP

### **Phase 1: Core (Semaines 1-2)** ⭐⭐⭐

#### **1. Authentification**
```
✅ Écran Login (email + mot de passe)
✅ Écran Register (multi-étapes)
✅ Mot de passe oublié
✅ Biométrie (Face ID / Touch ID)
✅ Refresh token automatique
✅ Logout
```

#### **2. Onboarding**
```
✅ 3 écrans d'introduction
✅ Setup entreprise (nom, secteur, devise)
✅ Skip onboarding (déjà vu)
```

#### **3. Dashboard**
```
✅ Métriques clés (CA, factures, paiements)
✅ Graphique CA mensuel (6 mois)
✅ Liste activités récentes
✅ Actions rapides (+ facture, + paiement)
✅ Pull-to-refresh
```

#### **4. Navigation**
```
✅ Bottom tabs (5 onglets)
   - Dashboard
   - Factures
   - Paiements
   - Clients
   - Profil
✅ Header avec recherche
✅ Transitions fluides
```

### **Phase 2: Factures & Paiements (Semaines 3-4)** ⭐⭐⭐

#### **5. Facturation**
```
✅ Liste factures (filtres, recherche)
✅ Créer facture (formulaire multi-étapes)
   - Sélectionner client
   - Ajouter articles (quantité, prix)
   - Aperçu
   - Générer
✅ Éditer facture (brouillon uniquement)
✅ Détail facture (toutes infos)
✅ Génération QR Code (mobile money)
✅ Partage (WhatsApp, Email, SMS)
✅ Export PDF
✅ Statuts (brouillon, envoyé, payé, retard)
```

#### **6. Paiements**
```
✅ Liste paiements
✅ Enregistrer paiement
✅ Lien avec facture
✅ Mobile Money
   - MTN
   - Moov
   - Wave
✅ Historique transactions
✅ Notifications paiement reçu
```

#### **7. Clients**
```
✅ Liste clients
✅ Créer client (nom, email, tel, adresse)
✅ Éditer client
✅ Détail client (factures, paiements)
✅ Recherche
```

### **Phase 3: Offline & Advanced (Semaines 5-6)** ⭐⭐

#### **8. Mode Offline**
```
✅ Détection connexion (indicateur)
✅ CRUD offline complet
   - Créer factures
   - Créer clients
   - Enregistrer paiements
✅ Queue de synchronisation
✅ Sync automatique (online)
✅ Résolution conflits
✅ Toast notifications sync
```

#### **9. Features Avancées**
```
✅ Appareil photo
   - Scan documents (NIF, RCCM)
   - Upload photos
✅ Demande NIF
   - Formulaire
   - Upload docs
   - Suivi statut
✅ Score Crédit
   - Visualisation score
   - Facteurs
   - Recommandations
✅ Simulation prêt
   - Formulaire simulation
   - Montant éligible
   - Demande prêt
```

#### **10. Notifications Push**
```
✅ Setup Firebase/OneSignal
✅ Types notifications:
   - Paiement reçu
   - Facture en retard
   - NIF validé
   - Score mis à jour
✅ Permissions
✅ Badge counter
```

#### **11. Polish UX**
```
✅ Animations (Lottie)
   - Loading states
   - Success/Error
   - Empty states
✅ Haptic feedback
✅ Skeleton loaders
✅ Toast messages
✅ Pull-to-refresh partout
```

---

## 🎨 DESIGN SYSTEM

### **Couleurs**
```typescript
const colors = {
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    500: '#2196F3', // Bleu principal
    700: '#1976D2',
    900: '#0D47A1',
  },
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    300: '#E0E0E0',
    500: '#9E9E9E',
    700: '#616161',
    900: '#212121',
  },
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  }
};
```

### **Typography**
```typescript
const typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  body1: { fontSize: 16, fontWeight: '400' },
  body2: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '600' },
};
```

### **Spacing**
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 📱 ÉCRANS DÉTAILLÉS

### **1. Dashboard**
```
┌─────────────────────────────────────┐
│ 👋 Bonjour, Jean    [🔔] [⚙️]    │
│ Mardi 15 Octobre 2025              │
├─────────────────────────────────────┤
│ 💰 CA ce mois                      │
│ 2,450,000 FCFA  📈 +15%            │
│ ────────────────────────            │
│ ⏰ Attente : 850k │ ✅ Payé : 1.6M │
├─────────────────────────────────────┤
│ 📊 Évolution CA (6 mois)           │
│ [Graphique ligne]                   │
├─────────────────────────────────────┤
│ Actions Rapides                    │
│ [+ Facture] [💰 Paiement]          │
├─────────────────────────────────────┤
│ Récent                             │
│ 📄 #2024-0125  125k  ⏰ En attente │
│ 💰 Paiement reçu   75k  ✅ Payé   │
│ 📄 #2024-0123  50k   ❌ Retard    │
└─────────────────────────────────────┘
[Dashboard] [Factures] [💰] [Clients] [Profil]
```

### **2. Créer Facture**
```
┌─────────────────────────────────────┐
│ ← Nouvelle Facture           [✓]   │
├─────────────────────────────────────┤
│ Étape 1/3: Client                  │
│                                     │
│ Client *                           │
│ [Sélectionner client ▼]            │
│ [+ Nouveau client]                  │
│                                     │
│ Date facture                       │
│ [📅 15/10/2025]                     │
│                                     │
│ Date échéance                      │
│ [📅 15/11/2025]                     │
│                                     │
│            [Suivant →]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ← Nouvelle Facture           [✓]   │
├─────────────────────────────────────┤
│ Étape 2/3: Articles                │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Article 1            [❌]     │  │
│ │ Description: Consultation     │  │
│ │ Qté: 1   Prix: 50,000 FCFA   │  │
│ └───────────────────────────────┘  │
│                                     │
│ [+ Ajouter article]                 │
│                                     │
│ Sous-total     50,000 FCFA         │
│ TVA (18%)       9,000 FCFA         │
│ TOTAL          59,000 FCFA         │
│                                     │
│ [← Précédent]      [Suivant →]     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ← Nouvelle Facture           [✓]   │
├─────────────────────────────────────┤
│ Étape 3/3: Aperçu                  │
│                                     │
│ [Aperçu PDF de la facture]         │
│                                     │
│ FACTURE #2024-0125                 │
│ Client: Restaurant Le Béninois     │
│ Date: 15/10/2025                   │
│                                     │
│ 1x Consultation    50,000 FCFA     │
│ TVA (18%)           9,000 FCFA     │
│ TOTAL              59,000 FCFA     │
│                                     │
│ [← Modifier]  [Créer & Envoyer]    │
└─────────────────────────────────────┘
```

### **3. Détail Facture avec QR**
```
┌─────────────────────────────────────┐
│ ← Facture #2024-0125      [⋮]      │
├─────────────────────────────────────┤
│ Client: Restaurant Le Béninois     │
│ Date: 15 Oct 2025                  │
│ Statut: ⏰ En attente              │
│                                     │
│ Articles                           │
│ 1x Consultation      50,000 FCFA   │
│                                     │
│ Sous-total          50,000 FCFA    │
│ TVA (18%)            9,000 FCFA    │
│ ─────────────────────────────      │
│ TOTAL               59,000 FCFA    │
├─────────────────────────────────────┤
│ Payer par Mobile Money             │
│ ┌───────────────────┐              │
│ │                   │              │
│ │   [QR CODE]       │              │
│ │                   │              │
│ └───────────────────┘              │
│ Scannez pour payer                 │
├─────────────────────────────────────┤
│ [Partager WhatsApp]                │
│ [📄 Télécharger PDF]               │
│ [💰 Enregistrer Paiement]          │
└─────────────────────────────────────┘
```

---

## 🔄 OFFLINE & SYNC

### **Architecture Offline**
```typescript
// Stratégie
1. Toutes les données importantes en local (WatermelonDB)
2. Actions en offline → Queue
3. Sync auto quand online
4. Résolution conflits (last-write-wins ou merge)

// Base locale
- Invoices
- Payments
- Clients
- Settings
- Sync queue

// Queue System
interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'invoice' | 'payment' | 'client';
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}
```

### **Sync Flow**
```
1. User crée facture offline
   → Sauvegarde locale
   → Ajout à sync queue
   → UI montre "sync pending"

2. Connexion détectée
   → Sync service démarre
   → Traite queue (FIFO)
   → API calls séquentiels
   → Update status

3. Succès
   → Remove de queue
   → Update local avec server ID
   → Toast "Synchronisé ✓"

4. Échec
   → Retry (3 fois)
   → Si échec final → alerte user
```

---

## 🚀 ROADMAP MOBILE

### **Semaine 1-2 : Setup & Auth**
- [x] Init projet Expo
- [ ] Config TypeScript
- [ ] Setup navigation
- [ ] Écrans auth (login/register)
- [ ] API client + auth
- [ ] Secure storage (tokens)
- [ ] Onboarding

### **Semaine 3 : Dashboard & Factures Base**
- [ ] Dashboard screen
- [ ] Métriques & graphiques
- [ ] Liste factures
- [ ] Détail facture
- [ ] Recherche & filtres

### **Semaine 4 : Création Factures**
- [ ] Formulaire facture (multi-étapes)
- [ ] Gestion clients
- [ ] Articles & calculs
- [ ] Génération PDF
- [ ] QR Code mobile money
- [ ] Partage (WhatsApp/Email)

### **Semaine 5 : Paiements**
- [ ] Liste paiements
- [ ] Enregistrer paiement
- [ ] Lien facture-paiement
- [ ] Intégration mobile money
- [ ] Notifications

### **Semaine 6 : Offline & Sync**
- [ ] Setup WatermelonDB
- [ ] CRUD offline
- [ ] Queue système
- [ ] Sync bidirectionnelle
- [ ] Indicateurs réseau
- [ ] Résolution conflits

### **Semaine 7 : Features Avancées**
- [ ] Appareil photo (scan docs)
- [ ] NIF demande
- [ ] Score crédit
- [ ] Simulation prêt
- [ ] Push notifications

### **Semaine 8 : Polish & Tests**
- [ ] Animations Lottie
- [ ] Haptic feedback
- [ ] Loading states partout
- [ ] Error handling
- [ ] Tests E2E (Detox)
- [ ] Tests unitaires

### **Semaine 9-10 : Build & Deploy**
- [ ] Build iOS (TestFlight)
- [ ] Build Android (Play Console Beta)
- [ ] Push notifications config
- [ ] Analytics (Firebase/Mixpanel)
- [ ] Crash reporting (Sentry)

---

## ✅ CHECKLIST AVANT LANCEMENT

### **Fonctionnel**
- [ ] Login/Register/Logout
- [ ] Créer facture complète
- [ ] Envoyer facture (WhatsApp)
- [ ] QR Code paiement
- [ ] Enregistrer paiement
- [ ] Dashboard métriques
- [ ] Mode offline complet
- [ ] Sync automatique
- [ ] Notifications push

### **Qualité**
- [ ] Aucun crash
- [ ] Temps chargement < 3s
- [ ] Smooth animations (60 FPS)
- [ ] Feedback utilisateur partout
- [ ] Error messages clairs
- [ ] Tests passent à 100%

### **Compliance**
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Permissions expliquées
- [ ] RGPD compliant (si applicable)
- [ ] App store guidelines

---

## 📊 KPIs Mobile

**Techniques**:
- App size < 30 MB
- Cold start < 2s
- API response < 500ms
- Crash rate < 1%
- Battery usage acceptable

**Utilisateur**:
- Temps création facture < 2 min
- Taux offline usage > 20%
- Retention J7 > 40%
- Rating stores > 4.5/5

---

## 📝 NOTES DÉVELOPPEMENT

### **Expo vs React Native CLI**
✅ **Choix: Expo** car:
- Setup rapide
- OTA updates
- Easy testing (Expo Go)
- Push notifications intégrées
- Moins de config native

### **State Management**
✅ **Choix: Redux Toolkit** car:
- Standard industrie
- DevTools puissants
- Offline-first compatible
- Sync queue facile

### **Base Locale**
✅ **Choix: WatermelonDB** car:
- Performance excellente
- Sync built-in
- Reactive
- SQLite sous le capot

---

**Prochaine étape**: Développer Web App (voir DEV_PLAN_2_WEB.md)
