# 🔐 Système de Permissions - Implémentation

## Problème Identifié

La page `/settings/users` était accessible à tous les utilisateurs, y compris les comptables qui ne devraient pas avoir accès à la gestion des utilisateurs.

**Comportement attendu** : Un comptable qui accède à cette page devrait voir :
1. Une page de restriction d'accès
2. Le panda Po qui pleure 🐼
3. Un popup expliquant les permissions manquantes
4. Un bouton pour contacter l'administrateur

## Solution Implémentée

### 1. Hook `usePermissions`

**Fichier** : `bms-web/src/hooks/usePermissions.ts`

Ce hook gère les permissions basées sur les rôles :

```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions();
```

**Permissions par rôle** :

| Rôle | Permissions |
|------|-------------|
| **Admin** | Tous les droits (users, companies, settings, accounting, treasury, invoices, CRM) |
| **Manager** | Lecture users, toutes opérations sauf users:write/delete et settings:write |
| **Comptable** | Comptabilité, trésorerie, factures (lecture/écriture) |
| **User** | Factures et CRM (lecture uniquement) |

### 2. Composant `PermissionGuard`

**Fichier** : `bms-web/src/components/auth/PermissionGuard.tsx`

Composant wrapper pour protéger les pages et composants :

```typescript
<PermissionGuard
  requiredPermissions={["users:read", "users:write"]}
  requireAll={false}  // Au moins une permission suffit
  resource="la gestion des utilisateurs"
>
  <YourProtectedContent />
</PermissionGuard>
```

**Fonctionnalités** :
- ✅ Vérifie les permissions au chargement
- ✅ Affiche un message d'erreur si accès refusé
- ✅ Affiche le modal `UnauthorizedAccess` avec le panda Po
- ✅ Permet de personnaliser le message et les permissions requises

### 3. Page Users Protégée

**Fichier** : `bms-web/src/app/settings/users/page.tsx`

La page est maintenant protégée :

```typescript
export default function UsersPage() {
  return (
    <PermissionGuard
      requiredPermissions={["users:read", "users:write"]}
      requireAll={false}
      resource="la gestion des utilisateurs"
    >
      <UsersPageContent />
    </PermissionGuard>
  );
}
```

## Matrice des Permissions

### Format des Permissions

`resource:action`

Exemples :
- `users:read` - Lire les utilisateurs
- `users:write` - Créer/modifier les utilisateurs
- `users:delete` - Supprimer les utilisateurs
- `accounting:read` - Consulter la comptabilité
- `accounting:write` - Créer des écritures comptables

### Permissions Détaillées

#### Administrateur
```typescript
[
  "users:read", "users:write", "users:delete",
  "companies:read", "companies:write",
  "settings:read", "settings:write",
  "accounting:read", "accounting:write",
  "treasury:read", "treasury:write",
  "invoices:read", "invoices:write",
  "crm:read", "crm:write",
]
```

#### Manager
```typescript
[
  "users:read",  // Peut voir les utilisateurs mais pas les modifier
  "companies:read",
  "settings:read",
  "accounting:read", "accounting:write",
  "treasury:read", "treasury:write",
  "invoices:read", "invoices:write",
  "crm:read", "crm:write",
]
```

#### Comptable
```typescript
[
  "accounting:read", "accounting:write",
  "treasury:read",
  "invoices:read", "invoices:write",
]
```

#### Utilisateur
```typescript
[
  "invoices:read",
  "crm:read",
]
```

## Utilisation

### Protéger une Page Entière

```typescript
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function MyProtectedPage() {
  return (
    <PermissionGuard
      requiredPermissions={["accounting:write"]}
      resource="la création d'écritures comptables"
    >
      <MyPageContent />
    </PermissionGuard>
  );
}
```

### Protéger un Composant ou une Section

```typescript
<PermissionGuard
  requiredPermissions={["users:delete"]}
  resource="la suppression d'utilisateurs"
  fallback={<div>Vous ne pouvez pas supprimer d'utilisateurs</div>}
>
  <DeleteButton />
</PermissionGuard>
```

### Vérifier les Permissions dans le Code

```typescript
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { hasPermission, isAdmin } = usePermissions();

  if (hasPermission("users:write")) {
    return <EditUserButton />;
  }

  if (isAdmin()) {
    return <AdminPanel />;
  }

  return <ReadOnlyView />;
}
```

### Permissions Multiples

```typescript
// Au moins UNE permission requise (OR)
<PermissionGuard
  requiredPermissions={["users:read", "users:write"]}
  requireAll={false}
>
  <UsersList />
</PermissionGuard>

// TOUTES les permissions requises (AND)
<PermissionGuard
  requiredPermissions={["accounting:read", "accounting:write"]}
  requireAll={true}
>
  <CreateJournalEntry />
</PermissionGuard>
```

## Pages à Protéger

### Priorité Haute 🔴

- [x] `/settings/users` - Gestion des utilisateurs
- [ ] `/settings/companies` - Gestion des sociétés
- [ ] `/settings/integrations` - Intégrations
- [ ] `/settings/audit` - Logs d'audit

