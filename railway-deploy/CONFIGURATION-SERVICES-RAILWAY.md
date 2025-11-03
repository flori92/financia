# 🔧 CONFIGURATION SERVICES RAILWAY - BMS Multi-Services

## 📊 **Architecture Actuelle**

### **Services Railway Configurés:**

#### **1. bms-ai-analytics (Python Flask)**
- **Source:** `railway-services/bms-ai-analytics/`
- **Port:** 8000
- **URL:** `https://bms-ai-analytics-production.railway.app`
- **Status:** ✅ Fonctionnel
- **Endpoints:** 
  - `/health` ✅
  - `/api/forecast/prophet` ✅
  - `/api/models/status` ✅

#### **2. bms-llm-service (Python Flask)**
- **Source:** `railway-services/bms-llm-service/`
- **Port:** 8001
- **URL:** `https://bms-llm-service-production.railway.app`
- **Status:** ✅ Fonctionnel
- **Endpoints:**
  - `/health` ✅
  - Endpoints LLM ✅

#### **3. backend-nodejs (Node.js Express) - À CONFIGURER**
- **Source:** `backend/`
- **Port:** 3000
- **URL:** `https://bms-production-d9e9.up.railway.app`
- **Status:** ❌ Service existe mais mauvaise source
- **Endpoints requis:**
  - `/health` ✅
  - `/api/v1/ai/ocr/stats` ✅
  - `/api/v1/ai/ocr/test` ⚠️
  - `/api/v1/ai/chat` ✅
  - `/api/v1/ml-forecast/dashboard` ❌ 404
  - `/api/v1/ml-forecast/predict` ❌ 404
  - `/api/v1/ml-forecast/models/performance` ❌ 404

---

## 🚨 **Problème Identifié**

### **Configuration Incorrecte:**
Le service `bms-production-d9e9` utilise la mauvaise source :
- **Actuel:** Source = Repository racine (détecte Python)
- **Correct:** Source = `backend/` (Node.js)

---

## 🔧 **SOLUTION - Configuration Service Backend**

### **Étapes Railway Dashboard:**

#### **1. Accéder Configuration Service:**
```
1. Railway Dashboard
2. Projet: bms-production-d9e9
3. Settings → General
4. "Source" section
```

#### **2. Corriger Source:**
```
Source: GitHub Repository
Repository: flori92/financia
Branch: clean-main
Root Directory: backend/
```

#### **3. Configuration Build:**
```
Builder: NIXPACKS
Build Command: npm install
Start Command: npm start
```

#### **4. Variables Environnement:**
```bash
NODE_ENV=production
PORT=3000
# + toutes les autres variables du .env
```

---

## 📋 **Fichiers de Configuration Prêts**

### **1. backend/railway.json** ✅
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### **2. package.json racine** ✅
```json
{
  "main": "backend/server.js",
  "start": "cd backend && npm start"
}
```

### **3. .railwayignore** ✅
```
# Ne bloque aucun dossier
# Chaque service Railway a sa propre source
```

---

## 🚀 **Actions Immédiates**

### **Option A: Corriger Service Existant (RECOMMANDÉ)**
```
1. Railway Dashboard → bms-production-d9e9
2. Settings → General
3. Root Directory: backend/
4. Save & Redeploy
5. Attendre 5-10 minutes
6. Valider: node src/ai/quick-check.js
```

### **Option B: Créer Nouveau Service**
```
1. Railway Dashboard → New Project
2. Deploy from GitHub
3. Repository: flori92/financia
4. Root Directory: backend/
5. Deploy
```

---

## 📊 **Validation Attendue**

### **Après Configuration Correcte:**
```bash
# Test 1: Health check
curl https://bms-production-d9e9.up.railway.app/health
# → {"status":"ok","timestamp":"..."} 200 OK

# Test 2: Quick Check 100%
node src/ai/quick-check.js
# → 7/7 (100.0%) 🎉

# Test 3: Validation complète
npm run test:100
# → 16/16 endpoints fonctionnels
```

---

## 🎯 **Architecture Finale**

### **3 Services Railway Indépendants:**

#### **1. bms-ai-analytics (Python)**
- URL: `https://bms-ai-analytics-production.railway.app`
- Port: 8000
- Usage: Analytics avancés avec Prophet

#### **2. bms-llm-service (Python)**
- URL: `https://bms-llm-service-production.railway.app`
- Port: 8001
- Usage: Service LLM local

#### **3. bms-backend-nodejs (Node.js)**
- URL: `https://bms-production-d9e9.up.railway.app`
- Port: 3000
- Usage: Backend principal BMS + OCR + ML Forecast

---

## 📋 **Prochaines Étapes**

### **Immédiat:**
1. **Corriger source service** Railway vers `backend/`
2. **Redéployer** service backend
3. **Valider** 100% avec quick-check

### **Post-100%:**
1. **Tests complets** avec `npm run test:100`
2. **Documentation** finale mise à jour
3. **Monitoring** production actif

---

**Architecture multi-services prête - Il faut juste corriger la source du backend !** 🚀
