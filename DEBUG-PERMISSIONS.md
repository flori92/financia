# 🔍 Debug Permissions Expert-Comptable

## Problème Actuel
Le compte comptable (`comptable@cabinet.bj`) reçoit une erreur 403 lors de l'accès au rapprochement bancaire.

## Diagnostic Étape par Étape

### 1. Vérifier le Token JWT

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Récupérer le token
const token = localStorage.getItem('bms_token') || localStorage.getItem('token');
console.log('Token:', token);

// Décoder le token (partie payload)
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token Payload:', payload);
  console.log('Role:', payload.role);
  console.log('Has roles array?', payload.roles ? 'YES' : 'NO');
}
```

**Résultat attendu** :
```json
{
  "sub": "user-id",
  "email": "comptable@cabinet.bj",
  "role": "accountant",
  "roles": [...],  // ← Doit être présent avec les permissions
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Si `roles` est absent** → Le backend n'a pas été redéployé avec les nouvelles modifications

### 2. Vérifier la Base de Données

Connectez-vous à la base de données Railway et exécutez :

```sql
-- Vérifier que les rôles RBAC existent
SELECT id, name, description, is_system_role 
FROM roles 
WHERE name = 'accountant';

-- Vérifier que l'utilisateur comptable existe
SELECT id, email, role 
FROM users 
WHERE email = 'comptable@cabinet.bj';

-- Vérifier l'assignation du rôle RBAC
SELECT ur.*, u.email, r.name as role_name
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'comptable@cabinet.bj';
```

**Résultat attendu** :
- Le rôle `accountant` existe avec `is_system_role = true`
- L'utilisateur existe
- Il y a une entrée dans `user_roles` liant l'utilisateur au rôle

**Si aucune entrée dans `user_roles`** → Le seed n'a pas été exécuté

### 3. Vérifier les Permissions du Rôle

```sql
-- Vérifier les permissions du rôle accountant
SELECT r.name as role_name, p.resource, p.action, p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'accountant'
ORDER BY p.resource, p.action;
```

**Résultat attendu** :
Doit inclure :
- `bank-accounts:read`
- `bank-accounts:reconcile`
- `treasury:read`
- `tax:read`
- etc.

### 4. Vérifier l'Appel API

Dans la console du navigateur, vérifiez la requête qui échoue :

```javascript
// Regarder les headers de la requête
// Dans l'onglet Network (Réseau), cliquez sur la requête qui retourne 403
// Vérifiez :
// 1. Authorization header est présent
// 2. Le token est valide
```

## Solutions

### Solution 1 : Redéployer le Backend (Recommandé)

Le backend doit être redéployé sur Railway pour inclure les modifications :
- JWT Strategy qui charge les rôles
- Seed qui assigne les rôles

**Action** : Attendre que Railway termine le déploiement du dernier commit

### Solution 2 : Exécuter le Seed Manuellement

Si le backend est déployé mais le seed n'a pas été exécuté :

```bash
# Se connecter à Railway
railway link

# Exécuter le seed
railway run npm run seed
```

### Solution 3 : Assigner le Rôle Manuellement (Temporaire)

Si urgent, exécuter directement en SQL :

```sql
-- 1. Récupérer l'ID du rôle accountant
SELECT id FROM roles WHERE name = 'accountant' AND is_system_role = true;
-- Supposons que l'ID est: abc-123

-- 2. Récupérer l'ID de l'utilisateur
SELECT id FROM users WHERE email = 'comptable@cabinet.bj';
-- Supposons que l'ID est: user-456

-- 3. Assigner le rôle
INSERT INTO user_roles (user_id, role_id)
VALUES ('user-456', 'abc-123')
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### Solution 4 : Se Reconnecter

Après que le backend soit redéployé et le seed exécuté :

1. **Déconnectez-vous** de l'application
2. **Videz le cache** du navigateur (Ctrl+Shift+Delete)
3. **Reconnectez-vous** avec `comptable@cabinet.bj / password123`
4. **Vérifiez le nouveau token** (voir étape 1)

## Vérification Finale

Une fois tout corrigé, testez :

1. ✅ Connexion avec compte comptable
2. ✅ Accès à `/accountant/bank` sans erreur 403
3. ✅ Import CSV fonctionne
4. ✅ Export CSV fonctionne
5. ✅ Lettrage automatique fonctionne

## Statut Actuel

- ✅ Code corrigé et poussé sur GitHub
- ⏳ Backend en cours de déploiement sur Railway
- ⏳ Seed à exécuter après déploiement
- ⏳ Reconnexion nécessaire pour obtenir nouveau token

## Commandes Utiles

```bash
# Vérifier le statut du déploiement
railway status

# Voir les logs du déploiement
railway logs

# Exécuter le seed
railway run npm run seed

# Se connecter à la base de données
railway connect
```

---

**Note** : Le problème est probablement que le backend n'a pas encore été redéployé avec les modifications de la JWT Strategy et du seed. Une fois le déploiement terminé et le seed exécuté, le problème devrait être résolu.