### Priorité Moyenne 🟡

- [ ] `/accountant/close` - Clôture comptable
- [ ] `/accountant/validation` - Validation des écritures
- [ ] `/treasury/operations` - Opérations de trésorerie
- [ ] `/hr/payroll` - Paie

### Priorité Basse 🟢

- [ ] `/dashboard/bi` - Business Intelligence
- [ ] `/crm/campaigns` - Campagnes marketing
- [ ] `/purchases/analytics` - Analyses achats

## Composant UnauthorizedAccess

Le composant existe déjà et affiche :
- 🐼 **Panda Po qui pleure** avec des larmes animées
- 📋 Message d'erreur clair
- 🏷️ Liste des rôles requis
- 📧 Bouton pour contacter l'administrateur
- ❌ Bouton pour fermer le modal

**Fichier** : `bms-web/src/components/auth/UnauthorizedAccess.tsx`

## Tests

### Test Manuel

1. **Se connecter en tant que comptable**
   ```
   Email: comptable@test.com
   Role: accountant
   ```

2. **Accéder à `/settings/users`**
   - ✅ Devrait afficher le message de restriction
   - ✅ Devrait afficher le panda Po qui pleure
   - ✅ Devrait afficher "Administrateur" et "Manager" comme rôles requis

3. **Se connecter en tant qu'admin**
   ```
   Email: admin@test.com
   Role: admin
   ```

4. **Accéder à `/settings/users`**
   - ✅ Devrait afficher la page normalement
   - ✅ Devrait pouvoir créer/modifier/supprimer des utilisateurs

### Test Automatisé (à implémenter)

```typescript
describe("PermissionGuard", () => {
  it("should block accountant from accessing users page", () => {
    localStorage.setItem("user_role", "accountant");
    render(<UsersPage />);
    expect(screen.getByText(/accès non autorisé/i)).toBeInTheDocument();
  });

  it("should allow admin to access users page", () => {
    localStorage.setItem("user_role", "admin");
    render(<UsersPage />);
    expect(screen.getByText(/utilisateurs & droits/i)).toBeInTheDocument();
  });
});
```

## Prochaines Étapes

1. **Protéger les autres pages sensibles**
   - Utiliser `PermissionGuard` sur toutes les pages listées ci-dessus

2. **Synchroniser avec le backend**
   - Vérifier que les permissions backend correspondent
   - Ajouter un endpoint `/api/v1/auth/permissions` pour récupérer les permissions dynamiquement

3. **Améliorer le système**
   - Ajouter des permissions granulaires (ex: `users:read:own` pour voir seulement son profil)
   - Implémenter des permissions par société (multi-tenant)
   - Ajouter un cache pour les permissions

4. **Documentation**
   - Créer un guide pour les développeurs
   - Documenter toutes les permissions disponibles
   - Créer des exemples d'utilisation

## Commandes

```bash
# Build et test local
cd bms-web
npm run build
npm run dev

# Vérifier les types
npm run type-check

# Linter
npm run lint

# Tests (à implémenter)
npm run test
```

## Notes Techniques

### Stockage des Permissions

Les permissions sont dérivées du rôle stocké dans `localStorage` :
- Clé : `user_role`
- Valeurs possibles : `admin`, `manager`, `accountant`, `user`

### Sécurité

⚠️ **Important** : Les permissions frontend sont pour l'UX uniquement. Le backend DOIT toujours vérifier les permissions avant d'autoriser une action.

Le frontend cache/affiche des éléments, mais le backend est la source de vérité pour la sécurité.

### Performance

- Les permissions sont chargées une seule fois au montage du composant
- Pas de requête API supplémentaire (basé sur le rôle déjà en localStorage)
- Le `PermissionGuard` utilise `useEffect` pour éviter les re-renders inutiles

## Fichiers Créés/Modifiés

### Créés ✨
1. `bms-web/src/hooks/usePermissions.ts` - Hook de gestion des permissions
2. `bms-web/src/components/auth/PermissionGuard.tsx` - Composant de protection
3. `PERMISSIONS-SYSTEM-IMPLEMENTATION.md` - Cette documentation

### Modifiés 📝
1. `bms-web/src/app/settings/users/page.tsx` - Ajout de la protection

### Existants (Réutilisés) ♻️
1. `bms-web/src/components/auth/UnauthorizedAccess.tsx` - Modal avec panda Po
2. `bms-web/src/hooks/useUnauthorized.ts` - Hook pour le modal
3. `bms-web/src/components/auth/AuthGuard.tsx` - Guard d'authentification

## Résultat

✅ **Comptable** : Ne peut plus accéder à `/settings/users`
✅ **Panda Po** : Apparaît avec des larmes quand l'accès est refusé
✅ **Message clair** : Explique pourquoi l'accès est refusé
✅ **Contact admin** : Bouton pour demander l'accès
✅ **Extensible** : Facile d'ajouter des protections sur d'autres pages
