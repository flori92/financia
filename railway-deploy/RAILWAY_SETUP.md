# 🚀 Configuration Railway - BMS ERP

## 📋 Architecture Recommandée

### Option 1: Deux Projets Séparés (✅ Recommandé)

#### Backend Project
```
Nom: bms-erp-backend
URL: https://bms-erp-backend.up.railway.app
Root Directory: /backend
Port: 8080 (détecté automatiquement)
```

#### Frontend Project  
```
Nom: bms-erp
URL: https://bms-erp.up.railway.app
Root Directory: /frontend
Port: 3000 (détecté automatiquement)
Environment Variables:
  - NEXT_PUBLIC_API_URL = https://bms-erp-backend.up.railway.app
```

---

## 🛠️ Étapes de Configuration

### 1. Créer Projet Backend
1. Railway.app → New Project
2. Deploy from GitHub repo
3. Sélectionner `financia`
4. Root Directory: `/backend`
5. Nom: `bms-erp-backend`
6. Deploy

### 2. Créer Projet Frontend
1. Railway.app → New Project
2. Deploy from GitHub repo  
3. Sélectionner `financia`
4. Root Directory: `/frontend`
5. Nom: `bms-erp`
6. Variables d'environnement:
   ```
   NEXT_PUBLIC_API_URL=https://bms-erp-backend.up.railway.app
   NODE_ENV=production
   ```
7. Deploy

---

## 📁 Fichiers de Configuration

### railway-backend.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/health"
  }
}
```

### railway-frontend.json  
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "cd frontend && npm start",
    "healthcheckPath": "/"
  }
}
```

---

## 🎯 Résultat Final

Après déploiement (5-10 minutes):

- **Frontend**: https://bms-erp.up.railway.app
- **Backend API**: https://bms-erp-backend.up.railway.app
- **Health Check**: https://bms-erp-backend.up.railway.app/health

---

## ⚡ Test Post-Déploiement

```bash
# Test Backend
curl https://bms-erp-backend.up.railway.app/api/v1/system/mode

# Test Frontend  
curl https://bms-erp.up.railway.app/

# Test API depuis Frontend
curl https://bms-erp.up.railway.app/api/v1/accounting/aged-balance?companyId=XXX
```

*Toutes les fonctionnalités seront opérationnelles !* 🎯✨
