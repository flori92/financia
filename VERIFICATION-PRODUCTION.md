# ✅ Guide de Vérification en Production

## Changements Déployés

1. **API Gateway** : Correction du controller users (double préfixe)
2. **Frontend** : Système de permissions avec filtrage de navigation

## Étapes de Vérification

### 1. Vérifier le Déploiement Railway

```bash
# Vérifier les logs du frontend
railway logs --service bms-web --tail

# Vérifier les logs de l'API
railway logs --service api-gateway --tail
```

**Indicateurs de succès** :
- ✅ Build réussi sans erreurs
- ✅ "Server running on port..." dans les logs
- ✅ Pas d'erreurs TypeScript ou de compilation

### 2. Tester avec un Compte Comptable

#### A. Se Connecter
1. Aller sur : https://bms-frontend-production.up.railway.app/login
2. Se connecter avec un compte comptable :
   ```
   Email: comptable@test.com
   Password: [votre mot de passe]
   ```

#### B. Vérifier la Navigation
Dans la sidebar, vérifier que :
- ❌ **"Utilisateurs & droits"** n'apparaît PAS
- ❌ **"Audit & traçabilité"** n'apparaît PAS
- ✅ **"Paramètres"** apparaît
- ✅ **"Dashboard"** apparaît
- ✅ **"Comptabilité"** apparaît

#### C. Tester l'Accès Direct
1. Essayer d'accéder directement à : https://bms-frontend-production.up.railway.app/settings/users

**Résultat attendu** :
- ✅ Page de restriction s'affiche
- ✅ Panda Po qui pleure apparaît 🐼😢
- ✅ Message : "Accès non autorisé"
- ✅ Rôles requis affichés : "Administrateur" et "Manager"
- ✅ Bouton "Contacter l'admin" présent

### 3. Tester avec un Compte Admin

#### A. Se Connecter
1. Se déconnecter du compte comptable
2. Se connecter avec un compte admin :
   ```
   Email: admin@test.com
   Password: [votre mot de passe]
   ```

#### B. Vérifier la Navigation
Dans la sidebar, vérifier que :
- ✅ **"Utilisateurs & droits"** apparaît
- ✅ **"Audit & traçabilité"** apparaît
- ✅ Tous les autres items apparaissent

#### C. Tester l'Accès
1. Cliquer sur "Utilisateurs & droits"

**Résultat attendu** :
- ✅ Page s'affiche normalement
- ✅ Liste des utilisateurs visible
- ✅ Bouton "Nouvel utilisateur" présent
- ✅ Pas de message d'erreur

### 4. Tester les Endpoints API

#### A. Endpoint Users

```bash
# Avec un token comptable (devrait échouer)
curl -H "Authorization: Bearer $COMPTABLE_TOKEN" \
  "https://bms-production-d9e9.up.railway.app/api/v1/users?companyId=YOUR_COMPANY_ID"

# Résultat attendu: 403 Forbidden ou 401 Unauthorized
```

```bash
# Avec un token admin (devrait réussir)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://bms-production-d9e9.up.railway.app/api/v1/users?companyId=YOUR_COMPANY_ID"

# Résultat attendu: 200 OK avec liste des utilisateurs
```

#### B. Endpoint Aged Balance

```bash
# Avec un token comptable (devrait réussir)
curl -H "Authorization: Bearer $COMPTABLE_TOKEN" \
  "https://bms-production-d9e9.up.railway.app/api/v1/accounting/aged-balance?companyId=YOUR_COMPANY_ID&type=receivables&asOfDate=2025-11-29"

# Résultat attendu: 200 OK avec données
```

### 5. Vérifier les Logs d'Erreurs

#### Frontend
```bash
# Ouvrir la console du navigateur (F12)
# Vérifier qu'il n'y a pas d'erreurs JavaScript
# Vérifier les requêtes réseau (onglet Network)
```

**Erreurs à surveiller** :
- ❌ 404 sur `/api/v1/users`
- ❌ Erreurs de permissions
- ❌ Erreurs de chargement de composants

#### Backend
```bash
railway logs --service api-gateway | grep -i "error\|404\|403"
```

**Erreurs à surveiller** :
- ❌ 404 sur les routes
- ❌ Erreurs de permissions
- ❌ Erreurs de base de données

## Checklist de Vérification

