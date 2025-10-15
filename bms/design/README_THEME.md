# 🎨 BMS Design System – Thème & Composants

Ce thème reprend le style des captures: **sidebar vert foncé**, **accent jaune**, **cartes blanches**, **tableaux épurés**, **barre de recherche en topbar**.

- Tokens partagés: `design/tokens.ts` (Web & Mobile)
- Palette ciblée Afrique de l’Ouest (lumières fortes, densité d’infos)

---

## 🟢 Palette Principale

- **Vert BMS (sidebar/topbar)**: `#0F3D3A` (teal très sombre)
- **Vert primaire (actions)**: `#0D9488`
- **Vert foncé hover**: `#134E4A`
- **Jaune accent (sélection)**: `#F3C316`
- **Fond app**: `#F8FAFC`
- **Cartes**: `#FFFFFF`
- **Bordures**: `#E5E7EB`
- **Texte sombre**: `#0F172A`
- **Texte clair (sur fond sombre)**: `#F8FAFC`

États:
- **Succès**: `#22C55E` (bg: `#DCFCE7`)
- **Avertissement**: `#F59E0B` (bg: `#FEF3C7`)
- **Erreur**: `#EF4444` (bg: `#FEE2E2`)
- **Info**: `#3B82F6` (bg: `#DBEAFE`)

Tous les détails sont dans `design/tokens.ts`.

---

## 🧱 Composants & Layout

- **Sidebar** (fixe 264px)
  - Fond: `colors.component.sidebarBg`
  - Item actif: fond `transparent`, **pastille jaune** `colors.component.sidebarActive` (bordure/indicateur)
  - Hover: `colors.component.sidebarHover`
- **Topbar**
  - Fond gradient sombre, **barre de recherche** centrée
  - Actions à droite: bouton primaire vert, icônes
- **Cartes KPI**
  - Contour subtil `colors.surface.border`, ombre `shadows.sm`
  - Titres gris `colors.text.subtle`, valeur forte (vert/rouge)
- **Tableaux**
  - Header fond `colors.surface.muted`, corps lignes zébrées légères
  - Badges d’état (success/warning/danger)
- **Tabs**
  - Soulignement vert, actif bold
- **Graphiques** (barres/ligne)
  - Recettes: vert `#16A34A`
  - Dépenses: rouge `#DC2626`
  - Bénéfice: bleu `#2563EB`

---

## 🌐 Web (Next.js + Tailwind + shadcn/ui)

1) Installer Tailwind & shadcn/ui (quand le repo `bms-web/` sera créé)
2) Mapper les tokens au thème Tailwind

```ts
// tailwind.config.ts
import { colors } from "../design/tokens";
export default {
  darkMode: ['class'],
  content: ['src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: colors.surface.background,
          card: colors.surface.card,
          border: colors.surface.border,
          sidebar: colors.component.sidebarBg,
          topbar: colors.component.topbarBg,
          accent: colors.brand.yellow[500],
          primary: colors.brand.green[500],
        },
        success: colors.semantic.success[500],
        warning: colors.semantic.warning[500],
        danger: colors.semantic.danger[500],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(2, 6, 23, 0.08), 0 1px 2px rgba(2, 6, 23, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

3) Layout de base

```tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-app-bg text-slate-900">
      <aside className="fixed left-0 top-0 h-full w-[264px] bg-app-sidebar text-white">
        {/* Logo BMS + Nav */}
      </aside>
      <div className="ml-[264px]">
        <header className="h-14 bg-app-topbar text-white flex items-center px-6">
          {/* Search + Actions */}
        </header>
        <main className="p-6 max-w-[1280px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

4) Cartes KPI

```tsx
function KpiCard({ title, value, hint, tone = 'default' }) {
  const tones = {
    default: 'text-slate-900',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
  } as const;
  return (
    <div className="bg-white border border-app-border rounded-md shadow-sm p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}
```

---

## 📱 Mobile (React Native + Paper + NativeWind)

1) Créer un thème Paper depuis les tokens

```ts
// app/theme/paperTheme.ts
import { colors } from '../../design/tokens';
export const paperTheme = {
  dark: false,
  roundness: 8,
  colors: {
    primary: colors.brand.green[500],
    accent: colors.brand.yellow[500],
    background: colors.surface.background,
    surface: colors.surface.card,
    text: '#0F172A',
    placeholder: '#94A3B8',
    error: '#EF4444',
  },
};
```

2) NativeWind config

```ts
// tailwind.config.js (RN)
const { colors } = require('../design/tokens');
module.exports = {
  content: ['app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: { bg: colors.surface.background, sidebar: colors.component.sidebarBg },
        primary: colors.brand.green[500],
        accent: colors.brand.yellow[500],
      },
    },
  },
};
```

3) Sidebar mobile (drawer) + Topbar (search) + Cartes

---

## ✅ Pages à respecter (Web & Mobile)

- **Tableau de bord**: 3 KPI + graphique (Flux trésorerie)
- **Factures Clients**: liste/table + filtres + actions
- **Trésorerie**: onglets (aperçu, transactions, rapprochement, comptes, flux)
- **Transactions**: liste + résumé (revenus, dépenses, solde)
- **Créances & Dettes**: balance clients/fournisseurs + badges état
- **Analyse Financière**: graphiques multiseries
- **Fiscalité**: calendrier fiscal + cartes guides + liens DGI
- **Formation**: ressources

---

## 🔜 Prochaine étape

- Scaffolder `bms-web/` et `bms-mobile/`
- Intégrer `design/tokens.ts`
- Construire **Sidebar**, **Topbar**, **KPI Cards**, **Table**, **Tabs**, **Charts**

Ce thème est prêt pour implémentation immédiate sur Web & Mobile.
