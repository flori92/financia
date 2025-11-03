// Modèle LSTM simulé (Long Short-Term Memory)
// Dans une vraie implémentation, utiliser TensorFlow.js
class LSTMModel {
  constructor(lookback = 12, layers = [64, 32], epochs = 50) {
    this.lookback = lookback;
    this.layers = layers;
    this.epochs = epochs;
    this.model = null;
    this.scaler = null;
    this.trainedData = null;
  }

  async train(data) {
    this.trainedData = data.map(d => d.amount);
    
    // Normalisation Min-Max
    this.scaler = this.fitMinMaxScaler(this.trainedData);
    const scaledData = this.transform(this.trainedData, this.scaler);
    
    // Créer séquences pour LSTM
    const sequences = this.createSequences(scaledData, this.lookback);
    
    // Simulation d'entraînement LSTM
    // En production, utiliser @tensorflow/tfjs-node
    this.model = {
      weights: this.initializeWeights(sequences),
      bias: this.trainedData.reduce((sum, val) => sum + val, 0) / this.trainedData.length,
      trend: this.calculateTrend(this.trainedData),
      seasonality: this.extractSeasonality(this.trainedData)
    };
    
    return true;
  }

  fitMinMaxScaler(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return { min, max, range: max - min };
  }

  transform(data, scaler) {
    return data.map(val => (val - scaler.min) / scaler.range);
  }

  inverseTransform(scaledData, scaler) {
    return scaledData.map(val => val * scaler.range + scaler.min);
  }

  createSequences(data, lookback) {
    const sequences = [];
    for (let i = lookback; i < data.length; i++) {
      const seq = data.slice(i - lookback, i);
      sequences.push(seq);
    }
    return sequences;
  }

  initializeWeights(sequences) {
    // Poids simplifiés basés sur corrélation temporelle
    const weights = [];
    for (let i = 0; i < this.lookback; i++) {
      const weight = Math.exp(-i / this.lookback) / this.lookback;
      weights.push(weight);
    }
    return weights;
  }

  calculateTrend(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  extractSeasonality(data, period = 12) {
    const seasonalPattern = new Array(period).fill(0);
    const counts = new Array(period).fill(0);
    
    data.forEach((val, index) => {
      const seasonIndex = index % period;
      seasonalPattern[seasonIndex] += val;
      counts[seasonIndex]++;
    });
    
    return seasonalPattern.map((sum, i) => 
      counts[i] > 0 ? sum / counts[i] : 0
    );
  }

  async predict(horizon) {
    if (!this.model || !this.trainedData) {
      throw new Error('Modèle non entraîné');
    }

    const predictions = [];
    let current = [...this.trainedData];
    const lastDate = new Date();
    
    for (let h = 0; h < horizon; h++) {
      // Prendre les dernières valeurs pour la prédiction
      const recentData = current.slice(-this.lookback);
      const scaledRecent = this.transform(recentData, this.scaler);
      
      // Prédiction pondérée
      let weightedSum = 0;
      for (let i = 0; i < this.lookback; i++) {
        weightedSum += scaledRecent[i] * this.model.weights[i];
      }
      
      // Ajouter tendance et saisonnalité
      const trendComponent = this.model.trend.slope * (current.length + h);
      const seasonComponent = this.model.seasonality[(current.length + h) % 12];
      
      const scaledPrediction = weightedSum + (trendComponent / this.scaler.range) * 0.1;
      const predicted = Math.max(0, 
        this.inverseTransform([scaledPrediction], this.scaler)[0] + 
        (seasonComponent - this.model.bias) * 0.3
      );
      
      current.push(predicted);
      
      const predDate = new Date(lastDate);
      predDate.setMonth(predDate.getMonth() + h + 1);
      
      const std = this.calculateStdDev(current.slice(-12));
      
      predictions.push({
        period: predDate.toISOString().slice(0, 7),
        periodStart: new Date(predDate.getFullYear(), predDate.getMonth(), 1),
        periodEnd: new Date(predDate.getFullYear(), predDate.getMonth() + 1, 0),
        predicted: predicted,
        confidence: Math.max(70, 96 - h * 1.5),
        lowerBound: predicted - 1.96 * std,
        upperBound: predicted + 1.96 * std,
        model: 'LSTM',
        features: { 
          lookback: this.lookback, 
          layers: this.layers,
          trend: this.model.trend.slope > 0 ? 'ascending' : 'descending'
        }
      });
    }
    
    return predictions;
  }

  calculateStdDev(series) {
    const mean = series.reduce((sum, val) => sum + val, 0) / series.length;
    const variance = series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / series.length;
    return Math.sqrt(variance);
  }
}

module.exports = LSTMModel;
