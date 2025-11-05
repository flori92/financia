# 🐼 Guide d'utilisation - Composant UnauthorizedAccess

## 🎯 Vue d'ensemble

Le composant `UnauthorizedAccess` affiche **Po le Panda qui pleure** lorsqu'un utilisateur tente d'accéder à une ressource non autorisée. C'est une UX créative et sympathique pour gérer les erreurs d'autorisation.

## 📂 Emplacement des fichiers

```
railway-deploy/frontend/src/
├── components/
│   ├── UnauthorizedAccess.tsx           # Composant principal
│   └── UnauthorizedAccess.README.md     # Documentation complète
├── hooks/
│   └── useUnauthorized.ts               # Hooks personnalisés
└── app/
    └── test-unauthorized/
        └── page.tsx                     # Page de test et démo
```

## 🚀 Démarrage Rapide

### 1. Tester le composant

Lancez le frontend et visitez la page de test :

```bash
cd railway-deploy/frontend
npm run dev
```

Puis ouvrez : **http://localhost:3000/test-unauthorized**

### 2. Utilisation de base

```tsx
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useState } from "react";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleProtectedAction = () => {
    // Vérifier les permissions
    const hasPermission = checkUserPermissions();
    
    if (!hasPermission) {
      setShowModal(true);
      return;
    }
    
    // Exécuter l'action protégée
    doSomething();
  };

  return (
    <>
      <button onClick={handleProtectedAction}>
        Action Protégée
      </button>

      <UnauthorizedAccess
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredRoles={["Admin", "Manager"]}
        currentRole="Employé"
        resourceName="cette fonctionnalité"
      />
    </>
  );
}
```

### 3. Avec les Hooks (Recommandé)

```tsx
import { useProtectedAction } from "@/hooks/useUnauthorized";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function MyComponent() {
  const userRoles = ["Employé"]; // Depuis votre auth context
  
  const { executeAction, unauthorized } = useProtectedAction(
    userRoles,
    ["Admin", "Manager"],
    "cette fonctionnalité"
  );

  return (
    <>
      <button
        onClick={() => executeAction(() => {
          // Cette action ne s'exécute que si autorisé
          console.log("Action exécutée !");
        })}
      >
        Action Protégée
      </button>

      <UnauthorizedAccess
        isOpen={unauthorized.isOpen}
        onClose={unauthorized.hideUnauthorized}
        requiredRoles={unauthorized.requiredRoles}
        currentRole={unauthorized.currentRole}
        resourceName={unauthorized.resourceName}
      />
    </>
  );
}
```

## 🎨 Features du Composant

### Po le Panda Animé 🐼
- ✅ SVG 100% custom (aucune image externe)
- 😢 Larmes qui tombent en continu
- 💔 Bouche triste qui pulse
- 🎈 Flotte de haut en bas
- 🌊 Tremble légèrement
- 🎨 Arrière-plan dégradé vert BMS

### Popup Élégante 📋
- 🔒 Icône cadenas orange
- 📝 Message personnalisé
- 🏷️ Affichage des rôles requis
- 💬 Info box pour contacter l'admin
- 🔘 Boutons: "Retour" et "Contacter l'admin"
- ❌ Bouton de fermeture (X)
- 📱 100% responsive

### 3 Styles de Backdrop 🎨

Le composant propose 3 variantes de fond :

#### 1. **Blur** (Défaut)
- Page en arrière-plan floue (20px)
- Dégradé vert BMS transparent
- ⭐ Recommandé pour la plupart des cas

```tsx
<UnauthorizedAccess backdropVariant="blur" />
```

#### 2. **Gradient**
- Dégradé vert BMS semi-opaque (75-85%)
- Branding fort
- Idéal pour identité visuelle marquée

```tsx
<UnauthorizedAccess backdropVariant="gradient" />
```

#### 3. **Solid**
- Fond vert BMS opaque (95%)
- Page complètement masquée
- Idéal pour blocage critique

```tsx
<UnauthorizedAccess backdropVariant="solid" />
```

## 📖 Props Disponibles

| Prop | Type | Description | Exemple |
|------|------|-------------|---------|
| `isOpen` | `boolean` | Affiche/cache le modal | `true` |
| `onClose` | `() => void` | Callback de fermeture | `() => setOpen(false)` |
| `requiredRoles` | `string[]` | Rôles nécessaires | `["Admin", "Manager"]` |
| `currentRole` | `string` | Rôle de l'utilisateur | `"Employé"` |
| `resourceName` | `string` | Nom de la ressource | `"cette page"` |
| `backdropVariant` | `'blur' \| 'gradient' \| 'solid'` | Style de fond | `"blur"` |
| `onContactAdmin` | `() => void` | Action custom admin | `() => sendEmail()` |

## 🎯 Cas d'Usage Pratiques

