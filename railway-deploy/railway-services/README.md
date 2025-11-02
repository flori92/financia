# 🚀 BMS AI/ML Services - Railway

Services optimisés pour le déploiement BMS AI/ML sur Railway.

## 📁 Structure

```
bms-ai-analytics/     # Service IA principal (Prophet + ML)
├── app.py           # Application Flask
├── railway.json     # Config Railway
└── requirements.txt

bms-llm-service/      # Service LLM local (Mistral)
├── llm-service.py   # Service LLM Flask
├── railway.json     # Config Railway
├── download_models.py # Pré-chargement modèles
└── requirements.txt
```

## 🚀 Déploiement

### 1. Connecter Repository
Railway → New Project → Deploy from GitHub

### 2. Créer Services
- **bms-ai-analytics** → source `bms-ai-analytics/`
- **bms-llm-service** → source `bms-llm-service/`
- **Add-ons** : PostgreSQL + Redis

### 3. Variables d'environnement
```bash
# Service IA
PORT=8000
DATABASE_URL=${{postgres.DATABASE_URL}}
REDIS_URL=${{redis.REDIS_URL}}
LLM_SERVICE_URL=${{bms-llm-service.RAILWAY_PUBLIC_URL}}

# Service LLM
PORT=8001
TRANSFORMERS_CACHE=/tmp/models
```

### 4. Déployer
Railway build automatiquement après git push.

## 📊 URLs Production

```
Service IA : https://bms-ai-analytics-production.railway.app
Service LLM : https://bms-llm-service-production.railway.app
```

## 💰 Coûts

~$25-45/mois total (IA + LLM + Database + Cache)

---

✅ **Déploiement Railway prêt !**
