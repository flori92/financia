# 🚀 Déploiement BMS AI/ML sur Railway

Ce guide explique comment déployer le service d'intelligence artificielle BMS avec LLM local sur Railway en production.

## 📋 Prérequis

- Compte Railway (https://railway.app)
- Repository GitHub avec le code BMS
- Variables d'environnement configurées

## 🏗️ Architecture Railway

Railway nécessite des services séparés (pas de Docker Compose) :

```
bms-ai-analytics    (Service principal - port 8000)
├── app.railway.py
├── railway.json
└── requirements.txt

bms-llm-service     (Service LLM - port 8001)  
├── llm-service.railway.py
├── railway.llm.json
├── download_models.py
└── requirements.txt

bms-postgres        (Database PostgreSQL)
bms-redis           (Cache Redis)
```

## 📦 Étape 1: Préparer les Services

### Service IA Principal
1. Créer un dossier `bms-ai-analytics` dans votre repo
2. Copier les fichiers :
   - `app.railway.py` → `app.py`
   - `railway.json`
   - `requirements.txt`

### Service LLM
1. Créer un dossier `bms-llm-service` dans votre repo  
2. Copier les fichiers :
   - `llm-service.railway.py` → `llm-service.py`
   - `railway.llm.json` → `railway.json`
   - `download_models.py`
   - `requirements.txt`

## 🔧 Étape 2: Configuration Railway

### 1. Connecter Repository
```bash
# Dans Railway Dashboard
1. "New Project" → "Deploy from GitHub repo"
2. Sélectionner votre repository BMS
3. Choisir la branche main/master
```

### 2. Créer les Services

#### Service IA Principal
```
Nom: bms-ai-analytics
Source: bms-ai-analytics/
Build Command: (automatique avec NIXPACKS)
Start Command: python app.py
Port: 8000
```

#### Service LLM  
```
Nom: bms-llm-service
Source: bms-llm-service/
Build Command: pip install -r requirements.txt && python download_models.py
Start Command: python llm-service.py
Port: 8001
```

#### Database PostgreSQL
```
Nom: bms-postgres
Add-on: PostgreSQL
Version: 14+
```

#### Redis Cache
```
Nom: bms-redis  
Add-on: Redis
Version: 6+
```

## 🔐 Étape 3: Variables d'Environnement

### Service IA Principal
```bash
# Variables Railway - bms-ai-analytics
PORT=8000
DATABASE_URL=${{bms-postgres.DATABASE_URL}}
REDIS_URL=${{bms-redis.REDIS_URL}}
LLM_SERVICE_URL=https://bms-llm-service-production.railway.app
AI_SERVICE_ENV=production
```

### Service LLM
```bash
# Variables Railway - bms-llm-service  
PORT=8001
TRANSFORMERS_CACHE=/tmp/models
TORCH_HOME=/tmp/torch
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128
```

## 🚀 Étape 4: Déploiement

### 1. Déployer les Services
```bash
# Dans Railway Dashboard
1. Déployer bms-postgres (attendre ready)
2. Déployer bms-redis (attendre ready)  
3. Déployer bms-llm-service (attendre ready - 5-10 min)
4. Déployer bms-ai-analytics (attendre ready)
```

### 2. Vérifier le Déploiement
```bash
# Health checks
curl https://bms-ai-analytics-production.railway.app/health
curl https://bms-llm-service-production.railway.app/health

# API endpoints
curl https://bms-llm-service-production.railway.app/api/llm/models
```

## 🔗 Étape 5: Connecter les Services

### Mettre à jour NestJS Backend
Dans votre backend NestJS, mettre à jour les URLs :

```typescript
// src/ai/ai-analytics.service.ts
private readonly BASE_URL = process.env.AI_SERVICE_URL || 'https://bms-ai-analytics-production.railway.app';
private readonly LLM_URL = process.env.LLM_SERVICE_URL || 'https://bms-llm-service-production.railway.app';
```

### Variables Backend Railway
```bash
AI_SERVICE_URL=https://bms-ai-analytics-production.railway.app
LLM_SERVICE_URL=https://bms-llm-service-production.railway.app
```

## 📊 Étape 6: Monitoring

### Logs Railway
```bash
# Dans Railway Dashboard
1. Cliquer sur chaque service
2. Onglet "Logs" pour monitoring en temps réel
3. Onglet "Metrics" pour performances
```

### Health Checks
```bash
# Service IA principal
GET /health
GET /api/models/status

# Service LLM
GET /health  
GET /api/llm/models
POST /api/llm/insights
```

## ⚡ Performance Railway

### Ressources Recommandées
- **Service IA** : 1GB RAM (prophet + scikit-learn)
- **Service LLM** : 2GB RAM (Mistral 7B)
- **Database** : Plan Hobby (début)
- **Redis** : Plan Hobby

### Optimisations
- Les modèles sont pré-chargés pendant le build
- Cache activé pour éviter rechargements
- Fallbacks automatiques si modèles échouent

## 🚨 Gestion des Erreurs

### Problèmes Communs

**1. Service LLM lent au démarrage**
```bash
# Normal - prend 2-5 minutes pour charger les modèles
# Vérifier les logs Railway
# Patienter puis tester le health check
```

**2. Mémoire insuffisante**
```bash
# Upgrader le service LLM vers 2GB RAM
# Ou utiliser modèle léger dans variables env:
LLM_MODEL=lightweight
```

**3. Timeout de build**
```bash
# Railway a des limites de build (15 min)
# Réduire le nombre de modèles dans download_models.py
# Ou utiliser des modèles plus légers
```

### Fallbacks Automatiques
- Si Mistral échoue → DialoGPT → Insights basiques
- Si Prophet échoue → Régression linéaire  
- Si LLM indisponible → Insights basés sur règles

## 🔄 Mises à Jour

### Déploiement Continu
```bash
# Git push vers main → déploiement automatique
git add .
git commit -m "🚀 AI/ML Production Ready"
git push origin main
```

### Déploiements Progressifs
```bash
# Railway supporte les déploiements progressifs
# Activer dans les settings du projet
# Zéro downtime pendant les mises à jour
```

## 💰 Coûts Railway

### Estimation Mensuelle
- **Service IA** : $5-10 ( Hobby plan)
- **Service LLM** : $10-20 ( 2GB RAM)
- **PostgreSQL** : $5-10 ( Hobby plan)  
- **Redis** : $5 ( Hobby plan)
- **Total** : ~$25-45/mois

### Optimisation Coûts
- Utiliser les plans Hobby au début
- Monitorer l'usage et ajuster
- Scaling automatique disponible

## ✅ Checklist Production

- [ ] Repository GitHub connecté
- [ ] Services créés (4 services)
- [ ] Variables d'environnement configurées
- [ ] Health checks OK sur tous services
- [ ] URLs mises à jour dans backend NestJS
- [ ] Frontend connecté aux URLs Railway
- [ ] Monitoring configuré
- [ ] Tests de charge effectués
- [ ] Documentation mise à jour

## 🎯 URLs Production

Une fois déployé, vos services seront accessibles :

```
Service IA Principal: https://bms-ai-analytics-production.railway.app
Service LLM: https://bms-llm-service-production.railway.app
API Docs: https://bms-ai-analytics-production.railway.app/docs
Health Check: https://bms-ai-analytics-production.railway.app/health
```

## 🆘 Support

- **Documentation Railway**: https://docs.railway.app
- **Status Page**: https://status.railway.app  
- **Support**: support@railway.app

---

🎉 **Félicitations !** Votre BMS AI/ML avec LLM local est maintenant en production sur Railway !

**Prochaines étapes:**
1. Monitorer les performances
2. Collecter les feedbacks utilisateurs  
3. Optimiser les modèles et ressources
4. Ajouter de nouvelles fonctionnalités IA
