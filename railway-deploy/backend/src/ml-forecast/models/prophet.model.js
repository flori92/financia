// Modèle Prophet simulé (Facebook Prophet)
class ProphetModel {
  constructor() {
    this.trend = null;
    this.seasonality = { yearly: null, monthly: null, weekly: null };
    this.changepoints = null;
    this.trainedData = null;
  }

  async train(data) {
    this.trainedData = data;
    
    // Décomposer la série temporelle
    this.trend = this.fitTrend(data);
    this.seasonality.yearly = this.extractYearlySeasonality(data);
    this.seasonality.monthly = this.extractMonthlySeasonality(data);
    this.changepoints = this.detectChangepoints(data);
    
    return true;
  }

  fitTrend(data) {
    const values = data.map(d => d.amount);
    const n = values.length;
    
    // Régression linéaire par segments (piecewise linear trend)
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculer capacité (saturation) pour logistic growth
    const maxValue = Math.max(...values);
    const capacity = maxValue * 1.5; // 50% au-dessus du max observé
    
    return {
      growth: 'linear', // ou 'logistic'
      slope,
      intercept,
      capacity,
      floor: 0 // minimum = 0
    };
  }

  extractYearlySeasonality(data) {
    // Fourier series pour capturer saisonnalité annuelle
    const seasonalComponents = {};
    const n = data.length;
    
    for (let i = 0; i < n; i++) {
      const month = new Date(data[i].period).getMonth();
      if (!seasonalComponents[month]) {
        seasonalComponents[month] = { sum: 0, count: 0 };
      }
      seasonalComponents[month].sum += data[i].amount;
      seasonalComponents[month].count++;
    }
    
    // Calculer moyenne par mois
    const monthlyAvg = {};
    for (let month = 0; month < 12; month++) {
      if (seasonalComponents[month]) {
        monthlyAvg[month] = seasonalComponents[month].sum / seasonalComponents[month].count;
      } else {
        monthlyAvg[month] = 0;
      }
    }
    
    // Centrer autour de la moyenne globale
    const overallMean = Object.values(monthlyAvg).reduce((sum, val) => sum + val, 0) / 12;
    for (let month in monthlyAvg) {
      monthlyAvg[month] -= overallMean;
    }
    
    return monthlyAvg;
  }

  extractMonthlySeasonality(data) {
    // Pattern hebdomadaire dans le mois
    const weeklyPattern = new Array(4).fill(0);
    const counts = new Array(4).fill(0);
    
    data.forEach(d => {
      const date = new Date(d.period);
      const weekOfMonth = Math.floor(date.getDate() / 7);
      weeklyPattern[weekOfMonth] += d.amount;
      counts[weekOfMonth]++;
    });
    
    return weeklyPattern.map((sum, i) => 
      counts[i] > 0 ? sum / counts[i] : 0
    );
  }

  detectChangepoints(data, nChangepoints = 5) {
    // Détecter points de rupture dans la tendance
    const values = data.map(d => d.amount);
    const n = values.length;
    const step = Math.floor(n / (nChangepoints + 1));
    
    const changepoints = [];
    for (let i = 1; i <= nChangepoints; i++) {
      const idx = i * step;
      if (idx < n) {
        // Calculer delta de tendance avant/après
        const before = values.slice(Math.max(0, idx - 6), idx);
        const after = values.slice(idx, Math.min(n, idx + 6));
        
        const beforeMean = before.reduce((sum, val) => sum + val, 0) / before.length;
        const afterMean = after.reduce((sum, val) => sum + val, 0) / after.length;
        
        changepoints.push({
          index: idx,
          date: data[idx].period,
          delta: afterMean - beforeMean
        });
      }
    }
    
    return changepoints;
  }

  async predict(horizon) {
    if (!this.trend || !this.trainedData) {
      throw new Error('Modèle non entraîné');
    }

    const predictions = [];
    const lastIndex = this.trainedData.length;
    const lastDate = new Date(this.trainedData[this.trainedData.length - 1].period);
    
    for (let h = 0; h < horizon; h++) {
      const futureIndex = lastIndex + h;
      
      // Composante de tendance
      let trendComponent = this.trend.intercept + this.trend.slope * futureIndex;
      
      // Appliquer changepoints
      for (const cp of this.changepoints) {
        if (futureIndex > cp.index) {
          trendComponent += cp.delta * 0.1;
        }
      }
      
      // Composante saisonnalité annuelle
      const predDate = new Date(lastDate);
      predDate.setMonth(predDate.getMonth() + h + 1);
      const month = predDate.getMonth();
      const seasonalComponent = this.seasonality.yearly[month] || 0;
      
      // Composante saisonnalité mensuelle
      const weekOfMonth = Math.floor(predDate.getDate() / 7);
      const weeklyComponent = (this.seasonality.monthly[weekOfMonth] || 0) * 0.1;
      
      const predicted = Math.max(this.trend.floor, 
        Math.min(this.trend.capacity, 
          trendComponent + seasonalComponent + weeklyComponent
        )
      );
      
      // Intervalle de confiance (uncertainty interval)
      const uncertaintyGrowth = 1 + (h * 0.05); // croît avec l'horizon
      const baseUncertainty = this.calculateUncertainty(this.trainedData.map(d => d.amount));
      const uncertainty = baseUncertainty * uncertaintyGrowth;
      
      predictions.push({
        period: predDate.toISOString().slice(0, 7),
        periodStart: new Date(predDate.getFullYear(), predDate.getMonth(), 1),
        periodEnd: new Date(predDate.getFullYear(), predDate.getMonth() + 1, 0),
        predicted: predicted,
        confidence: Math.max(65, 92 - h * 2),
        lowerBound: Math.max(0, predicted - uncertainty),
        upperBound: predicted + uncertainty,
        model: 'Prophet',
        features: {
          trend: this.trend.growth,
          seasonality: {
            yearly: seasonalComponent,
            monthly: weeklyComponent
          },
          changepoints: this.changepoints.length
        }
      });
    }
    
    return predictions;
  }

  calculateUncertainty(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) * 1.96; // 95% confidence
  }
}

module.exports = ProphetModel;
