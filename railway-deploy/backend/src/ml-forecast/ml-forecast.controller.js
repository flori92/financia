const MLForecastService = require('./ml-forecast.service');

class MLForecastController {
  constructor() {
    this.mlService = new MLForecastService();
  }

  // GET /api/v1/ml-forecast/predict
  async generateForecast(req, res) {
    try {
      const { companyId, model = 'Ensemble', horizon = 6, metric = 'revenue' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const forecast = await this.mlService.generateForecast(companyId, model, parseInt(horizon), metric);
      
      res.json({
        success: true,
        data: forecast
      });
    } catch (error) {
      console.error('Erreur génération forecast:', error);
      res.status(500).json({ 
        error: error.message,
        details: 'Vérifiez que vous avez au moins 12 mois de données comptables'
      });
    }
  }

  // POST /api/v1/ml-forecast/train
  async trainModels(req, res) {
    try {
      const { companyId, metric = 'revenue' } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const results = await this.mlService.trainAllModels(companyId, metric);
      
      res.json({
        success: true,
        message: 'Modèles entraînés avec succès',
        data: results
      });
    } catch (error) {
      console.error('Erreur entraînement modèles:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/ml-forecast/models/performance
  async getModelsPerformance(req, res) {
    try {
      const { companyId, metric = 'revenue' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const performances = await this.mlService.getModelsPerformance(companyId, metric);
      
      res.json({
        success: true,
        data: performances
      });
    } catch (error) {
      console.error('Erreur récupération performances:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/ml-forecast/auto-select
  async autoSelectModel(req, res) {
    try {
      const { companyId, metric = 'revenue' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const bestModel = await this.mlService.autoSelectBestModel(companyId, metric);
      
      res.json({
        success: true,
        data: bestModel
      });
    } catch (error) {
      console.error('Erreur auto-sélection modèle:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/ml-forecast/anomalies
  async detectAnomalies(req, res) {
    try {
      const { companyId, metric = 'revenue' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const anomalies = await this.mlService.detectAnomalies(companyId, metric);
      
      res.json({
        success: true,
        data: anomalies
      });
    } catch (error) {
      console.error('Erreur détection anomalies:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/ml-forecast/trend
  async analyzeTrend(req, res) {
    try {
      const { companyId, metric = 'revenue' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const trend = await this.mlService.analyzeTrend(companyId, metric);
      
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      console.error('Erreur analyse tendance:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/ml-forecast/insights
  async getInsights(req, res) {
    try {
      const { companyId, metric = 'revenue' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      // Obtenir prévisions, tendances, anomalies
      const [forecast, trend, anomalies] = await Promise.all([
        this.mlService.generateForecast(companyId, 'Ensemble', 6, metric),
        this.mlService.analyzeTrend(companyId, metric),
        this.mlService.detectAnomalies(companyId, metric)
      ]);

      const insights = [];
      const recommendations = [];

      // Analyser la tendance
      if (trend.trend === 'croissance') {
        insights.push(`Tendance de ${trend.trend} ${trend.strength} détectée avec un taux de croissance de ${trend.growthRate.toFixed(1)}%`);
        
        if (trend.growthRate > 10) {
          recommendations.push('Maintenir la stratégie actuelle de croissance et considérer l\'expansion');
        } else {
          recommendations.push('Optimiser les processus pour accélérer la croissance');
        }
      } else {
        insights.push(`Tendance de ${trend.trend} observée avec un taux de ${Math.abs(trend.growthRate).toFixed(1)}%`);
        recommendations.push('Analyser les causes de la décroissance et mettre en place des actions correctives');
      }

      // Analyser les prévisions
      const avgForecast = forecast.forecasts.reduce((sum, f) => sum + f.predicted, 0) / forecast.forecasts.length;
      const avgConfidence = forecast.forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecast.forecasts.length;
      
      insights.push(`Prévisions générées avec une confiance moyenne de ${avgConfidence.toFixed(1)}%`);
      
      if (avgConfidence > 85) {
        insights.push('Fiabilité élevée des prévisions - données historiques de qualité');
      }

      // Analyser les anomalies
      if (anomalies.length > 0) {
        insights.push(`${anomalies.length} anomalie(s) détectée(s) dans les données historiques`);
        recommendations.push('Vérifier les périodes avec des valeurs anormales et en identifier les causes');
      }

      // Détection de saisonnalité
      const monthlyVariations = forecast.forecasts.map(f => f.predicted);
      const maxVar = Math.max(...monthlyVariations);
      const minVar = Math.min(...monthlyVariations);
      const variationRange = ((maxVar - minVar) / minVar) * 100;
      
      if (variationRange > 20) {
        insights.push(`Saisonnalité détectée avec une variation de ${variationRange.toFixed(1)}% entre périodes`);
        recommendations.push('Planifier les ressources en fonction des variations saisonnières prévues');
      }

      res.json({
        success: true,
        data: {
          insights,
          recommendations,
          metrics: {
            trend: trend,
            avgForecast: avgForecast,
            avgConfidence: avgConfidence,
            anomaliesCount: anomalies.length,
            variationRange: variationRange
          }
        }
      });
    } catch (error) {
      console.error('Erreur génération insights:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/v1/ml-forecast/dashboard
  async getDashboard(req, res) {
    try {
      const { companyId, metric = 'revenue', horizon = 6 } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      // Données complètes pour le dashboard
      const [forecast, models, insights, trend] = await Promise.all([
        this.mlService.generateForecast(companyId, 'Ensemble', parseInt(horizon), metric),
        this.mlService.getModelsPerformance(companyId, metric),
        this.getInsightsData(companyId, metric),
        this.mlService.analyzeTrend(companyId, metric)
      ]);

      res.json({
        success: true,
        data: {
          forecasts: forecast.forecasts,
          models: models,
          insights: insights.insights,
          recommendations: insights.recommendations,
          trend: trend,
          metadata: {
            generatedAt: new Date().toISOString(),
            horizon: horizon,
            metric: metric,
            frequency: 'monthly'
          }
        }
      });
    } catch (error) {
      console.error('Erreur dashboard ML:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getInsightsData(companyId, metric) {
    const [forecast, trend, anomalies] = await Promise.all([
      this.mlService.generateForecast(companyId, 'Ensemble', 6, metric),
      this.mlService.analyzeTrend(companyId, metric),
      this.mlService.detectAnomalies(companyId, metric)
    ]);

    const insights = [];
    const recommendations = [];

    if (trend.trend === 'croissance') {
      insights.push(`Tendance de croissance ${trend.strength} avec un taux de ${trend.growthRate.toFixed(1)}%`);
      recommendations.push('Capitaliser sur la dynamique actuelle');
    } else {
      insights.push(`Tendance de décroissance observée`);
      recommendations.push('Mettre en place des actions correctives');
    }

    const avgConfidence = forecast.forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecast.forecasts.length;
    insights.push(`Confiance moyenne des prévisions: ${avgConfidence.toFixed(1)}%`);

    if (anomalies.length > 0) {
      recommendations.push(`Analyser les ${anomalies.length} anomalie(s) détectée(s)`);
    }

    return { insights, recommendations };
  }
}

module.exports = MLForecastController;
