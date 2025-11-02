"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
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
  CheckCircle,
  Activity,
  DollarSign,
  Users,
  PieChart,
  Lightbulb
} from "lucide-react";

interface MLForecastData {
  forecasts: Array<{
    period: string;
    actual: number | null;
    predicted: number;
    confidence: number;
    accuracy: number | null;
    model: string;
  }>;
  models: Array<{
    name: string;
    accuracy: number;
    mae: number;
    rmse: number;
    mape: number;
    lastTrained: string;
    status: string;
  }>;
  insights: string[];
  recommendations: string[];
  metadata?: {
    generatedAt: string;
    horizon: number;
    frequency: string;
  };
}

export default function MLForecastPage() {
  const [data, setData] = useState<MLForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('prophet');
  const [forecastPeriod, setForecastPeriod] = useState('6months');
  const [isTraining, setIsTraining] = useState(false);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      // Données mock pour la démo
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
          'Saisonnalité détectée avec pic prévu en Q3 2026',
          'Modèle Ensemble recommandé pour meilleure précision',
          'Fiabilité des prévisions: 85-92% selon horizon temporel'
        ],
        recommendations: [
          'Maintenir la stratégie actuelle de croissance',
          'Surveiller les coûts opérationnels en Q3 2026',
          'Investir dans capacité production pour Q2-Q3 2026',
          'Optimiser les marges durant les périodes de faible activité'
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecastData();
  }, [selectedModel, forecastPeriod]);

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
        return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">Actif</span>;
      case 'training':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">En cours</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs font-medium bg-rose-100 text-rose-800 rounded">Erreur</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded">Inconnu</span>;
    }
  };

  const getBestModel = () => {
    return data?.models.reduce((best: any, model: any) => 
      model.accuracy > best.accuracy ? model : best
    ) || data?.models[0];
  };

  const handleRetrainModels = async () => {
    setIsTraining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadForecastData();
    } catch (error) {
      console.error('Error retraining models:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const bestModel = getBestModel();
  const totalPredictedRevenue = data?.forecasts
    .filter((f: any) => f.actual === null)
    .reduce((sum: number, f: any) => sum + f.predicted, 0) || 0;

  if (loading) return <div>Chargement...</div>;

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
                (data.forecasts.reduce((sum: number, f: any) => sum + f.confidence, 0) / data.forecasts.length).toFixed(1) 
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
                  <div className="font-medium text-sm mb-1"> Recommandation {index + 1}</div>
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
