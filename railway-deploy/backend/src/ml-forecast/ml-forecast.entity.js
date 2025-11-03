const { EntitySchema } = require('typeorm');

// Entité pour stocker les prévisions ML
class MLForecast {
  constructor() {
    this.id = null;
    this.companyId = null;
    this.period = null;
    this.periodStart = null;
    this.periodEnd = null;
    this.metric = null; // 'revenue', 'expenses', 'cashflow'
    this.actual = null;
    this.predicted = null;
    this.model = null; // 'LSTM', 'ARIMA', 'Prophet', 'XGBoost', 'Ensemble'
    this.confidence = null;
    this.lowerBound = null;
    this.upperBound = null;
    this.features = null; // JSON des features utilisées
    this.metadata = null; // JSON des métadonnées
    this.createdAt = null;
    this.updatedAt = null;
  }
}

const MLForecastSchema = new EntitySchema({
  name: 'MLForecast',
  target: MLForecast,
  tableName: 'ml_forecasts',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    companyId: {
      type: 'varchar',
      nullable: false,
      name: 'company_id'
    },
    period: {
      type: 'varchar',
      nullable: false
    },
    periodStart: {
      type: 'date',
      nullable: false,
      name: 'period_start'
    },
    periodEnd: {
      type: 'date',
      nullable: false,
      name: 'period_end'
    },
    metric: {
      type: 'varchar',
      nullable: false
    },
    actual: {
      type: 'decimal',
      nullable: true,
      precision: 15,
      scale: 2
    },
    predicted: {
      type: 'decimal',
      nullable: false,
      precision: 15,
      scale: 2
    },
    model: {
      type: 'varchar',
      nullable: false
    },
    confidence: {
      type: 'decimal',
      nullable: true,
      precision: 5,
      scale: 2
    },
    lowerBound: {
      type: 'decimal',
      nullable: true,
      precision: 15,
      scale: 2,
      name: 'lower_bound'
    },
    upperBound: {
      type: 'decimal',
      nullable: true,
      precision: 15,
      scale: 2,
      name: 'upper_bound'
    },
    features: {
      type: 'json',
      nullable: true
    },
    metadata: {
      type: 'json',
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at'
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
      name: 'updated_at'
    }
  }
});

// Entité pour stocker les performances des modèles
class MLModelPerformance {
  constructor() {
    this.id = null;
    this.companyId = null;
    this.model = null;
    this.metric = null;
    this.trainedAt = null;
    this.accuracy = null;
    this.mae = null; // Mean Absolute Error
    this.rmse = null; // Root Mean Squared Error
    this.mape = null; // Mean Absolute Percentage Error
    this.r2Score = null;
    this.trainingTime = null; // en secondes
    this.sampleSize = null;
    this.hyperparameters = null; // JSON
    this.featureImportance = null; // JSON
    this.status = null; // 'active', 'training', 'deprecated'
    this.createdAt = null;
    this.updatedAt = null;
  }
}

const MLModelPerformanceSchema = new EntitySchema({
  name: 'MLModelPerformance',
  target: MLModelPerformance,
  tableName: 'ml_model_performance',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    companyId: {
      type: 'varchar',
      nullable: false,
      name: 'company_id'
    },
    model: {
      type: 'varchar',
      nullable: false
    },
    metric: {
      type: 'varchar',
      nullable: false
    },
    trainedAt: {
      type: 'timestamp',
      nullable: false,
      name: 'trained_at'
    },
    accuracy: {
      type: 'decimal',
      nullable: true,
      precision: 5,
      scale: 2
    },
    mae: {
      type: 'decimal',
      nullable: true,
      precision: 15,
      scale: 2
    },
    rmse: {
      type: 'decimal',
      nullable: true,
      precision: 15,
      scale: 2
    },
    mape: {
      type: 'decimal',
      nullable: true,
      precision: 5,
      scale: 2
    },
    r2Score: {
      type: 'decimal',
      nullable: true,
      precision: 5,
      scale: 4,
      name: 'r2_score'
    },
    trainingTime: {
      type: 'int',
      nullable: true,
      name: 'training_time'
    },
    sampleSize: {
      type: 'int',
      nullable: true,
      name: 'sample_size'
    },
    hyperparameters: {
      type: 'json',
      nullable: true
    },
    featureImportance: {
      type: 'json',
      nullable: true,
      name: 'feature_importance'
    },
    status: {
      type: 'varchar',
      default: 'active'
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at'
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
      name: 'updated_at'
    }
  },
  indices: [
    {
      name: 'IDX_MODEL_PERF_COMPANY',
      columns: ['company_id', 'model', 'metric']
    }
  ]
});

module.exports = { 
  MLForecast, 
  MLForecastSchema,
  MLModelPerformance,
  MLModelPerformanceSchema
};
