# 🎨 Charte Graphique BMS

## 📋 Informations Générales

**Nom du projet**: BMS (Business Management System)  
**Version**: 1.0.0  
**Style**: Moderne, Professionnel, Épuré

---

## 🎨 Palette de Couleurs

### Couleurs Principales

| Couleur | Hex | Usage | Aperçu |
|---------|-----|-------|--------|
| **Primary (Teal)** | `#0D9488` | Boutons principaux, liens, accents | 🟦 |
| **Primary Hover** | `#0F766E` | État hover des boutons | 🟦 |
| **Sidebar** | `#0F3D3A` | Barre latérale, navigation | 🟩 |
| **Sidebar Hover** | `#134E4A` | Hover menu sidebar | 🟩 |
| **Accent** | `#F3C316` | Éléments d'accentuation | 🟨 |

### Couleurs de Fond

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Background** | `#F8FAFC` | Fond principal de l'application |
| **Card** | `#FFFFFF` | Fond des cartes et conteneurs |
| **Border** | `#E5E7EB` | Bordures des éléments |

### Couleurs d'État

| État | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Messages de succès, validations |
| **Warning** | `#F59E0B` | Avertissements, alertes |
| **Danger** | `#EF4444` | Erreurs, suppressions |
| **Info** | `#3B82F6` | Informations |

### Couleurs Sémantiques

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Emerald** | `#16A34A` | Recettes, positif |
| **Rose** | `#DC2626` | Dépenses, négatif |
| **Blue** | `#2563EB` | Informations, liens |
| **Amber** | `#F59E0B` | Alertes, en attente |
| **Purple** | `#9333EA` | Spécial, premium |

---

## 📝 Typographie

### Police Principale
- **Famille**: Inter, ui-sans-serif, system-ui, sans-serif
- **Source**: Google Fonts / System
- **Fallback**: system-ui, sans-serif

### Tailles de Police

| Usage | Taille | Poids | Exemple |
|-------|--------|-------|---------|
| **H1** | 30px (1.875rem) | 700 (Bold) | Titres de page |
| **H2** | 24px (1.5rem) | 600 (Semibold) | Sous-titres |
| **H3** | 20px (1.25rem) | 600 (Semibold) | Titres de section |
| **Body** | 16px (1rem) | 400 (Regular) | Texte principal |
| **Small** | 14px (0.875rem) | 400 (Regular) | Texte secondaire |
| **Tiny** | 12px (0.75rem) | 400 (Regular) | Labels, badges |

### Poids de Police
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

---

## 🔲 Composants UI

### Boutons

#### Bouton Principal
```css
background: #0D9488
color: #FFFFFF
padding: 12px 24px
border-radius: 8px
font-weight: 600
hover: #0F766E
```

#### Bouton Secondaire
```css
background: #FFFFFF
color: #0D9488
border: 1px solid #E5E7EB
padding: 12px 24px
border-radius: 8px
hover: #F8FAFC
```

#### Bouton Danger
```css
background: #EF4444
color: #FFFFFF
padding: 12px 24px
border-radius: 8px
hover: #DC2626
```

### Cards (Cartes)

```css
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
box-shadow: 0 1px 3px rgba(2, 6, 23, 0.08)
padding: 16px
```

### Inputs (Champs de saisie)

```css
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
padding: 10px 12px
font-size: 14px
focus: border-color #0D9488
```

### Badges

#### Success
```css
background: #ECFDF5 (emerald-50)
color: #047857 (emerald-700)
padding: 4px 8px
border-radius: 6px
font-size: 12px
```

#### Warning
```css
background: #FEF3C7 (amber-50)
color: #B45309 (amber-700)
padding: 4px 8px
border-radius: 6px
```

#### Danger
```css
background: #FEE2E2 (rose-50)
color: #B91C1C (rose-700)
padding: 4px 8px
border-radius: 6px
```

---

## 📐 Espacements

### Padding Standard
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

### Margin Standard
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

### Gap (Espacement entre éléments)
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px

---

## 🎯 Bordures

### Border Radius
- **SM**: 4px
- **MD**: 8px (par défaut)
- **LG**: 12px
- **XL**: 16px
- **Full**: 9999px (cercle)

### Border Width
- **Default**: 1px
- **Medium**: 2px
- **Thick**: 4px

---

## 🌑 Ombres

### Shadow Small
```css
box-shadow: 0 1px 3px rgba(2, 6, 23, 0.08), 
            0 1px 2px rgba(2, 6, 23, 0.04)
```

