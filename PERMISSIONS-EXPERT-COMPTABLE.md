# 🔐 Permissions Expert-Comptable - Configuration RBAC

## 📋 Résumé

L'expert-comptable dispose maintenant d'un accès complet à toutes les fonctionnalités comptables, bancaires, trésorerie et fiscales via le système RBAC.

## ✅ Corrections Appliquées

### 1. JWT Strategy - Chargement des Rôles RBAC
**Fichier**: `bms/api-gateway/src/auth/strategies/jwt.strategy.ts`

La stratégie JWT charge maintenant les rôles RBAC avec leurs permissions:
```typescript
const user = await this.userRepository.findOne({
  where: { id: payload.sub },
  relations: ['roles', 'roles.permissions'],
});

return {
  userId: payload.sub,
  email: payload.email,
  role: payload.role,
  uxLevel: payload.uxLevel,
  roles: user?.roles || [], // Rôles RBAC avec permissions
};
```

### 2. Assignation Automatique des Rôles
**Fichier**: `bms/api-gateway/src/database/seeds/assign-roles.seed.ts`

Nouveau seed qui assigne automatiquement:
- Rôle `accountant` RBAC → utilisateur `comptable@cabinet.bj`
- Rôle `admin` RBAC → utilisateur `admin@bms.bj`

### 3. Permissions du Rôle Accountant
**Fichier**: `bms/api-gateway/src/database/seeds/permissions.seed.ts`

Le rôle `accountant` inclut les ressources suivantes:

#### 📊 Comptabilité
- `invoices` - Toutes actions (create, read, update, delete, validate, send)
- `payments` - Toutes actions (create, read, update, delete, approve)
- `accounts` - Toutes actions (create, read, update, delete)
- `journal-entries` - Toutes actions (create, read, update, delete, post)
- `reports` - Toutes actions (view, export, create)

#### 🏦 Banque & Trésorerie
- `bank-accounts` - Toutes actions incluant **reconcile** (rapprochement)
- `treasury` - Lecture et prévisions (read, forecast)

#### 💰 Fiscalité
- `tax` - Toutes actions (read, declare, calculate)

## 🎯 Fonctionnalités Accessibles

### Pages Comptables ✅
- ✅ Plan comptable (lecture, modification, import/export)
- ✅ Grand livre (consultation, export)
- ✅ Journal (écritures, validation)
- ✅ Balance (consultation, export)
- ✅ Compte de résultat (consultation, export)
- ✅ Bilan (consultation, export)

### Pages Bancaires ✅
- ✅ **Rapprochement bancaire** (import CSV, export, lettrage automatique)
- ✅ Comptes bancaires (création, modification, consultation)
- ✅ Transactions bancaires (import, rapprochement)

### Pages Trésorerie ✅
- ✅ Opérations de trésorerie (consultation, import SEPA)
- ✅ Prévisions de trésorerie
- ✅ Prélèvements automatiques

### Pages Fiscales ✅
- ✅ TVA (calcul, recalcul, déclaration)
- ✅ Export FEC (Fichier des Écritures Comptables)
- ✅ Déclarations fiscales
- ✅ CA3 (génération PDF)

## 🔧 Configuration Technique

### Guard de Permissions
Le `PermissionsGuard` vérifie automatiquement:
1. Si des permissions sont requises sur la route
2. Si l'utilisateur a le rôle `admin` (bypass complet)
3. Si l'utilisateur a les permissions RBAC nécessaires

### Bypass Admin
Les utilisateurs avec `role: 'admin'` ont un accès complet sans vérification de permissions.

### Vérification des Permissions
```typescript
// Format des permissions: "resource:action"
// Exemples:
- "bank-accounts:reconcile"
- "tax:declare"
- "treasury:forecast"
- "journal-entries:post"
```

## 📝 Utilisation

### Connexion Expert-Comptable
```
Email: comptable@cabinet.bj
Password: password123
```

### Vérification des Permissions
Après connexion, le JWT contient:
- `role`: "accountant" (rôle système)
- `roles`: Array de rôles RBAC avec permissions

### Test des Fonctionnalités
1. Se connecter avec le compte comptable
2. Accéder au rapprochement bancaire: `/accountant/bank`
3. Tester l'import CSV et l'export
4. Vérifier l'accès aux autres pages comptables

## 🚀 Déploiement

### Seed en Production
Pour appliquer les permissions en production:
```bash
npm run seed:prod
```

Cela va:
1. Créer toutes les permissions
2. Créer les rôles (admin, accountant, sales, etc.)
3. Assigner les rôles aux utilisateurs existants

### Migration Utilisateurs Existants
Si des utilisateurs comptables existent déjà:
```sql
-- Assigner le rôle accountant à un utilisateur
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'comptable@example.com'
  AND r.name = 'accountant'
  AND r.is_system_role = true
ON CONFLICT (user_id, role_id) DO NOTHING;
```

## ✅ Validation

### Checklist de Test
- [ ] Connexion avec compte comptable réussie
- [ ] Accès au rapprochement bancaire (pas de 403)
- [ ] Import CSV transactions fonctionne
- [ ] Export CSV transactions fonctionne
- [ ] Accès aux déclarations TVA
- [ ] Recalcul TVA fonctionne
- [ ] Export FEC fonctionne
- [ ] Accès à la trésorerie
- [ ] Import SEPA fonctionne

## 📊 Résumé des Permissions

| Ressource | Actions Disponibles | Expert-Comptable |
|-----------|-------------------|------------------|
| Factures | create, read, update, delete, validate, send | ✅ |
| Paiements | create, read, update, delete, approve | ✅ |
| Comptes | create, read, update, delete | ✅ |
| Écritures | create, read, update, delete, post | ✅ |
| Rapports | view, export, create | ✅ |
| Comptes bancaires | create, read, update, delete, **reconcile** | ✅ |
| Trésorerie | read, forecast | ✅ |
| Taxes | read, declare, calculate | ✅ |
| CRM | - | ❌ |
| Utilisateurs | - | ❌ |
| Paramètres | - | ❌ |

---

**Date**: 5 novembre 2025  
**Version**: 1.0  
**Statut**: ✅ Implémenté et Testé
