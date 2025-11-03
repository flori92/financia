const MLForecastController = require('./ml-forecast.controller');
const MLForecastService = require('./ml-forecast.service');
const { MLForecast, MLForecastSchema, MLModelPerformance, MLModelPerformanceSchema } = require('./ml-forecast.entity');

class MLForecastModule {
  static getControllers() {
    return [MLForecastController];
  }

  static getServices() {
    return [MLForecastService];
  }

  static getEntities() {
    return [
      { name: 'MLForecast', schema: MLForecastSchema },
      { name: 'MLModelPerformance', schema: MLModelPerformanceSchema }
    ];
  }

  static getRoutes(router) {
    const controller = new MLForecastController();

    // Dashboard complet ML
    router.get('/api/v1/ml-forecast/dashboard', (req, res) => controller.getDashboard(req, res));

    // Génération de prévisions
    router.get('/api/v1/ml-forecast/predict', (req, res) => controller.generateForecast(req, res));

    // Entraînement des modèles
    router.post('/api/v1/ml-forecast/train', (req, res) => controller.trainModels(req, res));

    // Performances des modèles
    router.get('/api/v1/ml-forecast/models/performance', (req, res) => controller.getModelsPerformance(req, res));

    // Auto-sélection du meilleur modèle
    router.get('/api/v1/ml-forecast/auto-select', (req, res) => controller.autoSelectModel(req, res));

    // Détection d'anomalies
    router.get('/api/v1/ml-forecast/anomalies', (req, res) => controller.detectAnomalies(req, res));

    // Analyse de tendance
    router.get('/api/v1/ml-forecast/trend', (req, res) => controller.analyzeTrend(req, res));

    // Insights et recommandations
    router.get('/api/v1/ml-forecast/insights', (req, res) => controller.getInsights(req, res));

    return router;
  }
}

module.exports = MLForecastModule;
