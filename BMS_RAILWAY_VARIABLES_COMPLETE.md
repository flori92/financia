# 🔧 Configuration Railway Complète pour BMS

## ✅ Variables d'Environnement Backend

### Redis (Déjà Configuré sur Railway)
```bash
# Railway fournit automatiquement REDIS_URL
REDIS_URL=redis://default:yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE@redis.railway.internal:6379

# Variables individuelles (fallback si REDIS_URL non disponible)
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE
REDISUSER=default
```

### Database (Déjà Configuré sur Railway)
```bash
# Railway fournit automatiquement DATABASE_URL
DATABASE_URL=postgresql://postgres:xayZUthaazDZJAcGxnqerSzybjRQOPLI@postgres.railway.internal:5432/railway

# Variables individuelles (fallback)
DATABASE_HOST=postgres.railway.internal
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=xayZUthaazDZJAcGxnqerSzybjRQOPLI
DATABASE_NAME=railway
```

### Cache Configuration (Optionnel - À Ajouter)
```bash
# Ces variables peuvent être ajoutées pour personnaliser le cache
CACHE_TTL_DEFAULT=300              # TTL par défaut (5 minutes)
CACHE_MAX_ITEMS=1000               # Nombre max d'items en cache
DASHBOARD_PRELOAD_ENABLED=true      # Activer le préchargement
DASHBOARD_PRELOAD_INTERVAL=300000   # Intervalle de préchargement (5 minutes)
```

### Application (Déjà Configuré)
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=bms-super-secret-jwt-key-2025-production-secure
```

---

## 🔍 Vérification de la Configuration

### 1. Redis
Le système détecte automatiquement `REDIS_URL` de Railway. Au démarrage, vous devriez voir :

```
✅ Redis configured from REDIS_URL: redis.railway.internal:6379
✅ Redis connection successful
```

### 2. Database
Le système utilise automatiquement `DATABASE_URL` de Railway.

### 3. Health Check
```bash
# Vérifier la santé du système
curl https://bms-production-d9e9.up.railway.app/api/v1/health

# Vérifier Redis spécifiquement
curl https://bms-production-d9e9.up.railway.app/api/v1/health/redis
```

---

## 📋 Variables à Ajouter (Optionnel)

Si vous voulez personnaliser le cache, ajoutez ces variables dans Railway Dashboard :

1. Aller dans **Backend Service** → **Variables**
2. Ajouter :
   - `CACHE_TTL_DEFAULT=300`
   - `CACHE_MAX_ITEMS=1000`
   - `DASHBOARD_PRELOAD_ENABLED=true`
   - `DASHBOARD_PRELOAD_INTERVAL=300000`

---

## ✅ Configuration Automatique

Le système est **déjà configuré** pour Railway :

- ✅ **Redis** : Détecte automatiquement `REDIS_URL`
- ✅ **Database** : Détecte automatiquement `DATABASE_URL`
- ✅ **Cache** : Fonctionne automatiquement avec Redis
- ✅ **WebSocket** : Configuré pour Railway
- ✅ **Préchargement** : Activé par défaut

---

## 🚀 Déploiement

### Aucune Action Requise !

Le système détecte automatiquement :
- ✅ `REDIS_URL` de Railway
- ✅ `DATABASE_URL` de Railway
- ✅ Variables individuelles en fallback

### Variables Optionnelles

Si vous voulez personnaliser, ajoutez dans Railway Dashboard :
- `CACHE_TTL_DEFAULT`
- `CACHE_MAX_ITEMS`
- `DASHBOARD_PRELOAD_ENABLED`
- `DASHBOARD_PRELOAD_INTERVAL`

---

## 📊 Monitoring

### Logs à Surveiller

Au démarrage du backend :
```
✅ Redis configured from REDIS_URL: redis.railway.internal:6379
✅ Redis connection successful
✅ Dashboard preload service initialized
```

### Health Check

```bash
GET /api/v1/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up",
      "connected": true,
      "message": "Redis is connected and operational"
    }
  }
}
```

---

## 🎯 Résultat Attendu

Avec cette configuration :

- ✅ **Redis** : Connecté automatiquement via `REDIS_URL`
- ✅ **Cache** : Fonctionnel avec TTL adaptatif
- ✅ **Dashboard** : Chargement < 500ms (cache hit)
- ✅ **Temps réel** : WebSocket opérationnel
- ✅ **Préchargement** : Actif toutes les 5 minutes

---

*Configuration automatique - Prêt pour la production !* 🚀

