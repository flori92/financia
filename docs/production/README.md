# 🚀 Configuration Production & Railway

## ✅ Paramètres essentiels

- `NODE_ENV=production` : active automatiquement le mode production
- Désactivation de Swagger, des logs de debug et du logging TypeORM en production
- Logs d'erreurs toujours actifs pour faciliter le support

## ⚙️ Comportement par environnement

| Environnement | Swagger | Logs debug | Logging DB | Optimisations |
|---------------|---------|------------|------------|--------------|
| Production    | ❌      | ❌         | ❌         | ✅            |
| Développement | ✅      | ✅         | ✅         | ✅            |

## 🌐 Variables Railway

```bash
# Fournies automatiquement
REDIS_URL=redis://...
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3001

# Optionnel (personnalisation cache)
CACHE_TTL_DEFAULT=300
CACHE_MAX_ITEMS=1000
DASHBOARD_PRELOAD_ENABLED=true
DASHBOARD_PRELOAD_INTERVAL=300000
```

## 🧠 Gestion Redis & Cache

- Détection automatique de `REDIS_URL`
- Fallback sur `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Services clés : `CacheService`, `CacheInvalidationService`, `UnifiedDashboardService`
- WebSocket & préchargement activés pour les dashboards

## ✅ Vérifications recommandées

```bash
# Santé globale
curl https://bms-production-d9e9.up.railway.app/api/v1/health

# Santé Redis
curl https://bms-production-d9e9.up.railway.app/api/v1/health/redis
```

Logs attendus au démarrage :
```
✅ Production mode enabled
✅ Redis configured from REDIS_URL: redis.railway.internal:6379
✅ Redis connection successful
✅ Dashboard preload service initialized
```

## 📈 Bénéfices attendus

- Chargement dashboard < 500ms (cache hit)
- Charge DB réduite (~80 %)
- Temps réel via WebSocket
- Mode dégradé fiable si Redis indisponible

## ✅ Checklist de déploiement

- [ ] Services Redis & Postgres actifs sur Railway
- [ ] Variables d'environnement validées
- [ ] Santé globale = `ok`
- [ ] Logs Redis & dashboard conformes
- [ ] Préchargement actif si souhaité
