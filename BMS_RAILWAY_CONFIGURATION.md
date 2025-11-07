# 🔧 Configuration Railway pour BMS - Guide Complet

## ✅ Configuration Automatique

Le système BMS détecte automatiquement les variables Railway et s'adapte :

### Redis
- ✅ **Priorité 1**: `REDIS_URL` (fourni automatiquement par Railway)
- ✅ **Priorité 2**: `REDIS_HOST` + `REDIS_PORT` + `REDIS_PASSWORD`
- ✅ **Fallback**: Variables individuelles si REDIS_URL non disponible

### Database
- ✅ **Priorité 1**: `DATABASE_URL` (fourni automatiquement par Railway)
- ✅ **Priorité 2**: Variables individuelles (`DATABASE_HOST`, `DATABASE_PORT`, etc.)

---

## 📋 Variables d'Environnement Backend

### ✅ Déjà Configurées sur Railway

Ces variables sont **déjà configurées** sur votre Railway :

```bash
# Redis (Railway fournit automatiquement)
REDIS_URL=redis://default:yyPxbBRNWOkXJTfnmWFfhGQeTymHrQAE@redis.railway.internal:6379

# Database (Railway fournit automatiquement)
DATABASE_URL=postgresql://postgres:xayZUthaazDZJAcGxnqerSzybjRQOPLI@postgres.railway.internal:5432/railway

# Application
NODE_ENV=production
PORT=3001
JWT_SECRET=bms-super-secret-jwt-key-2025-production-secure
```

### ⚙️ Variables Optionnelles (Cache)

Vous pouvez ajouter ces variables pour personnaliser le cache :

```bash
# Cache Configuration (Optionnel)
CACHE_TTL_DEFAULT=300              # TTL par défaut en secondes (5 minutes)
CACHE_MAX_ITEMS=1000               # Nombre max d'items en cache
DASHBOARD_PRELOAD_ENABLED=true     # Activer le préchargement
DASHBOARD_PRELOAD_INTERVAL=300000  # Intervalle de préchargement (5 minutes)
```

---

## 🔍 Vérification de la Configuration

### 1. Vérifier Redis

Le système vérifie automatiquement Redis au démarrage. Les logs affichent :

```
✅ Redis configured from REDIS_URL: redis.railway.internal:6379
✅ Redis connection successful
```

Si Redis n'est pas disponible :
```
⚠️ Redis connection failed - Application will continue without cache (degraded mode)
```

### 2. Vérifier Database

Le système utilise automatiquement `DATABASE_URL` de Railway.

### 3. Health Check

```bash
# Vérifier la santé du système
curl https://bms-production-d9e9.up.railway.app/api/v1/health
```

---

## 🚀 Déploiement

### Aucune Action Requise !

Le système est **déjà configuré** pour Railway :

1. ✅ **Redis** : Détecte automatiquement `REDIS_URL`
2. ✅ **Database** : Détecte automatiquement `DATABASE_URL`
3. ✅ **Cache** : Fonctionne automatiquement avec Redis
4. ✅ **WebSocket** : Configuré pour Railway

### Variables à Ajouter (Optionnel)

Si vous voulez personnaliser le cache, ajoutez dans Railway Dashboard :

1. Aller dans **Backend Service** → **Variables**
2. Ajouter les variables optionnelles ci-dessus
3. Redéployer (automatique)

---

## 📊 Monitoring

### Logs à Surveiller

Au démarrage du backend, vous devriez voir :

```
✅ Redis configured from REDIS_URL: redis.railway.internal:6379
✅ Redis connection successful
✅ Dashboard preload service initialized
```

### Health Check Endpoint

```bash
GET /api/v1/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "info": {
    "redis": {
      "status": "up",
      "connected": true
    },
    "database": {
      "status": "up"
    }
  }
}
```

---

## 🔧 Dépannage

### Redis ne se connecte pas

1. Vérifier que le service Redis est actif sur Railway
2. Vérifier que `REDIS_URL` est bien défini
3. Vérifier les logs du backend pour les erreurs

### Cache ne fonctionne pas

1. Le système fonctionne en mode dégradé sans cache
2. Vérifier les logs : `⚠️ Redis connection failed`
3. Vérifier que Redis est accessible depuis le backend

### Performance lente

1. Vérifier que Redis est bien connecté
2. Vérifier les logs de cache hit/miss
3. Activer le préchargement : `DASHBOARD_PRELOAD_ENABLED=true`

---

## ✅ Checklist de Déploiement

- [x] Redis service actif sur Railway
- [x] `REDIS_URL` disponible dans Backend
- [x] `DATABASE_URL` disponible dans Backend
- [x] Backend démarre sans erreur
- [x] Logs montrent "Redis connection successful"
- [x] Health check retourne "ok"
- [x] Dashboard charge rapidement (< 500ms)

---

## 🎯 Résultat Attendu

Avec cette configuration :

- ✅ **Redis** : Connecté automatiquement
- ✅ **Cache** : Fonctionnel avec TTL adaptatif
- ✅ **Dashboard** : Chargement < 500ms (cache hit)
- ✅ **Temps réel** : WebSocket opérationnel
- ✅ **Préchargement** : Actif toutes les 5 minutes

---

*Configuration automatique - Prêt pour la production !* 🚀

