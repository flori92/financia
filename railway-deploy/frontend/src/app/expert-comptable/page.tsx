"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Calculator, 
  TrendingUp, 
  FileText, 
  Brain,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Eye
} from "lucide-react";

interface FinancialForecast {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  confidence: number;
  aiInsights: string[];
}

interface AccountingAdvice {
  category: string;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  expectedImpact: string;
  implementation: string;
}

interface RatioAnalysis {
  name: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  status: 'good' | 'warning' | 'critical';
}

function ExpertComptableDashboard() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [advice, setAdvice] = useState<AccountingAdvice[]>([]);
  const [ratios, setRatios] = useState<RatioAnalysis[]>([]);

  useEffect(() => {
    if (companyId) {
      loadExpertData();
    }
  }, [companyId]);

  const loadExpertData = async () => {
    setLoading(true);
    try {
      // Simulation des données ML/IA pour expert comptable
      const forecastData: FinancialForecast[] = [
        {
          period: "Q4 2025",
          revenue: 45000000,
          expenses: 32000000,
          profit: 13000000,
          confidence: 87,
          aiInsights: [
            "Croissance des revenus attendue de 15% grace aux nouveaux contrats",
            "Optimisation des coûts opérationnels recommandée",
            "Investissement en marketing nécessaire pour maintenir la croissance"
          ]
        },
        {
          period: "Q1 2026",
          revenue: 48000000,
          expenses: 33500000,
          profit: 14500000,
          confidence: 82,
          aiInsights: [
            "Saisonnalité favorable prévue",
            "Nouveaux marchés à explorer",
            "Risque inflation à surveiller"
          ]
        }
      ];

      const adviceData: AccountingAdvice[] = [
        {
          category: "Optimisation Fiscale",
          priority: "high",
          recommendation: "Restructurer les dettes pour optimiser les charges d'intérêts",
          expectedImpact: "Économie de 1.2M FCFA annuellement",
          implementation: "Renégociation avec banques partenaires Q1 2026"
        },
        {
          category: "Gestion de Trésorerie",
          priority: "medium",
          recommendation: "Mettre en place un système de gestion centralisé de la trésorerie",
          expectedImpact: "Réduction de 15% du BFR",
          implementation: "Déploiement progressif sur 6 mois"
        }
      ];

      const ratioData: RatioAnalysis[] = [
        {
          name: "Rentabilité Net",
          current: 28.9,
          previous: 25.3,
          trend: "up",
          benchmark: 20.0,
          status: "good"
        },
        {
          name: "Ratio d'Endettement",
          current: 0.42,
          previous: 0.48,
          trend: "down",
          benchmark: 0.50,
          status: "good"
        },
        {
          name: "BFR en jours",
          current: 45,
          previous: 52,
          trend: "down",
          benchmark: 30,
          status: "warning"
        }
      ];

      setForecasts(forecastData);
      setAdvice(adviceData);
      setRatios(ratioData);
    } catch (error) {
      console.error('Erreur chargement données expert comptable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFinancialStatements = async () => {
    console.log('Génération états financiers avec IA...');
  };

  const handleOptimizeAccounting = async () => {
    console.log('Lancement optimisation comptable par ML...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord expert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            Expert Comptable
          </h1>
          <p className="text-gray-600 mt-2">
            Expertise comptable avancée avec IA et optimisation SYSCOHADA
          </p>
        </div>

        {/* KPI Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rentabilité Prévue</p>
                <p className="text-2xl font-bold text-green-600">
                  {forecasts[0]?.profit ? (forecasts[0].profit / 1000000).toFixed(1) : '0'}M FCFA
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Confiance IA: {forecasts[0]?.confidence || 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recommandations Actives</p>
                <p className="text-2xl font-bold text-blue-600">{advice.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {advice.filter(a => a.priority === 'high').length} priorités hautes
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ratio Optimal</p>
                <p className="text-2xl font-bold text-purple-600">
                  {ratios.filter(r => r.status === 'good').length}/{ratios.length}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ratios conformes au benchmark
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Économie Potentielle</p>
                <p className="text-2xl font-bold text-amber-600">1.8M FCFA</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Via optimisations IA
            </p>
          </div>
        </div>

        {/* Actions Spécialisées */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleGenerateFinancialStatements}
            className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>États Financiers IA</span>
          </button>
          
          <button
            onClick={handleOptimizeAccounting}
            className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span>Optimisation ML</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Analyse Avancée</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Rapports Experts</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prévisions Financières */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Prévisions Financières par IA
            </h2>
            <div className="space-y-6">
              {forecasts.map((forecast, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{forecast.period}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Confiance:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${forecast.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {forecast.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Revenus</p>
                      <p className="text-lg font-semibold text-green-600">
                        {(forecast.revenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dépenses</p>
                      <p className="text-lg font-semibold text-red-600">
                        {(forecast.expenses / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profit</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {(forecast.profit / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">Insights IA:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {forecast.aiInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils Comptables */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Conseils IA
            </h2>
            <div className="space-y-4">
              {advice.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-xs text-gray-500">{item.category}</span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">{item.recommendation}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Impact attendu: </span>
                      <span className="text-green-600 font-medium">{item.expectedImpact}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Implémentation: </span>
                      <span className="text-blue-600">{item.implementation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse des Ratios */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-600" />
            Analyse des Ratios Financiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ratios.map((ratio, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{ratio.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    ratio.status === 'good' ? 'bg-green-100 text-green-800' :
                    ratio.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ratio.status === 'good' ? 'Bon' :
                     ratio.status === 'warning' ? 'Attention' : 'Critique'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Actuel:</span>
                    <span className="font-medium">{ratio.current}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Précédent:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{ratio.previous}</span>
                      {ratio.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {ratio.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Benchmark:</span>
                    <span className="text-gray-500">{ratio.benchmark}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpertComptablePage() {
  return (
    <ProtectedPage requiredRole="ROLE_EXPERT_COMPTABLE">
      <ExpertComptableDashboard />
    </ProtectedPage>
  );
}
