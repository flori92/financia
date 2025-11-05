# 🐼 Composant UnauthorizedAccess avec Po le Panda

Un composant React élégant et interactif pour gérer les erreurs d'autorisation avec Po de Kung Fu Panda qui pleure.

## 🎨 Fonctionnalités

### Po le Panda Animé
- ✅ **SVG 100% custom** - Aucune image externe requise
- 😢 **Larmes animées** - Tombent en continu avec effet de fondu
- 💔 **Bouche triste** - Pulse doucement pour exprimer la tristesse
- 🎈 **Flottement** - Monte et descend doucement
- 🌊 **Tremblement** - Léger shake pour simuler les sanglots
- 🎨 **Dégradé vert BMS** - Arrière-plan aux couleurs de la marque

### Popup d'Accès Refusé
- 📜 **Carte blanche élégante** - Ombre douce et arrondie
- 🔒 **Icône cadenas orange** - Visuellement claire
- 📝 **Message personnalisable** - Adapté à chaque ressource
- 🏷️ **Badges de rôles** - Affiche clairement les permissions
- 💬 **Info box bleue** - Guide l'utilisateur vers l'admin
- ⌨️ **Accessible** - Support clavier et lecteurs d'écran
- 📱 **Responsive** - Fonctionne sur tous les écrans

## 📦 Installation

Le composant est déjà disponible dans :
```
railway-deploy/frontend/src/components/UnauthorizedAccess.tsx
```

## 🚀 Utilisation de Base

```tsx
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { useState } from "react";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Accéder à une ressource protégée
      </button>

      <UnauthorizedAccess
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredRoles={["Admin", "Manager"]}
        currentRole="Employé"
        resourceName="cette page"
      />
    </>
  );
}
```

## 🎯 Props

| Prop | Type | Requis | Défaut | Description |
|------|------|--------|--------|-------------|
| `isOpen` | `boolean` | ✅ | - | Contrôle la visibilité du modal |
| `onClose` | `() => void` | ✅ | - | Callback appelé à la fermeture |
| `requiredRoles` | `string[]` | ❌ | `["Admin", "Manager"]` | Rôles requis pour la ressource |
| `currentRole` | `string` | ❌ | `"Employé"` | Rôle actuel de l'utilisateur |
| `resourceName` | `string` | ❌ | `"cette page ou cette fonctionnalité"` | Nom de la ressource protégée |
| `onContactAdmin` | `() => void` | ❌ | Email par défaut | Action personnalisée pour contacter l'admin |
| `backdropVariant` | `'blur' \| 'gradient' \| 'solid'` | ❌ | `'blur'` | Style de fond derrière le modal |

## 🔧 Avec les Hooks Personnalisés

### Hook `useUnauthorized`