### Frontend ✅

- [ ] Build réussi sur Railway
- [ ] Pas d'erreurs dans les logs
- [ ] Page de login accessible
- [ ] Connexion comptable fonctionne
- [ ] Navigation filtrée pour comptable
- [ ] "Utilisateurs & droits" masqué pour comptable
- [ ] Accès direct à /settings/users bloqué pour comptable
- [ ] Panda Po apparaît pour comptable
- [ ] Connexion admin fonctionne
- [ ] Navigation complète pour admin
- [ ] Accès à /settings/users autorisé pour admin

### Backend ✅

- [ ] Build réussi sur Railway
- [ ] Pas d'erreurs dans les logs
- [ ] Endpoint `/api/v1/users` accessible
- [ ] Endpoint `/api/v1/accounting/aged-balance` accessible
- [ ] Permissions vérifiées côté serveur
- [ ] Tokens JWT valides

### Intégration ✅

- [ ] Frontend communique avec le backend
- [ ] Pas d'erreurs CORS
- [ ] Tokens transmis correctement
- [ ] Permissions synchronisées frontend/backend

## Problèmes Courants et Solutions

### Problème 1 : "Utilisateurs & droits" toujours visible pour comptable

**Cause** : Frontend pas redéployé ou cache navigateur

**Solution** :
```bash
# Forcer le redéploiement
railway up --service bms-web

# Vider le cache du navigateur
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Problème 2 : Erreur 404 sur /api/v1/users

**Cause** : API Gateway pas redéployé

**Solution** :
```bash
# Redéployer l'API
railway up --service api-gateway

# Vérifier les logs
railway logs --service api-gateway
```

### Problème 3 : Panda Po n'apparaît pas

**Cause** : Composant UnauthorizedAccess non chargé

**Solution** :
```bash
# Vérifier que le fichier existe
ls bms-web/src/components/auth/UnauthorizedAccess.tsx

# Vérifier les imports dans PermissionGuard
grep -r "UnauthorizedAccess" bms-web/src/components/auth/
```

### Problème 4 : Tous les items de menu masqués

**Cause** : Rôle non défini ou invalide

**Solution** :
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('user_role'));

// Devrait afficher: "accountant", "admin", "manager", ou "user"
// Si null ou undefined, se reconnecter
```

## Commandes Utiles

### Railway

```bash
# Lister les services
railway status

# Voir les variables d'environnement
railway variables

# Redéployer un service
railway up --service [nom-du-service]

# Ouvrir le dashboard
railway open
```

### Git

```bash
# Vérifier la branche actuelle
git branch

# Voir les derniers commits
git log --oneline -5

# Vérifier le statut
git status
```

### NPM

```bash
# Build local pour tester
cd bms-web
npm run build

# Lancer en dev
npm run dev

# Vérifier les types
npm run type-check
```

## Résultat Attendu Final

### Pour un Comptable 👨‍💼

**Navigation** :
- ✅ Dashboard
- ✅ CRM & Ventes
- ✅ Communications
- ✅ Comptabilité
- ✅ Trésorerie (lecture)
- ✅ Factures
- ✅ Système > Paramètres
- ❌ Système > Utilisateurs & droits (masqué)
- ❌ Système > Audit & traçabilité (masqué)

**Accès Direct** :
- URL : `/settings/users`
- Résultat : 🐼 Panda Po qui pleure + Message de restriction

### Pour un Admin 👨‍💼

**Navigation** :
- ✅ Tous les items visibles
- ✅ Système > Utilisateurs & droits
- ✅ Système > Audit & traçabilité

**Accès** :
- URL : `/settings/users`
- Résultat : ✅ Page s'affiche normalement

## Contact

Si des problèmes persistent après vérification :

1. **Vérifier les logs Railway** pour les erreurs
2. **Vérifier la console navigateur** pour les erreurs JavaScript
3. **Tester en local** pour isoler le problème
4. **Vérifier les variables d'environnement** sur Railway

## Prochaines Étapes

Après vérification réussie :

1. ✅ Protéger d'autres pages sensibles
2. ✅ Ajouter des permissions granulaires
3. ✅ Synchroniser avec le backend pour permissions dynamiques
4. ✅ Ajouter des tests automatisés
5. ✅ Documenter les permissions pour les développeurs
