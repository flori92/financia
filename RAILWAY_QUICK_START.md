# 🚀 BMS - Déploiement Railway Quick Start

## ✅ Informations de Connexion

- **Projet ID** : `a003a9ae-d435-4d5a-a29a-f2d3f9c0f910`
- **Token** : `efcce6ba-3408-4910-bb4e-9cefbf47a412`
- **Repository** : `flori92/financia`
- **Branch** : `clean-main`

## 🎯 Déploiement en 3 Clics (Recommandé)

### 1. Ouvrir le Projet Railway
👉 https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910

### 2. Ajouter les Services

#### Service 1: PostgreSQL Database
1. Cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway configure automatiquement ✅

#### Service 2: Backend API
1. Cliquez sur **"+ New"**
2. Sélectionnez **"GitHub Repo"**
3. Choisissez : **flori92/financia**
4. Configuration :
   - **Root Directory** : `railway-deploy/backend`
   - **Build Command** : (auto-détecté par nixpacks.toml)
   - **Start Command** : (auto-détecté par nixpacks.toml)
   
5. **Variables** (Settings → Variables) :
   ```
   NODE_ENV = production
   PORT = 3001
   JWT_SECRET = bms_jwt_secret_1762048259
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   ```

6. **Generate Domain** (Settings → Networking)

#### Service 3: Frontend Web
1. Cliquez sur **"+ New"**
2. Sélectionnez **"GitHub Repo"**
3. Choisissez : **flori92/financia**
4. Configuration :
   - **Root Directory** : `railway-deploy/frontend`
   - **Build Command** : (auto-détecté par nixpacks.toml)
   - **Start Command** : (auto-détecté par nixpacks.toml)
   
5. **Variables** (Settings → Variables) :
   ```
   NODE_ENV = production
   PORT = 3000
   NEXT_PUBLIC_API_URL = https://[votre-backend-url].railway.app
   ```
   ⚠️ Remplacez `[votre-backend-url]` par l'URL du backend (étape précédente)

6. **Generate Domain** (Settings → Networking)

### 3. Attendre le Déploiement
⏱️ **10-15 minutes** pour le premier déploiement

---

## 🌐 URLs Après Déploiement

Une fois terminé, vous aurez :

- **🏠 Application** : `https://[frontend].railway.app`
- **🎭 Page Demo** : `https://[frontend].railway.app/demo.html` ⭐
- **🔧 API Backend** : `https://[backend].railway.app`
- **📚 API Docs** : `https://[backend].railway.app/api`

---

## 📊 Architecture Déployée

```
┌──────────────────┐
│   PostgreSQL     │ ← Railway Database (auto-managed)
│   (Railway)      │
└────────┬─────────┘
         │ DATABASE_URL
         ▼
┌──────────────────┐
│  BMS Backend API │ ← railway-deploy/backend
│  NestJS:3001     │    (nixpacks build)
└────────┬─────────┘
         │ REST API
         ▼
┌──────────────────┐
│  BMS Frontend    │ ← railway-deploy/frontend
│  Next.js:3000    │    (nixpacks build)
└──────────────────┘
```

---

## 🎯 Pour la Présentation Client

**URL à partager** : `https://[frontend].railway.app/demo.html`

### Contenu de la démo :

✅ **Dashboard Comptable**
- KPI temps réel : CA 3.5M XOF, Marge 40%
- Graphiques évolution 12 mois
- Top clients/fournisseurs

✅ **Mobile Money**
- 25 transactions exemple
- Stats par provider (Wave, Orange, MTN)
- Taux de succès 80%

✅ **Balance Âgée**
- Créances : 5.5M XOF
- Analyse par ancienneté (0-30j, 30-60j, 60-90j, +90j)
- Alertes actions de recouvrement

---

## 🔧 Commandes Utiles

```bash
# Voir le statut
export RAILWAY_TOKEN="efcce6ba-3408-4910-bb4e-9cefbf47a412"
railway status

# Voir les logs backend
railway logs --service bms-backend

# Voir les logs frontend
railway logs --service bms-frontend

# Ouvrir la console Railway
railway open
```

---

## ⚡ Déploiement Automatique (via Git)

Railway peut redéployer automatiquement à chaque push :

1. Dans Railway → Service Settings
2. Activez **"Auto-Deploy"**
3. Branch : `clean-main`

Maintenant chaque `git push origin clean-main` déclenchera un nouveau déploiement ! 🎉

---

## 🆘 Dépannage

### Build Backend Échoue
- Vérifiez que `nixpacks.toml` est dans `railway-deploy/backend/`
- Vérifiez les logs : `railway logs --service bms-backend`

### Build Frontend Échoue
- Vérifiez `NEXT_PUBLIC_API_URL` pointe vers le bon backend
- Vérifiez les logs : `railway logs --service bms-frontend`

### Database Connection Fails
- Vérifiez que `DATABASE_URL` est configuré dans les variables backend
- Railway génère automatiquement cette variable

---

## 📞 Support

**Console Railway** : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910

**Documentation Railway** : https://docs.railway.app

---

🎉 **BMS est prêt pour le déploiement client !**
