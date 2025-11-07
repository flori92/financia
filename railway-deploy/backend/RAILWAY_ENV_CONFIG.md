# 🔧 Configuration Railway pour BMS

## Variables d'Environnement Backend

### Redis Configuration
```bash
# Railway fournit automatiquement REDIS_URL
REDIS_URL=redis://default:yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE@redis.railway.internal:6379

# Variables individuelles (fallback)
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE
```

### Database Configuration
```bash
DATABASE_URL=postgresql://postgres:xayZUthaazDZJAcGxnqerSzybjRQOPLI@postgres.railway.internal:5432/railway
```

### Cache Configuration (Optionnel)
```bash
CACHE_TTL_DEFAULT=300
CACHE_MAX_ITEMS=1000
DASHBOARD_PRELOAD_ENABLED=true
DASHBOARD_PRELOAD_INTERVAL=300000
```

---

## ✅ Configuration Automatique

Le système détecte automatiquement :
- ✅ `REDIS_URL` (priorité)
- ✅ `REDIS_HOST` + `REDIS_PORT` + `REDIS_PASSWORD` (fallback)
- ✅ `DATABASE_URL` (priorité)
- ✅ Variables individuelles DB (fallback)

---

## 🚀 Déploiement Railway

### 1. Backend Service
- **Service**: Backend
- **Variables**: Toutes les variables Backend ci-dessus
- **Redis**: Utilise `REDIS_URL` automatiquement

### 2. Redis Service
- **Service**: Redis
- **Variables**: Automatiques Railway
- **URL**: `redis://default:yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE@redis.railway.internal:6379`

### 3. PostgreSQL Service
- **Service**: Postgresql
- **Variables**: Automatiques Railway
- **URL**: `postgresql://postgres:xayZUthaazDZJAcGxnqerSzybjRQOPLI@postgres.railway.internal:5432/railway`

---

## 🔍 Vérification

### Test Redis Connection
```bash
# Dans le backend
redis-cli -h redis.railway.internal -p 6379 -a yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE ping
```

### Test Database Connection
```bash
# Dans le backend
psql $DATABASE_URL -c "SELECT 1;"
```

---

*Configuration automatique - Aucune action requise*

