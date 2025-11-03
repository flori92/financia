const database = require('../../database');

class MLForecastService {
  constructor() {
    this.models = {
      'ARIMA': require('./models/arima.model'),
      'LSTM': require('./models/lstm.model'),
      'Prophet': require('./models/prophet.model'),
      'XGBoost': require('./models/xgboost.model'),
      'Ensemble': require('./models/ensemble.model')
    };
    this.cache = new Map();
    this.performanceCache = new Map();
  }

  // Préparer les données historiques
  async prepareHistoricalData(companyId, metric = 'revenue', years = 2) {
    // Générer données mock pour démo (en attendant vraies données comptables)
    const rawData = this.generateMockHistoricalData(years);
    return this.enrichFeatures(rawData);
  }

  generateMockHistoricalData(years = 2) {
    const data = [];
    const now = new Date();
    const monthsToGenerate = years * 12;
    
    // Générer données historiques réalistes
    let baseAmount = 2000000;
    const trend = 50000; // Croissance mensuelle
    const seasonality = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.0, 0.95, 1.0, 1.2]; // Saisonnalité annuelle
    
    for (let i = monthsToGenerate - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const seasonalFactor = seasonality[month];
      const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variation aléatoire
      
      const amount = baseAmount + (trend * (monthsToGenerate - i)) * seasonalFactor * randomFactor;
      
      data.push({
        period: date.toISOString().slice(0, 10),
        amount: Math.round(amount)
      });
    }
    