```tsx
import { useUnauthorized } from "@/hooks/useUnauthorized";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function MyComponent() {
  const unauthorized = useUnauthorized();

  const handleProtectedAction = () => {
    // Vérifier les permissions...
    if (!hasPermission) {
      unauthorized.showUnauthorized({
        requiredRoles: ["Admin"],
        currentRole: "Employé",
        resourceName: "la configuration système",
      });
      return;
    }
    
    // Exécuter l'action...
  };

  return (
    <>
      <button onClick={handleProtectedAction}>
        Modifier la configuration
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

### Hook `useProtectedAction`

```tsx
import { useProtectedAction } from "@/hooks/useUnauthorized";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function MyComponent() {
  const userRoles = ["Employé"]; // Depuis le context ou auth
  
  const { executeAction, unauthorized } = useProtectedAction(
    userRoles,
    ["Admin", "Manager"],
    "cette fonctionnalité"
  );

  return (
    <>
      <button
        onClick={() => executeAction(() => {
          console.log("Action protégée exécutée !");
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

## 🎭 Exemples Pratiques

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
  const userRole = "Employé"; // Depuis votre auth context

  useEffect(() => {
    if (userRole !== "Admin") {
      unauthorized.showUnauthorized({
        requiredRoles: ["Admin"],
        currentRole: userRole,
        resourceName: "la page d'administration",
      });
    }
  }, [userRole]);

  return (
    <>
      <div>Contenu Admin...</div>
      
      <UnauthorizedAccess
        isOpen={unauthorized.isOpen}
        onClose={() => {
          unauthorized.hideUnauthorized();
          router.push("/"); // Rediriger vers l'accueil
        }}
        requiredRoles={unauthorized.requiredRoles}
        currentRole={unauthorized.currentRole}
        resourceName={unauthorized.resourceName}
      />
    </>
  );
}
```

### Protéger un Bouton d'Action

```tsx
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useProtectedAction } from "@/hooks/useUnauthorized";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function DeleteButton({ itemId }: { itemId: string }) {
  const userRoles = ["Manager"]; // Depuis auth
  
  const { executeAction, unauthorized } = useProtectedAction(
    userRoles,
    ["Admin"],
    "la suppression de cet élément"
  );

  const handleDelete = () => {
    executeAction(async () => {
      await deleteItem(itemId);
      console.log("Élément supprimé !");
    });
  };

  return (
    <>
      <button onClick={handleDelete} className="btn-danger">
        <Trash2 className="w-4 h-4" />
        Supprimer
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

### Avec Action Admin Personnalisée

```tsx
import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleContactAdmin = async () => {
    // Action personnalisée
    await fetch("/api/request-access", {
      method: "POST",
      body: JSON.stringify({
        resource: "Configuration",
        message: "Je souhaite accéder à cette fonctionnalité",
      }),
    });
    
    alert("Demande envoyée !");
    setShowModal(false);
  };

  return (
    <UnauthorizedAccess
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      requiredRoles={["Admin"]}
      currentRole="Employé"
      resourceName="la configuration système"
      onContactAdmin={handleContactAdmin}
    />
  );
}
```

## 🧪 Page de Test

Visitez `/test-unauthorized` pour voir tous les scénarios de test :

```bash
http://localhost:3000/test-unauthorized
```

La page de test inclut :
- ✅ 5 scénarios préconfigurés
- ✅ Différents rôles et ressources
- ✅ Exemple de code
- ✅ Documentation intégrée

## 🎨 Personnalisation

### Modifier les Couleurs

Le composant utilise les couleurs BMS (`#0D9488`). Pour les modifier :

```tsx
// Dans UnauthorizedAccess.tsx, rechercher et remplacer :
bg-[#0D9488]  →  bg-[VOTRE_COULEUR]
text-[#0D9488]  →  text-[VOTRE_COULEUR]
```

### Modifier l'Animation de Po

```tsx
// Dans le style JSX
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }  // Modifier la hauteur
}
```

### Personnaliser les Larmes

```tsx
// Dans le SVG
<ellipse cx="65" cy="90" rx="4" ry="6">
  <animate
    attributeName="cy"
    values="90;140;90"  // Modifier la trajectoire
    dur="2s"            // Modifier la vitesse
    repeatCount="indefinite"
  />
</ellipse>
```

## 🔒 Intégration avec l'Authentification

```tsx
// context/AuthContext.tsx
import { createContext, useContext } from 'react';

interface AuthContextType {
  user: {
    roles: string[];
    profile: string;
  } | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
});

// Dans vos composants
function ProtectedComponent() {
  const { user } = useContext(AuthContext);
  const unauthorized = useUnauthorized();

  const checkAccess = () => {
    if (!user || !user.roles.includes("Admin")) {
      unauthorized.showUnauthorized({
        requiredRoles: ["Admin"],
        currentRole: user?.profile || "Visiteur",
        resourceName: "cette fonctionnalité",
      });
      return false;
    }
    return true;
  };

  // ...
}
```

## 📊 Performance

- **Taille** : ~8 KB (non compressé)
- **SVG** : 100% inline, pas de requête HTTP
- **Animations** : CSS natives, pas de JavaScript
- **Rendu** : O(1), pas de dépendances lourdes

## 🐛 Dépannage

### Le modal ne s'affiche pas

Vérifiez que `isOpen` est bien `true` :
```tsx
console.log("Modal open?", isOpen);
```

### Les animations ne fonctionnent pas

Vérifiez que les styles `jsx` sont bien compilés. Si nécessaire, utilisez un fichier CSS séparé.

### Le scroll ne se bloque pas

Le composant gère automatiquement `overflow: hidden` sur le body. Vérifiez qu'aucun autre composant n'interfère.

## 🎨 Variantes de Backdrop

Le composant propose 3 styles de fond différents via la prop `backdropVariant` :

### 1. **Blur** (Défaut) - Page floue

```tsx
<UnauthorizedAccess
  backdropVariant="blur"
  // ... autres props
/>
```

**Caractéristiques** :
- ✅ Page en arrière-plan floue (20px de flou)
- ✅ Dégradé vert BMS transparent (40-30% opacité)
- ✅ Saturation augmentée (180%)
- ✅ Meilleure lisibilité du contenu
- 🎯 **Recommandé** pour la plupart des cas

**Effet visuel** :
```
Flou de 20px + Dégradé vert transparent
→ On voit la page derrière mais floue
→ Focus sur le modal
```

### 2. **Gradient** - Dégradé vert semi-transparent

```tsx
<UnauthorizedAccess
  backdropVariant="gradient"
  // ... autres props
/>
```

**Caractéristiques** :
- ✅ Dégradé vert BMS semi-opaque (75-85% opacité)
- ✅ Pas de flou, juste une couche colorée
- ✅ Couleurs BMS très visibles
- 🎨 Idéal pour une **identité visuelle forte**

**Effet visuel** :
```
Dégradé vert #0D9488 → emerald → teal
→ Page masquée par le dégradé
→ Branding BMS très présent
```

### 3. **Solid** - Fond vert opaque

```tsx
<UnauthorizedAccess
  backdropVariant="solid"
  // ... autres props
/>
```

**Caractéristiques** :
- ✅ Fond vert BMS presque opaque (95% opacité)
- ✅ Page complètement masquée
- ✅ Focus total sur le modal
- 🔒 Idéal pour **bloquer complètement l'accès**

**Effet visuel** :
```
Fond vert solide #0D9488 → emerald-700
→ Page complètement cachée
→ Attention maximale sur le message
```

### Comparaison Visuelle

| Variante | Opacité | Flou | Visibilité page | Branding | Usage recommandé |
|----------|---------|------|-----------------|----------|------------------|
| **blur** | 30-40% | 20px | ⭐⭐⭐ | ⭐⭐ | Général |
| **gradient** | 75-85% | Non | ⭐ | ⭐⭐⭐ | Branding fort |
| **solid** | 95% | Non | ❌ | ⭐⭐⭐ | Accès critique bloqué |

### Exemple avec Choix Dynamique

```tsx
function MyApp() {
  const [backdropStyle, setBackdropStyle] = useState<'blur' | 'gradient' | 'solid'>('blur');
  
  // Changer le style selon le contexte
  const handleCriticalAction = () => {
    setBackdropStyle('solid'); // Blocage complet
    showUnauthorized();
  };
  
  return (
    <UnauthorizedAccess
      isOpen={isOpen}
      onClose={onClose}
      backdropVariant={backdropStyle}
      {...otherProps}
    />
  );
}
```

## 🤝 Contribution

Pour améliorer le composant :
1. Modifier `UnauthorizedAccess.tsx`
2. Tester sur `/test-unauthorized`
3. Mettre à jour cette documentation
4. Commiter avec un message clair

## 📜 License

Propriété de BMS ERP - Tous droits réservés

---

**Créé avec ❤️ et 🐼 par l'équipe BMS ERP**
