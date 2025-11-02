"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ForecastData {
  period: string;
  actual: number | null;
  predicted: number;
  confidence: number;
  accuracy: number | null;
  model: string;
}

interface ModelMetrics {
  name: string;
  accuracy: number;
  mae: number;
  rmse: number;
  mape: number;
  lastTrained: string;
  status: 'active' | 'training' | 'error';
}

interface MLForecastData {
  forecasts: ForecastData[];
  models: ModelMetrics[];
  insights: string[];
  recommendations: string[];
}

export default function MLForecastPage() {
  const [data, setData] = useState<MLForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [forecastPeriod, setForecastPeriod] = useState('6months');
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadMLForecastData();
  }, [selectedModel, forecastPeriod]);

  const loadMLForecastData = async () => {
    setLoading(true);
    try {
      // Mock data - à remplacer par un vrai appel API
      const mockData: MLForecastData = {
        forecasts: [
          { period: '2025-11', actual: 3200000, predicted: 3150000, confidence: 92, accuracy: 95.2, model: 'LSTM' },
          { period: '2025-12', actual: null, predicted: 3450000, confidence: 89, accuracy: null, model: 'Ensemble' },
          { period: '2026-01', actual: null, predicted: 3100000, confidence: 87, accuracy: null, model: 'Ensemble' },
          { period: '2026-02', actual: null, predicted: 3300000, confidence: 85, accuracy: null, model: 'ARIMA' },
          { period: '2026-03', actual: null, predicted: 3550000, confidence: 83, accuracy: null, model: 'Ensemble' },
          { period: '2026-04', actual: null, predicted: 3400000, confidence: 81, accuracy: null, model: 'Prophet' }
        ],
        models: [
          { name: 'LSTM', accuracy: 94.2, mae: 125000, rmse: 180000, mape: 4.2, lastTrained: '2025-10-28', status: 'active' },
          { name: 'ARIMA', accuracy: 91.8, mae: 156000, rmse: 210000, mape: 5.1, lastTrained: '2025-10-27', status: 'active' },
          { name: 'Prophet', accuracy: 89.5, mae: 189000, rmse: 245000, mape: 6.2, lastTrained: '2025-10-26', status: 'active' },
          { name: 'Ensemble', accuracy: 95.8, mae: 98000, rmse: 145000, mape: 3.4, lastTrained: '2025-10-28', status: 'active' }
        ],
        insights: [
          'Tendance de croissance soutenue prévue pour les 6 prochains mois',
          'Saisonnalité détectée avec pic en Décembre et Mars',
          'Modèle Ensemble le plus fiable avec 95.8% de précision',
          'Confiance moyenne de 86% sur les prévisions à 6 mois'
        ],
        recommendations: [
          'Optimiser les ressources pour Q1 2026 (croissance de 8.5% attendue)',
          'Prévoir campagne marketing pour fin Décembre (pic saisonnier)',
          'Renforcer l\'équipe commerciale pour Q2 2026',
          'Surveiller les indicateurs économiques externes (impact potentiel)'
        ]
      };
      setData(mockData);
    } catch (error) {
      console.error('Error loading ML forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getModelStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'training':
        return <Badge className="bg-amber-100 text-amber-800"><RefreshCw className="w-3 h-3 mr-1" />En cours</Badge>;
      case 'error':
        return <Badge className="bg-rose-100 text-rose-800"><AlertTriangle className="w-3 h-3 mr-1" />Erreur</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-emerald-600';
    if (confidence >= 80) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getBestModel = () => {
    return data?.models.reduce((best, model) => 
      model.accuracy > best.accuracy ? model : best
    ) || data?.models[0];
  };

  const handleRetrainModels = async () => {
    setIsTraining(true);
    try {
      // Simuler le réentraînement
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadMLForecastData();
    } catch (error) {
      console.error('Error retraining models:', error);
    } finally {
      setIsTraining(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const bestModel = getBestModel();
  const totalPredictedRevenue = data?.forecasts
    .filter(f => f.actual === null)
    .reduce((sum, f) => sum + f.predicted, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Prévision CA par Machine Learning
          </h1>
          <p className="text-slate-600">Prévisions intelligentes basées sur les algorithmes ML avancés</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={forecastPeriod} 
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="3months">3 mois</option>
            <option value="6months">6 mois</option>
            <option value="12months">12 mois</option>
          </select>
          <Button 
            onClick={handleRetrainModels} 
            disabled={isTraining}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
            {isTraining ? 'Entraînement...' : 'Réentraîner modèles'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleur Modèle</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">{bestModel?.name}</div>
            <p className="text-xs text-slate-600">Précision: {bestModel?.accuracy.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Prévu 6 mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-600">{formatCurrency(totalPredictedRevenue)}</div>
            <p className="text-xs text-slate-600">Total prévisionnel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiance Moyenne</CardTitle>
            <Zap className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-amber-600">
              {data?.forecasts ? 
                (data.forecasts.reduce((sum, f) => sum + f.confidence, 0) / data.forecasts.length).toFixed(1) 
                : '0.0'}%
            </div>
            <p className="text-xs text-slate-600">Fiabilité des prévisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles Actifs</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">{data?.models.length}</div>
            <p className="text-xs text-slate-600">Algorithmes déployés</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Prévisions du Chiffre d'Affaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {data?.forecasts.map((forecast, index) => {
              const maxValue = Math.max(...data.forecasts.map(f => Math.max(f.actual || f.predicted, f.predicted)));
              const actualHeight = forecast.actual ? (forecast.actual / maxValue) * 100 : 0;
              const predictedHeight = (forecast.predicted / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1">
                    {forecast.actual && (
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${actualHeight}%` }}
                        title={`Réel: ${forecast.actual ? formatCurrency(forecast.actual) : 'N/A'}`}
                      ></div>
                    )}
                    <div 
                      className={`w-full ${forecast.actual ? 'bg-blue-300' : 'bg-purple-500'} rounded-t ${forecast.actual ? '' : 'rounded'}`}
                      style={{ height: forecast.actual ? `${predictedHeight - actualHeight}%` : `${predictedHeight}%` }}
                      title={`Prévu: ${formatCurrency(forecast.predicted)}`}
                    ></div>
                  </div>
                  <div className="text-xs mt-2 text-center">
                    <div className="font-medium">{forecast.period}</div>
                    <div className={`text-xs ${getConfidenceColor(forecast.confidence)}`}>
                      {forecast.confidence}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Réel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Prévu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span className="text-sm">Prévision vs Réel</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance des Modèles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Modèle</th>
                    <th className="text-right p-2">Précision</th>
                    <th className="text-right p-2">MAE</th>
                    <th className="text-right p-2">RMSE</th>
                    <th className="text-center p-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.models.map((model, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{model.name}</td>
                      <td className="text-right p-2">
                        <span className={`font-medium ${
                          model.accuracy >= 95 ? 'text-emerald-600' : 
                          model.accuracy >= 90 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {model.accuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right p-2 font-mono text-sm">{formatCurrency(model.mae)}</td>
                      <td className="text-right p-2 font-mono text-sm">{formatCurrency(model.rmse)}</td>
                      <td className="text-center p-2">{getModelStatusBadge(model.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Période</th>
                    <th className="text-right p-2">Prévu</th>
                    <th className="text-right p-2">Réel</th>
                    <th className="text-right p-2">Confiance</th>
                    <th className="text-center p-2">Modèle</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.forecasts.map((forecast, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{forecast.period}</td>
                      <td className="text-right p-2 font-mono">{formatCurrency(forecast.predicted)}</td>
                      <td className="text-right p-2 font-mono">
                        {forecast.actual ? formatCurrency(forecast.actual) : '-'}
                      </td>
                      <td className="text-right p-2">
                        <span className={`font-medium ${getConfidenceColor(forecast.confidence)}`}>
                          {forecast.confidence}%
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant="outline" className="text-xs">
                          {forecast.model}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Insights IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.insights.map((insight, index) => (
                <div key={index} className="p-3 border border-purple-200 bg-purple-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="text-sm text-purple-800">{insight}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommandations Stratégiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recommendations.map((rec, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="font-medium text-sm mb-1">🎯 Recommandation {index + 1}</div>
                  <div className="text-sm text-slate-600">{rec}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
