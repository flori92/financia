// Modèle Ensemble - Combine ARIMA, LSTM, Prophet, XGBoost
const ARIMAModel = require('./arima.model');
const LSTMModel = require('./lstm.model');
const ProphetModel = require('./prophet.model');
const XGBoostModel = require('./xgboost.model');

class EnsembleModel {
  constructor(weights = null) {
    this.models = {
      ARIMA: new ARIMAModel(),
      LSTM: new LSTMModel(),
      Prophet: new ProphetModel(),
      XGBoost: new XGBoostModel()
    };
    
    // Poids pour chaque modèle (optimisés par validation)
    this.weights = weights || {
      ARIMA: 0.20,
      LSTM: 0.30,
      Prophet: 0.25,
      XGBoost: 0.25
    };
    
    this.modelPerformances = {};
  }

  async train(data) {
    // Entraîner tous les modèles en parallèle
    const trainingPromises = Object.entries(this.models).map(async ([name, model]) => {
      try {
        await model.train(data);
        return { name, success: true };
      } catch (error) {
        console.error(`Erreur entraînement modèle ${name}:`, error);
        return { name, success: false, error };
      }
    });
    
    const results = await Promise.all(trainingPromises);
    
    // Vérifier qu'au moins un modèle a réussi
    const successfulModels = results.filter(r => r.success);
    if (successfulModels.length === 0) {
      throw new Error('Aucun modèle n\'a pu être entraîné');
    }
    
    // Optimiser les poids si possible (validation croisée)
    await this.optimizeWeights(data);
    
    return true;
  }

  async optimizeWeights(data) {
    if (data.length < 24) {
      // Pas assez de données pour optimisation
      return;
    }
    
    // Split 80/20 pour validation
    const splitIndex = Math.floor(data.length * 0.8);
    const trainData = data.slice(0, splitIndex);
    const validData = data.slice(splitIndex);
    
    // Obtenir prédictions de chaque modèle
    const modelPredictions = {};
    const actualValues = validData.map(d => d.amount);
    
    for (const [name, model] of Object.entries(this.models)) {
      try {
        const predictions = await model.predict(validData.length);
        const predictedValues = predictions.map(p => p.predicted);
        
        // Calculer erreur
        const mae = this.calculateMAE(actualValues, predictedValues);
        
        modelPredictions[name] = {
          predictions: predictedValues,
          mae: mae
        };
        
        this.modelPerformances[name] = { mae };
      } catch (error) {
        console.error(`Erreur prédiction ${name} pour optimisation:`, error);
      }
    }
    
    // Optimiser poids par inverse de MAE
    const totalInverseMae = Object.values(modelPredictions)
      .reduce((sum, m) => sum + (1 / m.mae), 0);
    
    for (const name in modelPredictions) {
      this.weights[name] = (1 / modelPredictions[name].mae) / totalInverseMae;
    }
  }

  calculateMAE(actual, predicted) {
    const n = Math.min(actual.length, predicted.length);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.abs(actual[i] - predicted[i]);
    }
    return sum / n;
  }

  async predict(horizon) {
    // Obtenir prédictions de tous les modèles
    const modelPredictions = {};
    
    for (const [name, model] of Object.entries(this.models)) {
      try {
        modelPredictions[name] = await model.predict(horizon);
      } catch (error) {
        console.error(`Erreur prédiction modèle ${name}:`, error);
      }
    }
    
    // Vérifier qu'au moins un modèle a réussi
    if (Object.keys(modelPredictions).length === 0) {
      throw new Error('Aucun modèle n\'a pu générer de prédictions');
    }
    
    // Combiner les prédictions
    const ensemblePredictions = [];
    
    for (let h = 0; h < horizon; h++) {
      let weightedPrediction = 0;
      let weightedLowerBound = 0;
      let weightedUpperBound = 0;
      let totalWeight = 0;
      let periodInfo = null;
      
      const contributingModels = [];
      
      for (const [name, predictions] of Object.entries(modelPredictions)) {
        if (predictions[h]) {
          const weight = this.weights[name] || 0;
          weightedPrediction += predictions[h].predicted * weight;
          weightedLowerBound += predictions[h].lowerBound * weight;
          weightedUpperBound += predictions[h].upperBound * weight;
          totalWeight += weight;
          
          contributingModels.push({
            model: name,
            prediction: predictions[h].predicted,
            weight: weight
          });
          
          if (!periodInfo) {
            periodInfo = {
              period: predictions[h].period,
              periodStart: predictions[h].periodStart,
              periodEnd: predictions[h].periodEnd
            };
          }
        }
      }
      
      if (totalWeight > 0) {
        const finalPrediction = weightedPrediction / totalWeight;
        const finalLowerBound = weightedLowerBound / totalWeight;
        const finalUpperBound = weightedUpperBound / totalWeight;
        
        // Calculer confiance basée sur consensus
        const predictions = contributingModels.map(m => m.prediction);
        const mean = predictions.reduce((sum, val) => sum + val, 0) / predictions.length;
        const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;
        const coefficientOfVariation = Math.sqrt(variance) / mean;
        
        // Confiance inverse au coefficient de variation
        const confidence = Math.max(60, Math.min(97, 95 - (coefficientOfVariation * 100) - (h * 1.5)));
        
        ensemblePredictions.push({
          ...periodInfo,
          predicted: finalPrediction,
          confidence: confidence,
          lowerBound: finalLowerBound,
          upperBound: finalUpperBound,
          model: 'Ensemble',
          features: {
            weights: this.weights,
            contributingModels: contributingModels.map(m => ({
              model: m.model,
              contribution: ((m.prediction * m.weight) / weightedPrediction * 100).toFixed(1) + '%'
            })),
            consensus: {
              mean: mean,
              variance: variance,
              coefficientOfVariation: coefficientOfVariation.toFixed(3)
            }
          }
        });
      }
    }
    
    return ensemblePredictions;
  }

  // Obtenir l'importance des features agrégée
  getFeatureImportance() {
    // Seulement XGBoost a feature importance
    if (this.models.XGBoost && this.models.XGBoost.featureImportance) {
      return this.models.XGBoost.featureImportance;
    }
    return {};
  }

  // Obtenir les performances individuelles des modèles
  getModelPerformances() {
    return this.modelPerformances;
  }

  // Diagnostic de l'ensemble
  getDiagnostics() {
    return {
      weights: this.weights,
      performances: this.modelPerformances,
      featureImportance: this.getFeatureImportance(),
      activeModels: Object.keys(this.models).length
    };
  }
}

module.exports = EnsembleModel;
