# 🚀 Guide Déploiement BMS sur Railway

## ✅ Projet Railway Créé

**Projet** : BMS  
**URL Console** : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910

## 📋 Étapes de Déploiement Manuel (via Interface Web)

Railway CLI a des limitations pour les projets multi-services. Voici la méthode recommandée via l'interface web :

### 1️⃣ Accéder au Projet

1. Ouvrez : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910
2. Connectez-vous avec : florifavi@gmail.com

### 2️⃣ Déployer le Backend (API)

1. **Cliquez sur "New Service"** → "GitHub Repo"
2. Sélectionnez le repository : `flori92/financia`
3. Configurez :
   - **Root Directory** : `railway-deploy/backend`
   - **Build Command** : `npm ci && npm run build`
   - **Start Command** : `npm run start:prod`
   - **Port** : `3001`

4. **Variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=bms_jwt_secret_1730509200
   ```

### 3️⃣ Ajouter PostgreSQL

1. Cliquez sur "New Service" → "Database" → "PostgreSQL"
2. Railway créera automatiquement la variable `DATABASE_URL`
3. Cette variable sera disponible pour tous les services

### 4️⃣ Déployer le Frontend

1. **Cliquez sur "New Service"** → "GitHub Repo"
2. Sélectionnez le repository : `flori92/financia`
3. Configurez :
   - **Root Directory** : `railway-deploy/frontend`
   - **Build Command** : `npm ci && npm run build`
   - **Start Command** : `npm start`
   - **Port** : `3000`

4. **Variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=${{bms-backend.url}}
   ```
   
   *(Remplacez `bms-backend.url` par l'URL réelle du backend une fois déployé)*

### 5️⃣ Configurer les Domaines

Railway génère automatiquement des URLs :
- **Backend** : `https://bms-backend-production.up.railway.app`
- **Frontend** : `https://bms-frontend-production.up.railway.app`

### 6️⃣ Vérifier le Déploiement

1. **Backend Health** : `https://[backend-url]/health`
2. **Frontend Demo** : `https://[frontend-url]/demo.html`
3. **API Docs** : `https://[backend-url]/api`

---

## 🎯 Alternative Rapide : Déploiement via GitHub

Si vous préférez automatiser complètement :

1. Connectez Railway à votre GitHub
2. Activez les déploiements automatiques
3. Chaque push sur `clean-main` déclenchera un nouveau déploiement

---

## 📊 Architecture Déployée

```
┌─────────────────┐
│   PostgreSQL    │
│   (Railway DB)  │
└────────┬────────┘
         │
         │ DATABASE_URL
         │
┌────────▼────────────────┐
│   BMS Backend API       │
│   NestJS (port 3001)    │
│   /health, /api         │
└────────┬────────────────┘
         │
         │ HTTP API
         │
┌────────▼────────────────┐
│   BMS Frontend          │
│   Next.js (port 3000)   │
│   /demo.html            │
└─────────────────────────┘
```

---

## 🔧 Commandes Utiles

```bash
# Voir le statut
railway status

# Voir les logs backend
railway logs --service bms-backend

# Voir les logs frontend
railway logs --service bms-frontend

# Redéployer
railway up
```

---

## 📱 URLs de Démonstration Client

Une fois déployé, partagez ces URLs avec le client :

- **🏠 Application** : `https://[frontend-url]`
- **🎭 Démo Interactive** : `https://[frontend-url]/demo.html`
- **📊 Dashboard** : `https://[frontend-url]/accountant`
- **🔧 API Backend** : `https://[backend-url]/api`

---

## ⚠️ Notes Importantes

1. **Premier déploiement** : Peut prendre 10-15 minutes
2. **Variables liées** : Une fois le backend déployé, copiez son URL dans `NEXT_PUBLIC_API_URL` du frontend
3. **Database** : PostgreSQL se configure automatiquement
4. **Monitoring** : Activez les notifications dans Railway pour suivre les déploiements

---

## 🎉 Présentation Client

Après déploiement, montrez au client :

✅ **Dashboard avec KPI réels** (CA: 3.5M XOF, Marge: 40%)  
✅ **Graphiques interactifs** (évolution 12 mois)  
✅ **Mobile Money** (25 transactions exemple)  
✅ **Balance Âgée** (créances/dettes par ancienneté)  
✅ **Architecture complète** (Frontend + Backend + Database)

La page `/demo.html` est parfaite pour la démonstration car elle fonctionne sans configuration supplémentaire !

---

**Projet Railway** : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910  
**Token Railway** : `68df9247-6407-4751-aa3d-2fb09477f8a5`