### Protéger une Page Entière

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUnauthorized } from "@/hooks/useUnauthorized";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

export default function AdminPage() {
  const router = useRouter();
  const unauthorized = useUnauthorized();
  const userRole = "Employé"; // Depuis auth context

  useEffect(() => {
    if (userRole !== "Admin") {
      unauthorized.showUnauthorized({
        requiredRoles: ["Admin"],
        currentRole: userRole,
        resourceName: "la page d'administration",
      });
    }
  }, [userRole]);

  if (userRole !== "Admin") {
    return (
      <UnauthorizedAccess
        isOpen={unauthorized.isOpen}
        onClose={() => {
          unauthorized.hideUnauthorized();
          router.push("/");
        }}
        {...unauthorized}
      />
    );
  }

  return <div>Contenu Admin...</div>;
}
```

### Protéger un Bouton d'Action

```tsx
import { Trash2 } from "lucide-react";
import { useProtectedAction } from "@/hooks/useUnauthorized";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function DeleteButton({ itemId }: { itemId: string }) {
  const userRoles = ["Manager"];
  
  const { executeAction, unauthorized } = useProtectedAction(
    userRoles,
    ["Admin"],
    "la suppression"
  );

  return (
    <>
      <button
        onClick={() => executeAction(() => deleteItem(itemId))}
        className="btn-danger"
      >
        <Trash2 /> Supprimer
      </button>

      <UnauthorizedAccess {...unauthorized} />
    </>
  );
}
```

### Intégration avec Guards de Route

```tsx
// middleware.ts ou dans un HOC
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get("userRole")?.value;
  const path = request.nextUrl.pathname;

  // Routes protégées
  const protectedRoutes = {
    "/admin": ["Admin"],
    "/rh": ["RH Manager", "Admin"],
    "/comptable": ["Expert Comptable", "Admin"],
  };

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route) && !roles.includes(userRole || "")) {
      // Rediriger vers une page avec le composant UnauthorizedAccess
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}
```

## 🎭 Scénarios de Test Disponibles

Sur `/test-unauthorized`, vous pouvez tester 5 scénarios :

1. **Accès Admin requis** - Administrateur Système uniquement
2. **Accès RH Manager** - RH Manager ou Admin
3. **Accès Expert Comptable** - Expert Comptable ou Admin
4. **Accès Banking** - Banque Partenaire ou Trésorier
5. **Multi-rôles requis** - Plusieurs rôles nécessaires

## 🔧 Personnalisation

### Modifier les Couleurs

```tsx
// Dans UnauthorizedAccess.tsx
// Remplacer #0D9488 par votre couleur de marque
bg-[#0D9488]  →  bg-[#VOTRE_COULEUR]
```

### Modifier l'Animation de Po

```css
/* Dans le style JSX */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }  /* Augmenter pour plus de flottement */
}
```

### Personnaliser les Larmes

```tsx
<animate
  attributeName="cy"
  values="90;160;90"  /* Modifier pour changer la chute */
  dur="1.5s"          /* Modifier pour vitesse */
  repeatCount="indefinite"
/>
```

## 📊 Performance

- **Taille** : ~8 KB non compressé
- **Dépendances** : Aucune librairie externe
- **Animations** : CSS natives (GPU accelerated)
- **SVG** : Inline, pas de requête HTTP
- **Rendu** : Très performant (O(1))

## 🐛 Troubleshooting

### Le modal ne s'ouvre pas
```tsx
// Vérifier que isOpen est true
console.log("Modal state:", isOpen);
```

### Le scroll ne se bloque pas
```tsx
// Le composant gère automatiquement overflow: hidden
// Vérifier qu'aucun autre composant ne surcharge le style
```

### Les animations ne fonctionnent pas
```tsx
// Vérifier que les @keyframes sont bien compilés
// Si nécessaire, extraire vers un fichier CSS
```

## 📚 Ressources

- **Documentation complète** : `UnauthorizedAccess.README.md`
- **Hooks** : `useUnauthorized.ts`
- **Tests** : `/test-unauthorized`
- **Exemples** : Dans la page de test

## 🎯 Checklist d'Intégration

- [ ] Tester sur `/test-unauthorized`
- [ ] Intégrer dans votre système d'auth
- [ ] Définir les rôles de l'application
- [ ] Implémenter les guards de route
- [ ] Tester sur mobile/tablet/desktop
- [ ] Personnaliser les messages
- [ ] Configurer l'action "Contacter l'admin"
- [ ] Tester l'accessibilité (clavier)

## 🤝 Support

Pour toute question ou amélioration :
1. Consulter `UnauthorizedAccess.README.md`
2. Tester sur `/test-unauthorized`
3. Vérifier les exemples de code

---

**Créé avec ❤️ et 🐼 pour BMS ERP**
