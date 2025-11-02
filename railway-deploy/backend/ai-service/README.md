# BMS AI/ML Service

Service d'intelligence artificielle et de machine learning pour BMS ERP utilisant **uniquement des modèles open source gratuits** qui tournent sur votre infrastructure Railway.

##  Déploiement Railway

### Structure des Services
```
railway-services/
├── bms-ai-analytics/     # Service principal Prophet/ML (port 8000)
└── bms-llm-service/      # Service LLM Mistral/Llama (port 8001)
```

### Déploiement Rapide
1. **Connecter GitHub** à Railway
2. **Créer 2 services** :
   - `bms-ai-analytics` → source `railway-services/bms-ai-analytics/`
   - `bms-llm-service` → source `railway-services/bms-llm-service/`
3. **Add-ons** : PostgreSQL + Redis
4. **Variables d'environnement** :
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

##  API Endpoints

### Service IA Principal
- `GET /health` - Health check
- `POST /api/forecast/prophet` - Prévisions Prophet
- `POST /api/cashflow/forecast` - Prévisions cash-flow
- `POST /api/customers/segment` - Segmentation clients

### Service LLM Local
- `GET /health` - Health check
- `POST /api/llm/insights` - Insights business (Mistral)
- `POST /api/llm/sentiment` - Analyse sentiment français
- `POST /api/llm/embeddings` - Embeddings sémantiques
- `GET /api/llm/models` - Modèles chargés

##  Modèles Open Source

- **Mistral 7B Instruct** : Insights business français
- **DialoGPT Medium** : Conversationnel fallback
- **tf-allocine** : Sentiment analysis français
- **Prophet** : Prévisions temporelles
- **K-Means** : Segmentation clients

##  Coûts Railway

- **Service IA** : ~$5-10/mois (1GB RAM)
- **Service LLM** : ~$10-20/mois (2GB RAM)
- **Database + Cache** : ~$15/mois
- **Total** : ~$25-45/mois

##  Avantages

- **100% Open Source** : Plus de factures APIs externes
- **Contrôle total** : Données hébergées sur votre infrastructure
- **Performance locale** : Temps de réponse 5-15s pour Mistral
- **Fallbacks automatiques** : Service toujours disponible

---

 **Prêt pour la production Railway !**

Voir `railway-services/README.md` pour les instructions détaillées.
