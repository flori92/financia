# BMS AI/ML Analytics Service

Service d'intelligence artificielle et de machine learning pour BMS ERP utilisant des APIs open source et modèles pré-entrainés.

## 🚀 Fonctionnalités

### 📊 Prévisions Temporelles
- **Prophet (Facebook)** : Prévisions de CA, dépenses, cash-flow
- **Random Forest** : Prévisions basées sur features multiples  
- **LSTM Neural Networks** : Modèles deep learning pour séries complexes
- **Ensemble Models** : Combinaison de plusieurs modèles pour meilleure précision

### 🧠 Analytics Business
- **OpenAI GPT-4** : Génération d'insights et recommandations business
- **Analyse de sentiment** : Hugging Face pour documents et emails
- **Segmentation clients** : K-Means et RFM analysis
- **Détection d'anomalies** : Identification automatique des outliers

### 💰 Prévisions Financières
- **Cash-flow intelligent** : Prévisions entrées/sorties avec alertes
- **Budget prévisionnel** : Prévisions par catégorie avec optimisation
- **Scénarios what-if** : Simulation de différents cas business
- **Risque financier** : Évaluation et recommandations

## 🛠️ Installation

### Prérequis
- Python 3.9+
- Docker & Docker Compose
- Node.js 18+
- Redis (pour le cache)
- PostgreSQL

### Installation du Service Python

```bash
# Cloner le repository
git clone <repository-url>
cd bms-erp/backend/ai-service

# Installer les dépendances
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API
```

### Configuration des APIs

```bash
# .env
OPENAI_API_KEY=sk-your-openai-key
HUGGINGFACE_API_KEY=hf-your-huggingface-key
AI_SERVICE_URL=http://localhost:8000
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🚀 Déploiement

### Option 1: Docker (Recommandé)

```bash
# Build l'image
docker build -t bms-ai-service .

# Lancer le service
docker run -p 8000:8000 --env-file .env bms-ai-service
```

### Option 2: Docker Compose

```bash
# Lancer tous les services (IA + Redis + PostgreSQL)
docker-compose up -d
```

### Option 3: Développement Local

```bash
# Lancer le service Python
python app.py

# Le service sera disponible sur http://localhost:8000
```

## 📡 API Endpoints

### Prévisions
```http
POST /api/forecast/prophet
POST /api/cashflow/forecast  
POST /api/budget/forecast
```

### Analytics
```http
POST /api/customers/segment
POST /api/insights/business
POST /api/documents/sentiment
```

### Modèles
```http
GET /api/models/status
POST /api/models/retrain
```

## 🔌 Intégration Frontend

### Exemple d'utilisation

```typescript
// Prévision de CA
const forecastResponse = await fetch('/api/v1/ai/forecast/revenue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'uuid',
    historicalData: [{ date: '2024-01-01', revenue: 100000 }],
    horizon: 180,
    frequency: 'daily'
  })
});

const forecast = await forecastResponse.json();
```

## 📈 Modèles Disponibles

### Prophet (Facebook)
- **Usage** : Séries temporelles avec saisonnalité
- **Précision** : 85-95% avec données suffisantes
- **Force** : Gère automatiquement tendances, saisonnalité, holidays

### Random Forest
- **Usage** : Prévisions avec variables exogènes
- **Précision** : 75-90%
- **Force** : Robuste aux outliers, features multiples

### LSTM Neural Networks
- **Usage** : Séries complexes non-linéaires
- **Précision** : 80-92%
- **Force** : Capture patterns complexes, mémoire à long terme

### OpenAI GPT-4
- **Usage** : Insights business, recommandations
- **Force** : Compréhension contextuelle, génération de texte
- **Limitation** : Requiert API key payante

## 🎯 Cas d'Usage

### 1. Prévisions de Ventes
```json
{
  "historicalData": [
    {"date": "2024-01-01", "revenue": 100000, "category": "produits A"},
    {"date": "2024-01-02", "revenue": 120000, "category": "services B"}
  ],
  "horizon": 90,
  "frequency": "daily"
}
```

### 2. Cash Flow Prévisionnel
```json
{
  "inflows": [
    {"date": "2024-01-01", "amount": 50000, "source": "ventes"},
    {"date": "2024-01-15", "amount": 30000, "source": "créances"}
  ],
  "outflows": [
    {"date": "2024-01-05", "amount": 25000, "category": "salaires"},
    {"date": "2024-01-20", "amount": 15000, "category": "fournisseurs"}
  ]
}
```

### 3. Segmentation Clients
```json
{
  "customers": [
    {"id": "client1", "total_revenue": 100000, "frequency": 12, "recency": 5, "avg_transaction": 8333},
    {"id": "client2", "total_revenue": 50000, "frequency": 6, "recency": 15, "avg_transaction": 8333}
  ]
}
```

## 📊 Métriques de Performance

### Précision des Modèles
- **R² Score** : 0.75-0.95 (plus élevé = meilleur)
- **MAE** : Erreur absolue moyenne
- **RMSE** : Erreur quadratique moyenne  
- **MAPE** : Erreur absolue percentage

### Temps de Réponse
- **Prophet** : 2-5 secondes pour 365 jours
- **Random Forest** : 1-3 secondes
- **GPT Insights** : 5-15 secondes
- **Segmentation** : 1-2 secondes

## 🔧 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Statut des Modèles
```bash
curl http://localhost:8000/api/models/status
```

### Logs
```bash
# Docker logs
docker logs bms-ai-service

# Local logs
tail -f logs/ai-service.log
```

## 🚨 Dépannage

### Problèmes Communs

**1. Erreur API OpenAI**
```bash
# Vérifier la clé API
echo $OPENAI_API_KEY

# Tester la connexion
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**2. Prophet ne s'installe pas**
```bash
# Installer les dépendances système
sudo apt-get install build-essential

# Réinstaller Prophet
pip uninstall prophet
pip install prophet
```

**3. Mémoire insuffisante**
```bash
# Augmenter la mémoire Docker
docker run --memory=4g bms-ai-service
```

### Fallbacks Automatiques
- Si Prophet échoue → Régression linéaire
- Si OpenAI indisponible → Insights basiques
- Si APIs externes down → Données simulées

## 🔄 Mises à Jour

### Réentraînement des Modèles
```bash
# Automatique chaque mois
curl -X POST http://localhost:8000/api/models/retrain \
  -H "Content-Type: application/json" \
  -d '{"models": ["prophet", "random_forest"], "companyId": "uuid"}'
```

### Nouvelles Features
- V1.1 : Ajout support multi-devises
- V1.2 : Intégration marché boursier (Yahoo Finance)
- V1.3 : Modèles de détection de fraude

## 📚 Documentation

- [Prophet Documentation](https://facebook.github.io/prophet/)
- [Scikit-learn Guide](https://scikit-learn.org/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

## 🤝 Contribution

1. Fork le repository
2. Créer une feature branch
3. Ajouter des tests unitaires
4. Pull request avec description

## 📄 Licence

MIT License - voir fichier LICENSE
