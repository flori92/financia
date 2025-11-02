# 🚀 Configuration Redis sur Railway

## 📋 PRÉREQUIS

Pour activer Redis sur Railway, vous devez ajouter un service Redis à votre projet :

### 1. Ajouter Redis au projet Railway
```bash
# Via l'interface Railway :
# 1. Allez dans votre projet BMS
# 2. Cliquez sur "New Service"
# 3. Choisissez "Redis"
# 4. Donnez un nom (ex: "bms-redis")
# 5. Déployez
```

### 2. Variables d'environnement Railway
Railway va automatiquement créer ces variables :
```bash
REDIS_URL=redis://default:password@host:port
REDIS_HOST=your-redis-host.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

---

## ⚙️ CONFIGURATION BMS

### 1. Variables d'environnement requises
Dans Railway > Settings > Variables, assurez-vous d'avoir :

```bash
# Redis (automatiquement créé par Railway)
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# Database
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}

# JWT
JWT_SECRET=votre-secret-secure
JWT_EXPIRATION=7d

# Environment
NODE_ENV=production
PORT=3001
```

### 2. Configuration Bull optimisée
L'application utilise déjà une configuration robuste :

```typescript
BullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    redis: {
      host: config.get('REDIS_HOST', 'localhost'),
      port: parseInt(config.get('REDIS_PORT', '6379')),
      password: config.get('REDIS_PASSWORD'),
      db: parseInt(config.get('REDIS_DB', '0')),
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
    },
  }),
})
```

---

## 🔄 QUEUES BULL ACTIVES

### 1. Queue Bank Sync
```typescript
// bank-sync : Synchronisation bancaire
- Sync transactions bancaires
- Détection d'anomalies
- Planification sync automatique
```

### 2. Queue Bank Webhooks
```typescript
// bank-webhooks : Traitement webhooks
- Webhooks Stripe/Plaid/Bridge
- Retry automatique en cas d'échec
- Historique des événements
```

### 3. Queue Reconciliation
```typescript
// reconciliation : Rapprochement bancaire
- Matching transactions/écritures
- Import CSV en arrière-plan
- Calcul rapprochements automatiques
```

---

## 🧪 TEST DE FONCTIONNEMENT

### 1. Vérifier connexion Redis
```bash
# Test endpoint health
curl https://bms-production-d9e9.up.railway.app/health

# Devrait retourner :
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

### 2. Tester queues Bull
```bash
# Test synchronisation bancaire
curl -X POST https://bms-production-d9e9.up.railway.app/api/v1/bank-api/accounts/{accountId}/sync

# Devrait retourner :
{
  "message": "Synchronization queued successfully",
  "jobId": "12345"
}
```

---

## 🔧 DÉBOGAGE REDIS

### 1. Logs Railway
```bash
# Vérifier les logs Redis dans Railway
# 1. Allez dans votre service Redis
# 2. Cliquez sur "Logs"
# 3. Cherchez les erreurs de connexion
```

### 2. Commandes Redis utiles
```bash
# Via Railway CLI
railway logs redis-service-name

# Vérifier les clés Redis
railway run redis-cli --host $REDIS_HOST --port $REDIS_PORT
> KEYS *
> INFO memory
> INFO clients
```

---

## 📊 MONITORING

### 1. Métriques Redis
- **Memory Usage** : < 100MB recommandé
- **Connected Clients** : < 50 normal
- **Commands/sec** : < 1000 optimal
- **Hit Rate** : > 90% idéal

### 2. Bull Queue Monitoring
```bash
# Endpoint monitoring (à créer)
GET /api/v1/admin/queues/status

# Retour attendu :
{
  "bank-sync": {
    "waiting": 0,
    "active": 1,
    "completed": 150,
    "failed": 0
  },
  "bank-webhooks": {
    "waiting": 2,
    "active": 0,
    "completed": 89,
    "failed": 1
  }
}
```

---

## 🚨 ERREURS COMMUNES

### 1. Redis Connection Timeout
```bash
# Solution : Vérifier variables d'environnement
REDIS_HOST=correct-host.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=correct-password
```

### 2. Bull Queue Error
```bash
# Solution : Redémarrer service après configuration Redis
railway up
```

### 3. Memory Limit Exceeded
```bash
# Solution : Optimiser configuration Redis
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## 🎯 BÉNÉFICES AVEC REDIS

✅ **Performance** : Queue async pour sync bancaire  
✅ **Scalabilité** : Background jobs sans bloquer API  
✅ **Fiabilité** : Retry automatique et monitoring  
✅ **Analytics** : Traitement webhooks en temps réel  
✅ **Production** : Architecture enterprise-ready  

---

**🚀 Une fois Redis configuré sur Railway, BMS sera 100% fonctionnel avec toutes les queues Bull actives !**
