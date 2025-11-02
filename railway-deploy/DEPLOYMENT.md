# BMS API Gateway - Déploiement Rapide

## Backend Express Simple ✅

Le fichier `server.js` est **testé et fonctionnel** localement :

```bash
node server.js
# 🚀 Démarre sur http://localhost:3001
# 📊 Health: http://localhost:3001/health
# 🏢 Companies: http://localhost:3001/api/v1/companies
# 📈 Dashboard: http://localhost:3001/api/v1/accounting/dashboard/metrics
```

## Options de Déploiement

### 1. **Netlify Functions** (Recommandé)
```bash
cd backend-netlify
netlify deploy --prod --dir=.
```

### 2. **Vercel** (Alternative)
```bash
cd backend
vercel deploy
```

### 3. **Railway** (En cours de correction)
- Problème : Service LLM prioritaire
- Solution : Configuration en cours

## Frontend Configuré ✅

Le frontend pointe déjà vers : `https://bms-api-netlify.netlify.app`

## État Actuel

- ✅ Backend Express prêt
- ✅ Frontend configuré  
- ✅ Données OHADA intégrées
- 🔄 Déploiement en cours
