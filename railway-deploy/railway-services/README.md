# 🚀 BMS AI/ML Services - Railway Production

Ce dossier contient les services optimisés pour le déploiement sur Railway.

## 📁 Structure

```
railway-services/
├── bms-ai-analytics/     # Service IA principal (Prophet + ML)
│   ├── app.py           # Application Flask principale
│   ├── railway.json     # Configuration Railway
│   └── requirements.txt # Dépendances Python
│
├── bms-llm-service/      # Service LLM local (Mistral + Llama)
│   ├── llm-service.py   # Service LLM Flask
│   ├── railway.json     # Configuration Railway  
│   ├── download_models.py # Script pré-chargement modèles
│   └── requirements.txt # Dépendances Python
│
└── README.md            # Ce fichier
```

## 🎯 Services

### 1. bms-ai-analytics (Port 8000)
**Fonctionnalités:**
- Prévisions temporelles avec Prophet
- Segmentation clients K-Means
- Cash-flow forecasting
- Analytics business

**Endpoints principaux:**
- `GET /health` - Health check
- `POST /api/forecast/prophet` - Prévisions Prophet
- `POST /api/cashflow/forecast` - Prévisions cash-flow
- `POST /api/customers/segment` - Segmentation clients
- `GET /api/models/status` - Statut modèles

### 2. bms-llm-service (Port 8001)
**Fonctionnalités:**
- LLM local Mistral 7B (insights business)
- Llama/DialoGPT (fallback conversationnel)
- Analyse sentiment français
- Embeddings sémantiques
- NLP français (spaCy)

**Endpoints principaux:**
- `GET /health` - Health check
- `POST /api/llm/insights` - Génération insights
- `POST /api/llm/sentiment` - Analyse sentiment
- `POST /api/llm/embeddings` - Embeddings sémantiques
- `GET /api/llm/models` - Modèles chargés

## 🚀 Déploiement Rapide

### 1. Préparer Repository
```bash
# Ajouter ces dossiers à votre repository Git
git add railway-services/
git commit -m "🚀 Add Railway AI/ML services"
git push origin main
```

### 2. Créer Projets Railway
1. **Service IA Analytics**
   - New Project → Deploy from GitHub
   - Source: `railway-services/bms-ai-analytics/`
   - Variables: `PORT=8000`

2. **Service LLM**
   - New Project → Deploy from GitHub  
   - Source: `railway-services/bms-llm-service/`
   - Variables: `PORT=8001`

3. **Add-ons**
   - PostgreSQL (database)
   - Redis (cache)

### 3. Configurer Variables
```bash
# Service IA Analytics
DATABASE_URL=${{postgres.DATABASE_URL}}
REDIS_URL=${{redis.REDIS_URL}}
LLM_SERVICE_URL=https://bms-llm-service-production.railway.app

# Service LLM
TRANSFORMERS_CACHE=/tmp/models
TORCH_HOME=/tmp/torch
```

## 📊 Monitoring

### Health Checks
```bash
# Service IA
curl https://votre-app.railway.app/health

# Service LLM  
curl https://votre-llm.railway.app/health
curl https://votre-llm.railway.app/api/llm/models
```

### Logs Railway
- Dashboard Railway → Onglet "Logs"
- Monitoring temps réel des erreurs
- Métriques de performance

## 🔧 Configuration

### Ressources Recommandées
- **IA Analytics**: 1GB RAM, 1 vCPU
- **LLM Service**: 2GB RAM, 1 vCPU (pour Mistral 7B)
- **PostgreSQL**: Plan Hobby
- **Redis**: Plan Hobby

### Optimisations
- Modèles pré-chargés pendant build
- Cache local pour éviter rechargements
- Fallbacks automatiques
- Scaling vertical disponible

## 🚨 Dépannage

### Problèmes Communs
1. **Build timeout** : Réduire modèles dans `download_models.py`
2. **Mémoire insuffisante** : Upgrader vers 2GB RAM pour LLM
3. **Démarrage lent** : Normal (2-5 min pour charger modèles)

### Solutions
- Utiliser modèles plus légers si nécessaire
- Monitorer les logs Railway
- Ajuster les ressources selon usage

## 💡 Usage

### Depuis Backend NestJS
```typescript
// Mettre à jour les URLs Railway
AI_SERVICE_URL=https://bms-ai-analytics-production.railway.app
LLM_SERVICE_URL=https://bms-llm-service-production.railway.app
```

### Tests APIs
```bash
# Test insights LLM
curl -X POST https://votre-llm.railway.app/api/llm/insights \
  -H "Content-Type: application/json" \
  -d '{"financialData": {"revenue": 100000, "expenses": 75000}}'

# Test prévisions Prophet
curl -X POST https://votre-app.railway.app/api/forecast/prophet \
  -H "Content-Type: application/json" \
  -d '{"historicalData": [["2024-01-01", 1000]], "horizon": 30, "frequency": "daily"}'
```

## 📈 Performance

### Temps de Réponse
- **Prophet forecasting**: 2-5 secondes
- **Mistral insights**: 5-15 secondes  
- **Sentiment analysis**: 1-2 secondes
- **Embeddings**: <1 seconde

### Coûts Estimés
- **Total mensuel**: $25-45
- **IA Analytics**: $5-10
- **LLM Service**: $10-20
- **Database + Cache**: $10-15

---

🎉 **Votre BMS AI/ML est prêt pour Railway !**

Voir [RAILWAY_DEPLOYMENT.md](../backend/ai-service/RAILWAY_DEPLOYMENT.md) pour le guide complet.
