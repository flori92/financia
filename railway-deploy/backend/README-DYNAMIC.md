# 🚀 BMS Backend Dynamic - Mode Hybride Statique/Dynamique

## 📋 Vue d'ensemble

Le BMS Backend est maintenant un **système hybride** capable de fonctionner en 3 modes :
- **🔧 STATIQUE** : Données prédéfinies (mode démo)
- **⚡ DYNAMIQUE** : Calculs en temps réel avec base de données
- **🔄 HYBRIDE** : Combinaison dynamique avec fallback statique

---

## 🏗️ Architecture

### **📊 Base de Données**
- **SQLite** pour la simplicité et la portabilité
- **Auto-migration** au démarrage
- **Seed** avec données de test réalistes
- **Backup** automatique avant migrations

### **🔧 Services Métier**
- **DynamicService** : Calculs intelligents avec cache
- **TreasuryService** : Prévisions et alertes trésorerie
- **AccountingService** : États comptables dynamiques
- **Database** : Abstraction SQLite avec promesses

### **⚡ Performance**
- **Cache** 5 minutes pour les calculs lourds
- **Lazy loading** des données
- **Compression** des réponses
- **Rate limiting** configurable

---

## 🎯 Modes de Fonctionnement

### **1. Mode STATIQUE** 🔧
```javascript
// Parfait pour démo/POC
{
  mode: "static",
  features: {
    database: false,
    realTimeCalculations: false,
    cache: false,
    staticFallback: true
  }
}
```

**Avantages :**
- ✅ Instantané
- ✅ Zéro configuration
- ✅ Prévisible
- ✅ Pas de dépendances DB

### **2. Mode DYNAMIQUE** ⚡
```javascript
// Pour production réelle
{
  mode: "dynamic", 
  features: {
    database: true,
    realTimeCalculations: true,
    cache: true,
    staticFallback: false
  }
}
```

**Avantages :**
- ✅ Données réelles
- ✅ Calculs temps réel
- ✅ Persistant
- ✅ Évolutif

### **3. Mode HYBRIDE** 🔄 (Recommandé)
```javascript
// Meilleur des deux mondes
{
  mode: "hybrid",
  features: {
    database: true,
    realTimeCalculations: true,
    cache: true,
    staticFallback: true
  }
}
```

**Avantages :**
- ✅ Dynamique par défaut
- ✅ Fallback automatique
- ✅ Robustesse maximale
- ✅ Transition transparente

---

## 📊 Endpoints Disponibles

### **🔧 Système**
```bash
GET  /health                    # État système avec mode actuel
GET  /api/v1/system/mode        # Mode et fonctionnalités
POST /api/v1/system/mode        # Changer le mode
GET  /api/v1/system/cache/stats # Statistiques cache
POST /api/v1/system/cache/clear # Vider le cache
```

### **🏢 Entreprise & Auth**
```bash
POST /api/v1/auth/login         # Connexion (dynamique/statique)
GET  /api/v1/companies          # Liste entreprises
```

### **💰 Trésorerie (DYNAMIQUE)**
```bash
GET  /api/v1/treasury/forecast  # Prévisions calculées
GET  /api/v1/treasury/alerts    # Alertes intelligentes
GET  /api/v1/treasury/direct-debits        # Prélèvements
GET  /api/v1/treasury/direct-debits/statistics
POST /api/v1/treasury/direct-debits        # CRUD
PUT  /api/v1/treasury/direct-debits/:id
DELETE /api/v1/treasury/direct-debits/:id
POST /api/v1/treasury/direct-debits/:id/suspend
POST /api/v1/treasury/direct-debits/:id/reactivate
POST /api/v1/treasury/direct-debits/:id/cancel
```

### **📈 Comptabilité (DYNAMIQUE)**
```bash
GET  /api/v1/accounting/dashboard/metrics  # KPI temps réel
GET  /api/v1/accounting/aged-balance       # Balance âgée calculée
GET  /api/v1/accounting/trial-balance      # Balance des comptes
GET  /api/v1/accounting/profit-loss        # Compte de résultat
GET  /api/v1/accounting/balance-sheet      # Bilan
GET  /api/v1/accounting/general-ledger     # Grand livre
GET  /api/v1/accounting/chart-of-accounts  # Plan comptable
POST /api/v1/accounting/journal-entries    # Saisie écritures
GET  /api/v1/accounting/closure            # Statut clôture
GET  /api/v1/accounting/closure/preview    # Aperçu clôture
POST /api/v1/accounting/closure/close      # Effectuer clôture
GET  /api/v1/accounting/close/last         # Dernière clôture
```

### **👥 CRM & RH**
```bash
GET  /api/v1/crm/contacts          # Contacts dynamiques
GET  /api/v1/crm/dashboard         # Dashboard CRM
GET  /api/v1/hr/employees          # Employés
GET  /api/v1/hr/payroll            # Paie calculée
```

---

## 🚀 Démarrage Rapide

### **Installation**
```bash
cd backend
npm install
```

### **Mode 1: Démo Statique (Immédiat)**
```bash
npm start
# Le serveur démarre en mode statique automatiquement
```

### **Mode 2: Dynamique Complet**
```bash
# Initialiser la base de données
npm run db:migrate

# Peupler avec données de test
npm run db:seed

# Démarrer en mode dynamique
curl -X POST http://localhost:8080/api/v1/system/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "dynamic"}'

npm start
```

