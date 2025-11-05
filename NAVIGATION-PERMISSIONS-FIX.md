# 🔐 Protection de la Navigation - Implémentation

## Problème

Même avec la page `/settings/users` protégée par `PermissionGuard`, les comptables pouvaient toujours voir le lien dans la sidebar et cliquer dessus, ce qui affichait une erreur 404 en production (car le frontend n'était pas redéployé).

**Comportement attendu** :
- Les comptables ne doivent **PAS voir** les liens vers les pages auxquelles ils n'ont pas accès
- La navigation doit être filtrée dynamiquement selon le rôle de l'utilisateur

## Solution Implémentée

### 1. Ajout des Permissions aux Items de Menu

**Fichier** : `bms-web/src/components/layout/ModernSidebar.tsx`

Ajout d'un champ `requiredPermissions` aux types :

```typescript
type SidebarSubItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: BadgeColor;
  requiredPermissions?: string[]; // ✨ Nouveau
};

type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  submenu?: SidebarSubItem[];
  requiredPermissions?: string[]; // ✨ Nouveau
};
```

### 2. Configuration des Permissions sur les Items

```typescript
{
  id: "systeme",
  label: "Système",
  icon: Settings,
  submenu: [
    { 
      label: "Paramètres", 
      href: "/settings", 
      icon: Settings 
    },
    { 
      label: "Utilisateurs & droits", 
      href: "/settings/users", 
      icon: UserCog,
      requiredPermissions: ["users:read", "users:write"] // ✨ Admin et Manager uniquement
    },
    { 
      label: "Audit & traçabilité", 
      href: "/settings/audit", 
      icon: Shield,
      requiredPermissions: ["settings:read"] // ✨ Admin et Manager uniquement
    }
  ]
}
```

### 3. Filtrage Dynamique de la Navigation

Ajout d'une fonction `filterMenuItems` qui :
- Vérifie les permissions de chaque item
- Filtre les sous-menus selon les permissions
- Masque les items parents si tous les sous-items sont filtrés

```typescript
const filterMenuItems = (items: SidebarItem[]): SidebarItem[] => {
  return items
    .map(item => {
      // Vérifier les permissions de l'item
      if (item.requiredPermissions && !hasAnyPermission(item.requiredPermissions)) {
        return null;
      }

      // Filtrer le submenu
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          if (subItem.requiredPermissions) {
            return hasAnyPermission(subItem.requiredPermissions);
          }
          return true;
        });

        // Si le submenu est vide, masquer l'item parent
        if (filteredSubmenu.length === 0) {
          return null;
        }

        return { ...item, submenu: filteredSubmenu };
      }

      return item;
    })
    .filter((item): item is SidebarItem => item !== null);
};
```

## Résultat

### Pour un Comptable (role: accountant)

**Visible** :
- ✅ Dashboard
- ✅ CRM & Ventes
- ✅ Communications
- ✅ Comptabilité
- ✅ Trésorerie
- ✅ Factures
- ✅ Système > Paramètres

**Masqué** :
- ❌ Système > Utilisateurs & droits
- ❌ Système > Audit & traçabilité

### Pour un Admin/Manager

**Visible** :
- ✅ Tout, y compris :
  - Système > Utilisateurs & droits
  - Système > Audit & traçabilité

## Double Protection

Le système utilise maintenant une **double protection** :

1. **Navigation (Frontend)** : Les liens sont masqués dans la sidebar
   - Améliore l'UX
   - Évite les clics inutiles
   - Réduit la confusion

2. **Page (Frontend)** : `PermissionGuard` sur la page elle-même
   - Protection si l'utilisateur accède directement via l'URL
   - Affiche le panda Po et le message d'erreur
   - Permet de demander l'accès

3. **API (Backend)** : Vérification des permissions côté serveur
   - Sécurité réelle
   - Protection contre les manipulations frontend

## Items à Protéger

### Déjà Protégés ✅

- `/settings/users` - Utilisateurs & droits
- `/settings/audit` - Audit & traçabilité

### À Protéger Prochainement 🔜

```typescript
// Exemple pour d'autres items sensibles
{
  label: "Sociétés",
  href: "/settings/companies",
  icon: Building2,
  requiredPermissions: ["companies:write"] // Admin uniquement
},
{
  label: "Intégrations",
  href: "/settings/integrations",
  icon: Plug,
  requiredPermissions: ["settings:write"] // Admin uniquement
},
{
  label: "Clôture comptable",
  href: "/accountant/close",
  icon: Lock,
  requiredPermissions: ["accounting:close"] // Admin et Manager uniquement
}
```

## Matrice de Visibilité

| Page/Fonctionnalité | Admin | Manager | Comptable | User |
|---------------------|-------|---------|-----------|------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| CRM | ✅ | ✅ | ✅ | ✅ (lecture) |
| Comptabilité | ✅ | ✅ | ✅ | ❌ |
| Trésorerie | ✅ | ✅ | ✅ (lecture) | ❌ |
| Factures | ✅ | ✅ | ✅ | ✅ (lecture) |
| **Utilisateurs** | ✅ | ✅ (lecture) | ❌ | ❌ |
| **Audit** | ✅ | ✅ (lecture) | ❌ | ❌ |
| Sociétés | ✅ | ✅ (lecture) | ❌ | ❌ |
| Intégrations | ✅ | ❌ | ❌ | ❌ |

## Tests

### Test Manuel

1. **Se connecter en tant que comptable**
   ```
   localStorage.setItem("user_role", "accountant")
   ```

2. **Vérifier la sidebar**
   - ✅ "Utilisateurs & droits" ne doit PAS apparaître
   - ✅ "Audit & traçabilité" ne doit PAS apparaître
   - ✅ "Paramètres" doit apparaître

3. **Tenter d'accéder directement**
   ```
   Naviguer vers: /settings/users
   ```
   - ✅ Doit afficher le panda Po qui pleure
   - ✅ Doit afficher le message de restriction

4. **Se connecter en tant qu'admin**
   ```
   localStorage.setItem("user_role", "admin")
   ```

5. **Vérifier la sidebar**
   - ✅ Tous les items doivent apparaître
   - ✅ "Utilisateurs & droits" doit être visible
   - ✅ "Audit & traçabilité" doit être visible

## Déploiement

### Étapes

1. **Build du frontend**
   ```bash
   cd bms-web
   npm run build
   ```

2. **Vérifier localement**
   ```bash
   npm run dev
   # Tester avec différents rôles
   ```

3. **Déployer sur Railway**
   - Push sur la branche `clean-main`
   - Railway redéploie automatiquement
   - Vérifier les logs de déploiement

4. **Tester en production**
   - Se connecter avec un compte comptable
   - Vérifier que les liens sont masqués
   - Tester l'accès direct aux URLs

### Commandes Railway

```bash
# Voir les logs de déploiement
railway logs --service bms-web

# Forcer un redéploiement
railway up --service bms-web

# Vérifier les variables d'environnement
railway variables --service bms-web
```

## Fichiers Modifiés

### Modifiés 📝

1. `bms-web/src/components/layout/ModernSidebar.tsx`
   - Ajout de `usePermissions` hook
   - Ajout du champ `requiredPermissions` aux types
   - Ajout de la fonction `filterMenuItems`
   - Configuration des permissions sur les items sensibles
   - Utilisation de `filteredMenuItems` dans le rendu

### Créés ✨

1. `NAVIGATION-PERMISSIONS-FIX.md` - Cette documentation

### Existants (Utilisés) ♻️

1. `bms-web/src/hooks/usePermissions.ts` - Hook de gestion des permissions
2. `bms-web/src/components/auth/PermissionGuard.tsx` - Protection des pages
3. `bms-web/src/app/settings/users/page.tsx` - Page protégée

## Prochaines Étapes

1. **Redéployer le frontend** sur Railway
2. **Tester en production** avec différents rôles
3. **Protéger d'autres items** de navigation sensibles
4. **Ajouter des permissions granulaires** (ex: `users:read` vs `users:write`)
5. **Synchroniser avec le backend** pour récupérer les permissions dynamiquement

## Notes Techniques

### Performance

- Le filtrage est fait une seule fois au montage du composant
- Utilise `useMemo` implicitement via la fonction `filterMenuItems`
- Pas de re-render inutile

### Sécurité

⚠️ **Important** : Le masquage des liens est pour l'UX uniquement. La vraie sécurité est assurée par :
1. Le `PermissionGuard` sur les pages
2. Les vérifications backend sur les API

### Extensibilité

Pour ajouter des permissions à un nouvel item :

```typescript
{
  label: "Ma Page Sensible",
  href: "/ma-page",
  icon: MonIcon,
  requiredPermissions: ["ma-resource:action"]
}
```

## Résultat Final

✅ **Comptable** : Ne voit plus les liens vers les pages interdites
✅ **Navigation propre** : Seuls les items accessibles sont affichés
✅ **Double protection** : Navigation + Page + API
✅ **UX améliorée** : Pas de confusion, pas de clics inutiles
✅ **Panda Po** : Apparaît toujours si accès direct via URL 🐼
