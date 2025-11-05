# 🚨 Fix Rapide - Erreur 403 Rapprochement Bancaire

## Problème
Le compte `comptable@cabinet.bj` reçoit une erreur 403 (accès refusé) sur le rapprochement bancaire.

## Solution Rapide (5 minutes)

### Étape 1 : Diagnostic dans le Navigateur

1. Ouvrez l'application BMS
2. Appuyez sur **F12** pour ouvrir la console
3. Collez ce code et appuyez sur Entrée :

```javascript
const token = localStorage.getItem('bms_token') || localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Email:', payload.email);
  console.log('Role:', payload.role);
  console.log('Has RBAC roles?', payload.roles ? 'YES ✅' : 'NO ❌');
  if (payload.roles) {
    console.log('Number of roles:', payload.roles.length);
  }
}
```

**Résultat attendu** : `Has RBAC roles? YES ✅`

**Si vous voyez `NO ❌`** → Passez à l'étape 2

### Étape 2 : Vérifier le Déploiement Backend

Le backend doit être redéployé avec les dernières modifications.

**Vérifier sur Railway** :
1. Allez sur https://railway.app
2. Ouvrez votre projet BMS
3. Vérifiez que le dernier déploiement est terminé
4. Commit attendu : `cafeb64cd1` ou plus récent

**Si le déploiement est en cours** → Attendez qu'il se termine (5-10 min)

### Étape 3 : Exécuter le Seed (Si nécessaire)

Si le backend est déployé mais les rôles ne sont pas assignés :

```bash
# Option A : Via Railway CLI
railway link
railway run npm run seed

# Option B : Via SQL (plus rapide)
railway connect
# Puis coller le contenu de scripts/fix-accountant-permissions.sql
```

### Étape 4 : Se Reconnecter

**IMPORTANT** : Vous devez vous reconnecter pour obtenir un nouveau token

1. **Déconnectez-vous** de l'application
2. **Videz le cache** : Ctrl+Shift+Delete → Cocher "Cookies" → Effacer
3. **Reconnectez-vous** :
   - Email : `comptable@cabinet.bj`
   - Password : `password123`
4. **Testez** l'accès au rapprochement bancaire

### Étape 5 : Vérification Finale

Après reconnexion, vérifiez dans la console (F12) :

```javascript
const token = localStorage.getItem('bms_token') || localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('RBAC Roles:', payload.roles);

// Vérifier les permissions bancaires
if (payload.roles && payload.roles.length > 0) {
  const perms = new Set();
  payload.roles.forEach(r => {
    if (r.permissions) {
      r.permissions.forEach(p => perms.add(`${p.resource}:${p.action}`));
    }
  });
  console.log('Has bank-accounts:reconcile?', perms.has('bank-accounts:reconcile') ? '✅ YES' : '❌ NO');
}
```

**Résultat attendu** : `Has bank-accounts:reconcile? ✅ YES`

## Checklist de Résolution

- [ ] Backend déployé avec commit `cafeb64cd1` ou plus récent
- [ ] Seed exécuté (rôles RBAC créés)
- [ ] Rôle assigné à l'utilisateur comptable
- [ ] Déconnexion effectuée
- [ ] Cache vidé
- [ ] Reconnexion effectuée
- [ ] Nouveau token contient `roles` array
- [ ] Permission `bank-accounts:reconcile` présente
- [ ] Accès au rapprochement bancaire fonctionne ✅

## Si le Problème Persiste

### Vérification Approfondie

Exécutez le script complet de diagnostic :

```javascript
// Copier-coller le contenu de scripts/check-permissions.js
```

### Vérification Base de Données

```sql
-- Vérifier l'assignation du rôle
SELECT u.email, r.name as role_name, COUNT(p.id) as permissions
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'comptable@cabinet.bj'
GROUP BY u.email, r.name;
```

**Résultat attendu** :
```
email                    | role_name  | permissions
-------------------------|------------|------------
comptable@cabinet.bj     | accountant | 40+
```

### Correction Manuelle (Dernier Recours)

Si rien ne fonctionne, assignez le rôle manuellement :

```sql
-- 1. Trouver les IDs
SELECT id, email FROM users WHERE email = 'comptable@cabinet.bj';
SELECT id, name FROM roles WHERE name = 'accountant' AND is_system_role = true;

-- 2. Assigner (remplacer les IDs)
INSERT INTO user_roles (user_id, role_id)
VALUES ('USER_ID_ICI', 'ROLE_ID_ICI')
ON CONFLICT DO NOTHING;
```

## Contact Support

Si après toutes ces étapes le problème persiste :

1. Vérifiez les logs Railway : `railway logs`
2. Vérifiez les erreurs dans la console navigateur (F12 → Console)
3. Vérifiez les erreurs réseau (F12 → Network → Filtrer 403)

---

**Temps estimé** : 5-10 minutes
**Difficulté** : Facile
**Prérequis** : Accès Railway + Compte comptable
