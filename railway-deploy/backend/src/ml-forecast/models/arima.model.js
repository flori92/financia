// Modèle ARIMA simplifié (AutoRegressive Integrated Moving Average)
class ARIMAModel {
  constructor(p = 2, d = 1, q = 2) {
    this.p = p; // ordre AR
    this.d = d; // ordre différenciation
    this.q = q; // ordre MA
    this.coefficients = null;
    this.trainedData = null;
  }

  async train(data) {
    this.trainedData = data.map(d => d.amount);
    
    // Différenciation pour rendre la série stationnaire
    const diff = this.difference(this.trainedData, this.d);
    
    // Estimation simple des coefficients AR et MA
    this.coefficients = {
      ar: this.estimateARCoefficients(diff, this.p),
      ma: this.estimateMACoefficients(diff, this.q),
      mean: diff.reduce((sum, val) => sum + val, 0) / diff.length
    };
    
    return true;
  }

  difference(series, order) {
    let result = [...series];
    for (let i = 0; i < order; i++) {
      result = result.slice(1).map((val, index) => val - result[index]);
    }
    return result;
  }

  estimateARCoefficients(series, p) {
    // Estimation par méthode des moindres carrés (simplified)
    const coeffs = [];
    for (let lag = 1; lag <= p; lag++) {
      let sum = 0, count = 0;
      for (let i = lag; i < series.length; i++) {
        sum += series[i] * series[i - lag];
        count++;
      }
      coeffs.push(count > 0 ? sum / count / 1000 : 0);
    }
    return coeffs;
  }

  estimateMACoefficients(series, q) {
    // Estimation simplifiée des coefficients MA
    const residuals = this.calculateResiduals(series);
    const coeffs = [];
    for (let lag = 1; lag <= q; lag++) {
      let sum = 0, count = 0;
      for (let i = lag; i < residuals.length; i++) {
        sum += residuals[i] * residuals[i - lag];
        count++;
      }
      coeffs.push(count > 0 ? sum / count / 1000 : 0);
    }
    return coeffs;
  }

  calculateResiduals(series) {
    const mean = series.reduce((sum, val) => sum + val, 0) / series.length;
    return series.map(val => val - mean);
  }

  async predict(horizon) {
    if (!this.coefficients || !this.trainedData) {
      throw new Error('Modèle non entraîné');
    }

    const predictions = [];
    let current = [...this.trainedData];
    const lastDate = new Date();
    
    for (let h = 0; h < horizon; h++) {
      // Prédiction AR
      let arComponent = 0;
      for (let i = 0; i < this.p; i++) {
        const index = current.length - 1 - i;
        if (index >= 0) {
          arComponent += this.coefficients.ar[i] * current[index];
        }
      }
      
      // Prédiction MA (simplifiée)
      let maComponent = 0;
      for (let i = 0; i < this.q; i++) {
        maComponent += this.coefficients.ma[i] * (this.coefficients.mean / 10);
      }
      
      const predicted = Math.max(0, arComponent + maComponent + this.coefficients.mean);
      current.push(predicted);
      
      const predDate = new Date(lastDate);
      predDate.setMonth(predDate.getMonth() + h + 1);
      
      const std = this.calculateStdDev(current.slice(-12));
      
      predictions.push({
        period: predDate.toISOString().slice(0, 7),
        periodStart: new Date(predDate.getFullYear(), predDate.getMonth(), 1),
        periodEnd: new Date(predDate.getFullYear(), predDate.getMonth() + 1, 0),
        predicted: predicted,
        confidence: Math.max(60, 95 - h * 2),
        lowerBound: predicted - 1.96 * std,
        upperBound: predicted + 1.96 * std,
        model: 'ARIMA',
        features: { p: this.p, d: this.d, q: this.q }
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

module.exports = ARIMAModel;