### **Mode 3: Hybride (Recommandé)**
```bash
npm run db:migrate
npm run db:seed
npm start

# Le mode hybride est activé par défaut
```

---

## 📊 Exemples d'Utilisation

### **Changer le mode**
```bash
# Vérifier le mode actuel
curl http://localhost:8080/api/v1/system/mode

# Passer en dynamique
curl -X POST http://localhost:8080/api/v1/system/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "dynamic"}'

# Revenir en statique
curl -X POST http://localhost:8080/api/v1/system/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "static"}'
```

### **Dashboard dynamique**
```bash
# En mode statique : données fixes
curl "http://localhost:8080/api/v1/accounting/dashboard/metrics?companyId=demo"

# En mode dynamique : calculs réels basés sur transactions
curl "http://localhost:8080/api/v1/accounting/dashboard/metrics?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7"
```

### **Prévisions trésorerie**
```bash
# Mode statique : prévisions fixes
curl "http://localhost:8080/api/v1/treasury/forecast?companyId=demo&days=30"

# Mode dynamique : calcul basé sur historique + patterns
curl "http://localhost:8080/api/v1/treasury/forecast?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7&days=30"
```

---

## 📈 Performance & Cache

### **Cache Intelligent**
```javascript
// Les calculs lourds sont mis en cache 5 minutes
const cacheStats = {
  size: 15,           // Nombre d'entrées
  keys: ['dashboard_123', 'forecast_123', 'aged_balance_123'],
  memoryUsage: '2.1MB'
}

// Vider le cache manuellement
POST /api/v1/system/cache/clear
```

### **Métriques en temps réel**
```bash
GET /health
# Retourne :
{
  "status": "ok",
  "mode": "hybrid",
  "cache": {
    "size": 15,
    "memoryUsage": "2.1MB"
  },
  "features": {
    "database": true,
    "dynamic": true,
    "cache": true,
    "realTime": true
  }
}
```

---

## 🔧 Configuration

### **Variables d'environnement**
```bash
PORT=8080                    # Port du serveur
NODE_ENV=production          # Environnement
BMS_MODE=hybrid              # Mode par défaut
JWT_SECRET=bms-secret        # Secret JWT (production)
DB_PATH=./bms.db             # Chemin base SQLite
```

### **Settings (base de données)**
```sql
-- Configuration stockée en DB
INSERT INTO settings (key, value, description) VALUES
('mode', 'hybrid', 'Mode hybride: dynamique avec fallback statique'),
('cache_enabled', 'true', 'Cache des performances activé'),
('real_time_updates', 'true', 'Mises à jour en temps réel');
```

---

## 📊 Structure des Données

### **Tables principales**
```sql
companies      -- Entreprises
users          -- Utilisateurs
transactions   -- Transactions réelles
invoices       -- Factures
treasury_forecast -- Prévisions trésorerie
contacts       -- CRM (clients/fournisseurs)
employees      -- Employés
settings       -- Configuration système
```

### **Calculs dynamiques**
```javascript
// Prévisions basées sur patterns historiques
generateForecastData(companyId, days = 30) {
  // Analyse 90 derniers jours
  // Détection saisonnalité
  // Calcul runway trésorerie
  // Génération alertes intelligentes
}

// KPI temps réel
calculateDashboardMetrics(companyId) {
  // Transactions réelles
  // Ratios financiers
  // Top clients/fournisseurs
  // Alertes personnalisées
}
```

---

## 🚀 Déploiement

### **Railway (Production)**
```bash
# Le package.json inclut les scripts de migration
npm run db:migrate    # Exécuté automatiquement au déploiement
npm start            # Démarre en mode hybride
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:migrate
EXPOSE 8080
CMD ["npm", "start"]
```

---

## 🎯 Cas d'Usage

### **🎨 Démo/POC**
```bash
# Mode statique - instantané
npm start
# URL: https://bms-demo.railway.app
```

### **🏢 Production PME**
```bash
# Mode hybride - robustesse
npm run db:migrate
npm run db:seed
npm start
# URL: https://bms-production.railway.app
```

### **🚀 Scale Entreprise**
```bash
# Mode dynamique - performance
npm run db:migrate
npm run db:seed
curl -X POST /api/v1/system/mode -d '{"mode":"dynamic"}'
npm start
# URL: https://bms-enterprise.railway.app
```

---

## 📞 Support & Monitoring

### **Logs structurés**
```javascript
// Chaque requête est loguée avec mode
2025-11-03T12:00:00.000Z - [HYBRID] GET /api/v1/accounting/dashboard/metrics
2025-11-03T12:00:01.000Z - [DYNAMIC] POST /api/v1/treasury/forecast
```

### **Health check avancé**
```bash
GET /health
# Retourne état complet avec :
# - Mode actuel
# - Statistiques cache
# - Fonctionnalités actives
# - État base de données
```

---

## 🎯 Conclusion

Le BMS Backend Dynamic offre **flexibilité maximale** :

✅ **Mode STATIQUE** pour démo immédiate  
✅ **Mode DYNAMIQUE** pour calculs réels  
✅ **Mode HYBRIDE** pour robustesse  
✅ **Transition transparente** entre modes  
✅ **Cache intelligent** pour performances  
✅ **Base de données intégrée**  
✅ **Production ready**  

**Le système s'adapte automatiquement à vos besoins !** 🚀
