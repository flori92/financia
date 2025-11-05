# 🚀 Déploiement des Corrections sur Railway

## ✅ Tous les commits sont poussés sur clean-main

## 📋 Corrections à déployer

### Frontend
- ✅ Bouton logout (Topbar + Sidebar) - Nettoyage complet localStorage
- ✅ Gestion erreurs auth (401/403) - Redirection automatique
- ✅ 17 URLs hardcodées supprimées
- ✅ 4 mocks remplacés par APIs réelles
- ✅ 100% TODOs supprimés
- ✅ API centralisée utilisée partout

### Backend
- ✅ Aucune modification backend nécessaire (déjà déployé)

## 🔧 Variables d'environnement Railway

### Frontend (à vérifier)
```bash
NEXT_PUBLIC_API_URL=https://bms-backend-production.up.railway.app
NEXTAUTH_URL=https://bms-frontend-production.up.railway.app
NEXTAUTH_SECRET=<votre-secret-production>
NEXT_PUBLIC_COMPANY_ID=1805bc61-7cfd-44e9-8a63-17187bf05dc7
```

### Backend (déjà configuré)
```bash
DATABASE_HOST=${{PGHOST}}
DATABASE_PORT=${{PGPORT}}
DATABASE_USER=${{PGUSER}}
DATABASE_PASSWORD=${{PGPASSWORD}}
DATABASE_NAME=${{PGDATABASE}}
JWT_SECRET=${{JWT_SECRET}}
PORT=3001
NODE_ENV=production
```

## 🚀 Commandes de déploiement

### Option 1: Via Railway CLI
```bash
# Se connecter
railway login

# Lier le projet
railway link

# Déployer le frontend
cd bms-web
railway up --service frontend

# Le backend n'a pas besoin d'être redéployé
```

### Option 2: Via Dashboard Railway
1. Aller sur https://railway.app/dashboard
2. Sélectionner votre projet BMS
3. Cliquer sur le service "frontend"
4. Cliquer sur "Deploy" ou attendre le déploiement automatique depuis GitHub

## 🔍 Vérification post-déploiement

### 1. Vérifier le build
```bash
# Le build doit réussir sans erreurs
✅ Building...
✅ Compiled successfully
```

### 2. Tester les fonctionnalités corrigées

#### Bouton Logout
1. Se connecter sur https://bms-frontend-production.up.railway.app
2. Cliquer sur le bouton logout (menu profil en haut OU icône en bas de sidebar)
3. ✅ Doit rediriger vers /login
4. ✅ Doit nettoyer le localStorage
5. ✅ Ne doit plus avoir accès aux pages protégées

#### Gestion erreurs Auth
1. Supprimer manuellement le token du localStorage
2. Essayer d'accéder à une page protégée
3. ✅ Doit rediriger automatiquement vers /login

#### APIs dynamiques
1. Tester les pages:
   - /accountant/cash-flow-coherence
   - /accountant/ml-forecast
   - /accountant/revenue-recognition
   - /accountant/multi-dimensional-analysis
   - /bank-partner
   - /settings/users
2. ✅ Doivent charger les données depuis l'API (pas de mocks)

## 📊 Différences Local vs Production

### Avant déploiement (Production actuelle)
- ❌ Bouton logout ne fonctionne pas correctement
- ❌ Pas de gestion erreurs 401/403
- ❌ Certaines pages utilisent encore des mocks
- ❌ URLs hardcodées présentes

### Après déploiement (Production mise à jour)
- ✅ Bouton logout fonctionne (2 emplacements)
- ✅ Gestion erreurs auth avec redirection
- ✅ Toutes les pages utilisent les APIs réelles
- ✅ Aucune URL hardcodée
- ✅ Code propre et maintenable

## 🎯 Checklist de déploiement

### Avant déploiement
- [x] Tous les commits poussés sur clean-main
- [x] Tests locaux réussis
- [x] Aucune erreur TypeScript
- [x] Variables d'environnement documentées

### Pendant déploiement
- [ ] Build réussi sur Railway
- [ ] Aucune erreur de compilation
- [ ] Services démarrés correctement

### Après déploiement
- [ ] Frontend accessible
- [ ] Login fonctionne
- [ ] Logout fonctionne (2 boutons)
- [ ] Redirection auth fonctionne
- [ ] Pages chargent les données API
- [ ] Aucune erreur console

## 🔗 URLs de production

- **Frontend**: https://bms-frontend-production.up.railway.app
- **Backend**: https://bms-backend-production.up.railway.app
- **API Health**: https://bms-backend-production.up.railway.app/api/v1/health

## 📝 Notes importantes

1. **Déploiement automatique**: Si GitHub est connecté à Railway, le déploiement se fait automatiquement à chaque push sur clean-main

2. **Variables d'environnement**: Vérifier que NEXT_PUBLIC_API_URL pointe vers le bon backend

3. **Cache**: Si les changements ne sont pas visibles, vider le cache du navigateur (Cmd+Shift+R)

4. **Logs**: Surveiller les logs Railway pendant le déploiement
   ```bash
   railway logs --service frontend
   ```

## 🆘 Dépannage

### Le build échoue
```bash
# Vérifier les logs
railway logs --service frontend

# Vérifier les variables d'environnement
railway variables --service frontend
```

### Les changements ne sont pas visibles
1. Vérifier que le commit est bien sur clean-main
2. Vérifier que Railway a bien redéployé
3. Vider le cache du navigateur
4. Vérifier les logs pour les erreurs

### Erreur 404 sur les APIs
1. Vérifier NEXT_PUBLIC_API_URL
2. Vérifier que le backend est démarré
3. Tester l'API directement: https://bms-backend-production.up.railway.app/api/v1/health

---

**Prêt à déployer! 🚀**

Toutes les corrections sont sur clean-main et prêtes à être déployées sur Railway.