    return data;
  }

  // Enrichir avec features temporelles et tendances
  enrichFeatures(data) {
    return data.map((row, index) => {
      const date = new Date(row.period);
      return {
        period: row.period,
        amount: parseFloat(row.amount || 0),
        month: date.getMonth() + 1,
        quarter: Math.floor(date.getMonth() / 3) + 1,
        year: date.getFullYear(),
        dayOfWeek: date.getDay(),
        weekOfYear: this.getWeekNumber(date),
        isEndOfQuarter: date.getMonth() % 3 === 2,
        lag1: index > 0 ? parseFloat(data[index - 1].amount || 0) : 0,
        lag3: index > 2 ? parseFloat(data[index - 3].amount || 0) : 0,
        lag12: index > 11 ? parseFloat(data[index - 12].amount || 0) : 0,
        rollingMean3: this.calculateRollingMean(data, index, 3),
        rollingMean12: this.calculateRollingMean(data, index, 12),
        trend: index > 0 ? parseFloat(row.amount) - parseFloat(data[index - 1].amount || 0) : 0
      };
    });
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  }

  calculateRollingMean(data, currentIndex, window) {
    if (currentIndex < window - 1) return 0;
    let sum = 0;
    for (let i = currentIndex - window + 1; i <= currentIndex; i++) {
      sum += parseFloat(data[i].amount || 0);
    }
    return sum / window;
  }

  // Générer prévisions avec un modèle spécifique
  async generateForecast(companyId, model = 'Ensemble', horizon = 6, metric = 'revenue') {
    try {
      const cacheKey = `${companyId}_${model}_${horizon}_${metric}`;
      
      // Vérifier cache (5 minutes)
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) {
          return cached.data;
        }
      }

      // Préparer données
      const historicalData = await this.prepareHistoricalData(companyId, metric);
      
      if (historicalData.length < 12) {
        throw new Error('Données insuffisantes pour entraîner le modèle (minimum 12 mois)');
      }

      // Entraîner et prédire
      const ModelClass = this.models[model];
      const modelInstance = new ModelClass();
      
      await modelInstance.train(historicalData);
      const predictions = await modelInstance.predict(horizon);
      
      // Sauvegarder prévisions
      await this.saveForecastsToDatabase(companyId, predictions, model, metric);
      
      // Mettre en cache
      const result = {
        forecasts: predictions,
        model: model,
        metric: metric,
        generatedAt: new Date().toISOString()
      };
      
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error(`Erreur génération forecast ${model}:`, error);
      throw error;
    }
  }

  // Entraîner tous les modèles et comparer performances
  async trainAllModels(companyId, metric = 'revenue') {
    const results = [];
    const historicalData = await this.prepareHistoricalData(companyId, metric);
    
    // Split train/test (80/20)
    const splitIndex = Math.floor(historicalData.length * 0.8);
    const trainData = historicalData.slice(0, splitIndex);
    const testData = historicalData.slice(splitIndex);
    
    for (const [modelName, ModelClass] of Object.entries(this.models)) {
      try {
        const startTime = Date.now();
        const model = new ModelClass();
        
        await model.train(trainData);
        const predictions = await model.predict(testData.length);
        
        // Calculer métriques
        const metrics = this.calculateMetrics(
          testData.map(d => d.amount),
          predictions.map(p => p.predicted)
        );
        
        const trainingTime = Math.floor((Date.now() - startTime) / 1000);
        
        // Sauvegarder performance
        await this.saveModelPerformance(companyId, modelName, metric, {
          ...metrics,
          trainingTime,
          sampleSize: trainData.length
        });
        
        results.push({
          model: modelName,
          ...metrics,
          trainingTime
        });
      } catch (error) {
        console.error(`Erreur entraînement modèle ${modelName}:`, error);
      }
    }
    
    return results.sort((a, b) => b.accuracy - a.accuracy);
  }

  // Calculer métriques de performance
  calculateMetrics(actual, predicted) {
    const n = actual.length;
    let mae = 0, mse = 0, mape = 0;
    let actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
    let ssTot = 0, ssRes = 0;
    
    for (let i = 0; i < n; i++) {
      const error = Math.abs(actual[i] - predicted[i]);
      mae += error;
      mse += error * error;
      mape += actual[i] !== 0 ? (error / Math.abs(actual[i])) : 0;
      ssTot += Math.pow(actual[i] - actualMean, 2);
      ssRes += Math.pow(actual[i] - predicted[i], 2);
    }
    
    const r2 = 1 - (ssRes / ssTot);
    const accuracy = Math.max(0, Math.min(100, (1 - mape / n) * 100));
    
    return {
      mae: mae / n,
      rmse: Math.sqrt(mse / n),
      mape: (mape / n) * 100,
      r2Score: r2,
      accuracy: accuracy
    };
  }

  async saveForecastsToDatabase(companyId, predictions, model, metric) {
    // Stub - pas de sauvegarde pour l'instant (système en mémoire)
    // TODO: implémenter avec database.js quand tables créées
    return true;
  }

  async saveModelPerformance(companyId, model, metric, metrics) {
    // Stocker en mémoire pour cette session
    const key = `${companyId}_${model}_${metric}`;
    if (!this.performanceCache) {
      this.performanceCache = new Map();
    }
    
    this.performanceCache.set(key, {
      company_id: companyId,
      model,
      metric,
      trained_at: new Date().toISOString(),
      ...metrics,
      status: 'active'
    });
    
    return true;
  }

  // Obtenir les performances de tous les modèles
  async getModelsPerformance(companyId, metric = 'revenue') {
    // Retourner depuis cache mémoire ou données mock
    if (this.performanceCache) {
      const results = [];
      for (const [key, value] of this.performanceCache.entries()) {
        if (value.company_id === companyId && value.metric === metric) {
          results.push(value);
        }
      }
      
      if (results.length > 0) {
        return results.sort((a, b) => b.accuracy - a.accuracy);
      }
    }
    
    // Données mock par défaut
    return [
      { model: 'Ensemble', accuracy: 95.8, mae: 98000, rmse: 145000, mape: 3.4, trained_at: new Date().toISOString(), status: 'active' },
      { model: 'LSTM', accuracy: 94.2, mae: 125000, rmse: 180000, mape: 4.2, trained_at: new Date().toISOString(), status: 'active' },
      { model: 'ARIMA', accuracy: 91.8, mae: 156000, rmse: 210000, mape: 5.1, trained_at: new Date().toISOString(), status: 'active' },
      { model: 'Prophet', accuracy: 89.5, mae: 189000, rmse: 245000, mape: 6.2, trained_at: new Date().toISOString(), status: 'active' }
    ];
  }

  // Auto-sélection du meilleur modèle (AutoML)
  async autoSelectBestModel(companyId, metric = 'revenue') {
    const performances = await this.getModelsPerformance(companyId, metric);
    
    if (performances.length === 0) {
      // Entraîner tous les modèles
      await this.trainAllModels(companyId, metric);
      return await this.getModelsPerformance(companyId, metric);
    }
    
    return performances[0]; // Meilleur modèle
  }

  // Détection d'anomalies
  async detectAnomalies(companyId, metric = 'revenue') {
    const historicalData = await this.prepareHistoricalData(companyId, metric);
    
    // Calculer statistiques
    const amounts = historicalData.map(d => d.amount);
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    );
    
    // Détection avec méthode Z-score (3 sigma)
    const anomalies = historicalData.filter((d, index) => {
      const zScore = Math.abs((d.amount - mean) / stdDev);
      return zScore > 3;
    });
    
    return anomalies;
  }

  // Analyse de tendance
  async analyzeTrend(companyId, metric = 'revenue') {
    const historicalData = await this.prepareHistoricalData(companyId, metric);
    const amounts = historicalData.map(d => d.amount);
    
    // Régression linéaire simple
    const n = amounts.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += amounts[i];
      sumXY += i * amounts[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Taux de croissance moyen
    const growthRate = (slope / intercept) * 100;
    
    return {
      trend: slope > 0 ? 'croissance' : 'décroissance',
      slope,
      growthRate,
      strength: Math.abs(slope) > (intercept * 0.05) ? 'forte' : 'faible'
    };
  }
}

module.exports = MLForecastService;
