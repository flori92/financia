# ⚡ Commandes Rapides BMS

## 🚀 Déploiement

### Déploiement Automatique Complet
```bash
./QUICK_START_RAILWAY.sh
```

### Déploiement Simple
```bash
./deploy-railway.sh
```

### Déploiement Manuel
```bash
# Backend
cd bms/api-gateway && railway up --service backend

# Frontend
cd ../../bms-web && railway up --service frontend
```

## 🔍 Vérification

### Vérifier les corrections
```bash
bash verify-fixes.sh
```

### Vérifier les logs Railway
```bash
# Backend
railway logs --service backend --follow

# Frontend
railway logs --service frontend --follow
```

### Vérifier le status
```bash
railway status
```

## 📝 Git

### Commit et Push
```bash
./commit-and-push.sh
```

### Commit manuel
```bash
git add .
git commit -m "🚀 Corrections BMS"
git push origin clean-main
```

## ⚙️ Configuration Railway

### Variables Backend
```bash
railway variables --service backend set \
  JWT_SECRET="$(openssl rand -base64 32)" \
  PORT="3001" \
  NODE_ENV="production"
```

### Variables Frontend
```bash
railway variables --service frontend set \
  NEXT_PUBLIC_API_URL="https://votre-backend.railway.app" \
  NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

### Voir les variables
```bash
railway variables --service backend
railway variables --service frontend
```

## 🔧 Développement Local

### Démarrer tout
```bash
./START_ALL.sh
```

### Arrêter tout
```bash
./STOP_ALL.sh
```

### Test rapide
```bash
./TEST_RAPIDE.sh
```

## 🐛 Dépannage

### Redéployer un service
```bash
railway up --service backend --force
railway up --service frontend --force
```

### Voir les erreurs
```bash
railway logs --service backend | grep ERROR
railway logs --service frontend | grep ERROR
```

### Restart un service
```bash
railway restart --service backend
railway restart --service frontend
```

## 📊 Monitoring

### Dashboard Railway
```bash
railway open
```

### Healthcheck Backend
```bash
curl https://votre-backend.railway.app/api/v1/health
```

### Tester l'API
```bash
curl https://votre-backend.railway.app/api/v1/auth/me
```

## 🔑 Secrets

### Générer JWT Secret
```bash
openssl rand -base64 32
```

### Générer NextAuth Secret
```bash
openssl rand -base64 32
```

## 📦 Services Railway

### Créer un service
```bash
railway service create nom-du-service
```

### Lister les services
```bash
railway service list
```

### Supprimer un service
```bash
railway service delete nom-du-service
```

## 🗄️ Base de Données

### Ajouter PostgreSQL
```bash
railway add postgresql
```

### Se connecter à la DB
```bash
railway connect postgresql
```

### Exécuter une migration
```bash
railway run --service backend npm run migrate
```

## 🌐 Domaines

### Générer un domaine
```bash
railway domain --service backend
railway domain --service frontend
```

### Voir les domaines
```bash
railway domain list
```

## 📱 Liens Rapides

- **Railway Dashboard**: https://railway.app/dashboard
- **Documentation Railway**: https://docs.railway.app
- **Frontend Local**: http://localhost:3000
- **Backend Local**: http://localhost:3001

## 🎯 Workflow Complet

### 1. Développement
```bash
# Démarrer en local
./START_ALL.sh

# Faire les modifications
# ...

# Tester
./TEST_RAPIDE.sh

# Arrêter
./STOP_ALL.sh
```

### 2. Vérification
```bash
# Vérifier les corrections
bash verify-fixes.sh

# Vérifier Git
git status
```

### 3. Commit
```bash
# Commit automatique
./commit-and-push.sh

# Ou manuel
git add .
git commit -m "Description"
git push origin clean-main
```

### 4. Déploiement
```bash
# Déploiement automatique
./QUICK_START_RAILWAY.sh

# Ou manuel
railway up --service backend
railway up --service frontend
```

### 5. Vérification Production
```bash
# Logs
railway logs --service backend --follow

# Healthcheck
curl https://votre-backend.railway.app/api/v1/health

# Tester l'app
open https://votre-frontend.railway.app
```

## 🆘 Aide

### Aide Railway
```bash
railway help
railway help deploy
railway help variables
```

### Documentation
- `README_DEPLOIEMENT.md` - Guide complet
- `GUIDE_DEPLOIEMENT_RAILWAY.md` - Guide détaillé
- `CORRECTIONS_COMPLETEES.md` - Liste corrections
- `RESUME_FINAL.md` - Résumé final

---

**💡 Astuce**: Ajoutez ce fichier à vos favoris pour un accès rapide!