### Shadow Medium
```css
box-shadow: 0 4px 6px rgba(2, 6, 23, 0.08), 
            0 2px 4px rgba(2, 6, 23, 0.06)
```

### Shadow Large
```css
box-shadow: 0 10px 15px rgba(2, 6, 23, 0.1), 
            0 4px 6px rgba(2, 6, 23, 0.05)
```

---

## 🎨 Dégradés

### Gradient Primary
```css
background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%)
```

### Gradient Success
```css
background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%)
```

### Gradient Warning
```css
background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%)
```

---

## 📱 Layout

### Sidebar
- **Largeur**: 264px (20px en mode réduit)
- **Couleur**: #0F3D3A
- **Position**: Fixe à gauche

### Topbar
- **Hauteur**: 64px
- **Couleur**: #0F3D3A
- **Position**: Fixe en haut

### Container Principal
- **Max Width**: 1280px
- **Padding**: 24px
- **Margin**: Auto (centré)

---

## 🎯 États Interactifs

### Hover
- **Opacité**: 90%
- **Transition**: 200ms ease
- **Couleur**: Légèrement plus foncée

### Focus
- **Border**: 2px solid #0D9488
- **Outline**: none
- **Box Shadow**: 0 0 0 3px rgba(13, 148, 136, 0.1)

### Active
- **Transform**: scale(0.98)
- **Transition**: 100ms ease

### Disabled
- **Opacité**: 50%
- **Cursor**: not-allowed
- **Background**: #F3F4F6

---

## 📊 Graphiques

### Couleurs des Graphiques
1. **Primary**: #0D9488 (Teal)
2. **Secondary**: #3B82F6 (Blue)
3. **Success**: #22C55E (Green)
4. **Warning**: #F59E0B (Amber)
5. **Danger**: #EF4444 (Red)
6. **Purple**: #9333EA
7. **Pink**: #EC4899
8. **Orange**: #F97316

---

## 🎨 Classes CSS Personnalisées

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(2, 6, 23, 0.08);
}
```

### Badges
```css
.badge-success {
  background: #ECFDF5;
  color: #047857;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.badge-warning {
  background: #FEF3C7;
  color: #B45309;
}

.badge-danger {
  background: #FEE2E2;
  color: #B91C1C;
}
```

---

## 🌐 Responsive

### Breakpoints
- **SM**: 640px (Mobile)
- **MD**: 768px (Tablet)
- **LG**: 1024px (Desktop)
- **XL**: 1280px (Large Desktop)
- **2XL**: 1536px (Extra Large)

---

## ♿ Accessibilité

### Contraste
- **Texte sur fond clair**: Ratio minimum 4.5:1
- **Texte large**: Ratio minimum 3:1
- **Éléments interactifs**: Ratio minimum 3:1

### Focus Visible
- Toujours visible au clavier
- Couleur: #0D9488
- Épaisseur: 2px

---

## 🎯 Icônes

### Bibliothèque
- **Lucide React** (principale)
- **Taille par défaut**: 20px
- **Stroke Width**: 2px

### Tailles d'Icônes
- **XS**: 16px
- **SM**: 20px
- **MD**: 24px
- **LG**: 32px
- **XL**: 48px

---

## 📝 Exemples d'Utilisation

### Bouton Principal
```tsx
<button className="bg-app-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-[#0F766E] transition-colors">
  Enregistrer
</button>
```

### Card
```tsx
<div className="card p-6">
  <h3 className="text-lg font-semibold mb-4">Titre</h3>
  <p className="text-slate-600">Contenu</p>
</div>
```

### Badge Success
```tsx
<span className="badge-success">
  Actif
</span>
```

---

## 🎨 Palette Complète (Tailwind)

### Slate (Gris)
- 50: #F8FAFC
- 100: #F1F5F9
- 200: #E2E8F0
- 300: #CBD5E1
- 400: #94A3B8
- 500: #64748B
- 600: #475569
- 700: #334155
- 800: #1E293B
- 900: #0F172A

### Teal (Primary)
- 50: #F0FDFA
- 100: #CCFBF1
- 200: #99F6E4
- 300: #5EEAD4
- 400: #2DD4BF
- 500: #14B8A6
- 600: #0D9488 ⭐ (Primary)
- 700: #0F766E
- 800: #115E59
- 900: #134E4A

---

**Version**: 1.0.0  
**Dernière mise à jour**: Janvier 2025  
**Framework**: Tailwind CSS 3.x
