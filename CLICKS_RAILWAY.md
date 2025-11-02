# 🖱️ Clics Exacts dans Railway (3 minutes)

**Console ouverte** : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910

---

## 📝 Service 1: PostgreSQL (30 secondes)

1. Cliquez le bouton **"+ New"** (en haut à droite)
2. Cliquez **"Database"**
3. Cliquez **"Add PostgreSQL"**
4. ✅ C'est tout ! Railway configure automatiquement.

---

## 📝 Service 2: Backend (1 minute)

1. Cliquez le bouton **"+ New"**
2. Cliquez **"GitHub Repo"**
3. Sélectionnez **"flori92/financia"**
4. Cliquez **"Deploy Now"**

### Après création du service Backend:

5. Cliquez sur le service **"financia"** qui vient d'être créé
6. Onglet **"Settings"** (dans la sidebar gauche)
7. Section **"Service"** → **"Root Directory"**
   - Tapez: `railway-deploy/backend`
   - Cliquez **"Update"**
8. Section **"Variables"** → Cliquez **"+ New Variable"**
   - Ajoutez ces 4 variables une par une:
   ```
   NODE_ENV = production
   PORT = 3001  
   JWT_SECRET = bms_jwt_secret_1762048259
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   ```
9. Onglet **"Settings"** → Section **"Networking"**
   - Cliquez **"Generate Domain"**
   - **Copiez l'URL générée** (vous en aurez besoin pour le frontend)

---

## 📝 Service 3: Frontend (1 minute)

1. Cliquez le bouton **"+ New"**
2. Cliquez **"GitHub Repo"**
3. Sélectionnez **"flori92/financia"**  
4. Cliquez **"Deploy Now"**

### Après création du service Frontend:

5. Cliquez sur le service **"financia"** qui vient d'être créé
6. Onglet **"Settings"** → Section **"Service"** → **"Root Directory"**
   - Tapez: `railway-deploy/frontend`
   - Cliquez **"Update"**
7. Section **"Variables"** → Cliquez **"+ New Variable"**
   - Ajoutez ces 3 variables:
   ```
   NODE_ENV = production
   PORT = 3000
   NEXT_PUBLIC_API_URL = [collez l'URL du backend]
   ```
   ⚠️ Remplacez `[collez l'URL du backend]` par l'URL que vous avez copiée à l'étape 2.9
8. Onglet **"Settings"** → Section **"Networking"**
   - Cliquez **"Generate Domain"**
   - **Copiez cette URL** → C'est votre URL frontend !

---

## 🎉 C'est Fini !

**URL pour présenter au client** :
```
https://[frontend-url].railway.app/demo.html
```

⏱️ **Attendez 10-15 minutes** que Railway construise et déploie les services.

Vous pouvez suivre le déploiement en temps réel en cliquant sur chaque service dans Railway.

---

## 🔍 Vérification

Une fois déployé, testez :
- ✅ Backend : `https://[backend-url].railway.app/health`
- ✅ Frontend : `https://[frontend-url].railway.app`
- ✅ Demo : `https://[frontend-url].railway.app/demo.html` ⭐

---

**GO ! 🚀** Ouvrez Railway et suivez ces clics exactement !
