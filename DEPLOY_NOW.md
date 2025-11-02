# 🚀 DÉPLOYER BMS MAINTENANT

## ✅ Tout est Prêt !

**Console Railway ouverte** : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910

---

## 🎯 3 Services à Créer (10 minutes)

### 1️⃣ PostgreSQL (1 min)
```
+ New → Database → Add PostgreSQL
Nom: bms-database
```

### 2️⃣ Backend API (5 min)
```
+ New → GitHub Repo → flori92/financia
Root: railway-deploy/backend

Variables:
NODE_ENV=production
PORT=3001
JWT_SECRET=bms_jwt_secret_1762048259
DATABASE_URL=${{Postgres.DATABASE_URL}}

Generate Domain ✅
```

### 3️⃣ Frontend (5 min)
```
+ New → GitHub Repo → flori92/financia
Root: railway-deploy/frontend

Variables:
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://[backend-url].railway.app

Generate Domain ✅
```

---

## 🎭 URL Pour Client

**Démo complète** : `https://[frontend].railway.app/demo.html`

Contient :
- Dashboard KPI (CA 3.5M, Marge 40%)
- Graphiques 12 mois
- Mobile Money (25 transactions)
- Balance Âgée créances/dettes

---

## 🔧 Si Besoin d'Aide

```bash
# Rouvrir la console
./scripts/railway-open-console.sh

# Voir le guide complet
cat RAILWAY_QUICK_START.md

# Voir le statut
export RAILWAY_TOKEN="efcce6ba-3408-4910-bb4e-9cefbf47a412"
railway status
```

---

**GO ! 🚀** Créez les 3 services dans Railway maintenant !
