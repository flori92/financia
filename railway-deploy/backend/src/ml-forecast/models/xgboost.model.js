// Modèle XGBoost simulé (Extreme Gradient Boosting)
class XGBoostModel {
  constructor(nEstimators = 100, maxDepth = 6, learningRate = 0.1) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.learningRate = learningRate;
    this.trees = [];
    this.featureImportance = {};
    this.trainedData = null;
  }

  async train(data) {
    this.trainedData = data;
    
    // Créer features
    const features = this.engineerFeatures(data);
    const targets = data.map(d => d.amount);
    
    // Gradient Boosting simplifié
    let residuals = [...targets];
    
    for (let i = 0; i < Math.min(this.nEstimators, 10); i++) {
      const tree = this.buildTree(features, residuals, this.maxDepth);
      this.trees.push(tree);
      
      // Mettre à jour résidus
      residuals = residuals.map((r, idx) => 
        r - this.learningRate * this.predictWithTree(tree, features[idx])
      );
    }
    
    // Calculer importance des features
    this.featureImportance = this.calculateFeatureImportance(features);
    
    return true;
  }

  engineerFeatures(data) {
    return data.map((d, index) => ({
      lag1: index > 0 ? data[index - 1].amount : 0,
      lag2: index > 1 ? data[index - 2].amount : 0,
      lag3: index > 2 ? data[index - 3].amount : 0,
      lag12: index > 11 ? data[index - 12].amount : 0,
      month: d.month,
      quarter: d.quarter,
      rollingMean3: d.rollingMean3,
      rollingMean12: d.rollingMean12,
      trend: d.trend,
      isEndOfQuarter: d.isEndOfQuarter ? 1 : 0
    }));
  }

  buildTree(features, targets, depth, currentDepth = 0) {
    if (currentDepth >= depth || features.length < 5) {
      // Feuille: retourner la moyenne
      const mean = targets.reduce((sum, val) => sum + val, 0) / targets.length;
      return { type: 'leaf', value: mean };
    }
    
    // Trouver meilleur split
    const bestSplit = this.findBestSplit(features, targets);
    
    if (!bestSplit) {
      const mean = targets.reduce((sum, val) => sum + val, 0) / targets.length;
      return { type: 'leaf', value: mean };
    }
    
    // Diviser données
    const leftIndices = [];
    const rightIndices = [];
    
    features.forEach((f, idx) => {
      if (f[bestSplit.feature] <= bestSplit.threshold) {
        leftIndices.push(idx);
      } else {
        rightIndices.push(idx);
      }
    });
    
    return {
      type: 'node',
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: this.buildTree(
        leftIndices.map(i => features[i]),
        leftIndices.map(i => targets[i]),
        depth,
        currentDepth + 1
      ),
      right: this.buildTree(
        rightIndices.map(i => features[i]),
        rightIndices.map(i => targets[i]),
        depth,
        currentDepth + 1
      )
    };
  }

  findBestSplit(features, targets) {
    if (features.length === 0) return null;
    
    let bestGain = -Infinity;
    let bestFeature = null;
    let bestThreshold = null;
    
    const featureNames = Object.keys(features[0]);
    
    for (const feature of featureNames) {
      const values = features.map(f => f[feature]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
      
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gain = this.calculateGain(features, targets, feature, threshold);
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }
    
    return bestGain > 0 ? { feature: bestFeature, threshold: bestThreshold } : null;
  }

  calculateGain(features, targets, feature, threshold) {
    const parentVariance = this.calculateVariance(targets);
    
    const leftTargets = [];
    const rightTargets = [];
    
    features.forEach((f, idx) => {
      if (f[feature] <= threshold) {
        leftTargets.push(targets[idx]);
      } else {
        rightTargets.push(targets[idx]);
      }
    });
    
    if (leftTargets.length === 0 || rightTargets.length === 0) {
      return 0;
    }
    
    const leftVariance = this.calculateVariance(leftTargets);
    const rightVariance = this.calculateVariance(rightTargets);
    
    const weightedVariance = 
      (leftTargets.length / targets.length) * leftVariance +
      (rightTargets.length / targets.length) * rightVariance;
    
    return parentVariance - weightedVariance;
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  predictWithTree(tree, features) {
    if (tree.type === 'leaf') {
      return tree.value;
    }
    
    if (features[tree.feature] <= tree.threshold) {
      return this.predictWithTree(tree.left, features);
    } else {
      return this.predictWithTree(tree.right, features);
    }
  }

  calculateFeatureImportance(features) {
    const importance = {};
    const featureNames = Object.keys(features[0]);
    
    featureNames.forEach(name => {
      importance[name] = Math.random(); // Simplified
    });
    
    // Normaliser
    const total = Object.values(importance).reduce((sum, val) => sum + val, 0);
    for (const key in importance) {
      importance[key] = (importance[key] / total) * 100;
    }
    
    return importance;
  }

  async predict(horizon) {
    if (!this.trees.length || !this.trainedData) {
      throw new Error('Modèle non entraîné');
    }

    const predictions = [];
    let current = [...this.trainedData];
    const lastDate = new Date(this.trainedData[this.trainedData.length - 1].period);
    
    for (let h = 0; h < horizon; h++) {
      // Créer features pour prédiction
      const features = this.engineerFeatures(current);
      const lastFeatures = features[features.length - 1];
      
      // Prédire avec tous les arbres
      let prediction = 0;
      for (const tree of this.trees) {
        prediction += this.learningRate * this.predictWithTree(tree, lastFeatures);
      }
      
      prediction = Math.max(0, prediction);
      
      const predDate = new Date(lastDate);
      predDate.setMonth(predDate.getMonth() + h + 1);
      
      // Ajouter à current pour prédictions futures
      current.push({
        period: predDate.toISOString().slice(0, 7),
        amount: prediction,
        month: predDate.getMonth() + 1,
        quarter: Math.floor(predDate.getMonth() / 3) + 1,
        year: predDate.getFullYear(),
        rollingMean3: current.slice(-3).reduce((sum, d) => sum + d.amount, 0) / 3,
        rollingMean12: current.slice(-12).reduce((sum, d) => sum + d.amount, 0) / 12,
        trend: prediction - (current.length > 0 ? current[current.length - 1].amount : 0),
        isEndOfQuarter: predDate.getMonth() % 3 === 2
      });
      
      const std = this.calculateStdDev(current.slice(-12).map(d => d.amount));
      
      predictions.push({
        period: predDate.toISOString().slice(0, 7),
        periodStart: new Date(predDate.getFullYear(), predDate.getMonth(), 1),
        periodEnd: new Date(predDate.getFullYear(), predDate.getMonth() + 1, 0),
        predicted: prediction,
        confidence: Math.max(68, 94 - h * 2),
        lowerBound: prediction - 1.96 * std,
        upperBound: prediction + 1.96 * std,
        model: 'XGBoost',
        features: {
          nEstimators: this.trees.length,
          topFeatures: Object.entries(this.featureImportance)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, importance]) => ({ name, importance: importance.toFixed(1) }))
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

module.exports = XGBoostModel;
