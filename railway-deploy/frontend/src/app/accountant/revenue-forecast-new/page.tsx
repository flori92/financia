"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  LineChart,
  Eye
} from "lucide-react";
import { 
  LineChart as RechartsLineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ComposedChart,
  Bar
} from "recharts";

interface ForecastItem {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  confidence: number;
  aiInsights: string[];
  seasonality: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ForecastScenario {
  name: string;
  revenue: number[];
  probability: number;
  color: string;
}

export default function ModernRevenueForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [activeTab, setActiveTab] = useState('forecast');

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      // Données mockées modernisées avec IA
      const mockForecasts: ForecastItem[] = [
        {
          period: 'Q1 2025',
          revenue: 45600000,
          expenses: 32000000,
          profit: 13600000,
          confidence: 87,
          seasonality: 1.05,
          riskLevel: 'low',
          aiInsights: [
            "Croissance des revenus attendue de 15% grâce aux nouveaux contrats",
            "Optimisation des coûts opérationnels recommandée",
            "Investissement en marketing nécessaire pour maintenir la croissance"
          ]
        },
        {
          period: 'Q2 2025',
          revenue: 52300000,
          expenses: 35800000,
          profit: 16500000,
          confidence: 82,
          seasonality: 1.15,
          riskLevel: 'low',
          aiInsights: [
            "Saisonnalité favorable prévue",
            "Nouveaux marchés à explorer",
            "Risque inflation à surveiller"
          ]
        },
        {
          period: 'Q3 2025',
          revenue: 48900000,
          expenses: 34200000,
          profit: 14700000,
          confidence: 78,
          seasonality: 0.94,
          riskLevel: 'medium',
          aiInsights: [
            "Léger ralentissement saisonnier attendu",
            "Focus sur la rétention client",
            "Opportunités d'upselling identifiées"
          ]
        },
        {
          period: 'Q4 2025',
          revenue: 61200000,
          expenses: 39800000,
          profit: 21400000,
          confidence: 91,
          seasonality: 1.25,
          riskLevel: 'low',
          aiInsights: [
            "Fort potentiel de croissance pour fin d'année",
            "Campagnes promotionnelles planifiées",
            "Objectifs ambitieux mais réalisables"
          ]
        },
        {
          period: 'Q1 2026',
          revenue: 57800000,
          expenses: 38500000,
          profit: 19300000,
          confidence: 85,
          seasonality: 0.95,
          riskLevel: 'medium',
          aiInsights: [
            "Projection conservatrice pour le nouvel an",
            "Base installée solide à maintenir",
            "Innovation produit en cours"
          ]
        },
        {
          period: 'Q2 2026',
          revenue: 68400000,
          expenses: 44500000,
          profit: 23900000,
          confidence: 88,
          seasonality: 1.18,
          riskLevel: 'low',
          aiInsights: [
            "Accélération prévue du développement",
            "Nouveaux produits en lancement",
            "Expansion géographique envisagée"
          ]
        }
      ];

      const mockScenarios: ForecastScenario[] = [
        {
          name: 'Optimiste',
          revenue: [52000000, 59800000, 55800000, 69800000, 65900000, 77900000],
          probability: 25,
          color: '#10b981'
        },
        {
          name: 'Base',
          revenue: [45600000, 52300000, 48900000, 61200000, 57800000, 68400000],
          probability: 50,
          color: '#3b82f6'
        },
        {
          name: 'Conservateur',
          revenue: [41000000, 47100000, 44000000, 55100000, 52000000, 61600000],
          probability: 25,
          color: '#f59e0b'
        }
      ];

      setForecasts(mockForecasts);
      setScenarios(mockScenarios);
    } catch (error) {
      console.error('Error loading forecast data:', error);
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

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Faible</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1" />Moyen</Badge>;
      case 'high':
        return <Badge className="bg-rose-100 text-rose-800"><AlertTriangle className="w-3 h-3 mr-1" />Élevé</Badge>;
      default:
        return <Badge>{riskLevel}</Badge>;
    }
  };

  const chartData = forecasts.map((forecast, index) => ({
    period: forecast.period,
    revenue: forecast.revenue,
    expenses: forecast.expenses,
    profit: forecast.profit,
    confidence: forecast.confidence,
    baseScenario: scenarios[1]?.revenue[index] || 0,
    optimisticScenario: scenarios[0]?.revenue[index] || 0,
    conservativeScenario: scenarios[2]?.revenue[index] || 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prévisions IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prévisions du Chiffre d'Affaires</h1>
          <p className="text-slate-600">Prévisions financières basées sur l'IA et l'analyse de tendances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalculer IA
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter Rapport
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Prévu 2025</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCompactCurrency(forecasts.reduce((sum, f) => sum + f.revenue, 0))}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+18.5%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Objectif annuel</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiance Moyenne</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length)}%
            </div>
            <div className="flex items-center mt-1">
              <CheckCircle className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">Fiable</span>
            </div>
            <Progress 
              value={Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length)} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Prévu</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCompactCurrency(forecasts.reduce((sum, f) => sum + f.profit, 0))}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+22.3%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Marge: {Math.round((forecasts.reduce((sum, f) => sum + f.profit, 0) / forecasts.reduce((sum, f) => sum + f.revenue, 0)) * 100)}%</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau de Risque</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-amber-600">
              {forecasts.filter(f => f.riskLevel === 'low').length}/{forecasts.length}
            </div>
            <div className="flex items-center mt-1">
              <CheckCircle className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">Maîtrisé</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {forecasts.filter(f => f.riskLevel === 'low').length} périodes à faible risque
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Scénarios de Prévision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            {scenarios.map((scenario) => (
              <Button
                key={scenario.name}
                variant={selectedScenario === scenario.name.toLowerCase() ? 'default' : 'outline'}
                onClick={() => setSelectedScenario(scenario.name.toLowerCase())}
                className="flex items-center gap-2"
                size="sm"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: scenario.color }}
                ></div>
                {scenario.name}
                <Badge variant="secondary" className="ml-1">
                  {scenario.probability}%
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Prévisions de Revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatCurrency(value), 
                    name === 'revenue' ? 'CA Réel' : 
                    name === 'optimisticScenario' ? 'Scénario Optimiste' :
                    name === 'conservativeScenario' ? 'Scénario Conservateur' : 'Scénario de Base'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="optimisticScenario"
                  fill="#10b981"
                  fillOpacity={0.1}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="conservativeScenario"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Forecast Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Prévisions de Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatCurrency(value), 
                    name === 'profit' ? 'Profit' : name === 'expenses' ? 'Dépenses' : 'CA'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Forecast Table */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Détail des Prévisions par Période</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 font-semibold text-slate-700">Période</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Revenus</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Dépenses</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Profit</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Confiance</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Risque</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{forecast.period}</td>
                    <td className="text-right p-4 font-semibold text-emerald-600">
                      {formatCurrency(forecast.revenue)}
                    </td>
                    <td className="text-right p-4 font-semibold text-rose-600">
                      {formatCurrency(forecast.expenses)}
                    </td>
                    <td className="text-right p-4 font-semibold text-purple-600">
                      {formatCurrency(forecast.profit)}
                    </td>
                    <td className="text-center p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={forecast.confidence} className="w-16 h-2" />
                        <span className="text-sm font-medium">{forecast.confidence}%</span>
                      </div>
                    </td>
                    <td className="text-center p-4">{getRiskBadge(forecast.riskLevel)}</td>
                    <td className="text-center p-4">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Insights IA par Période
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecasts.map((forecast, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{forecast.period}</h3>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(forecast.riskLevel)}
                    <Badge variant="secondary">Confiance: {forecast.confidence}%</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">
                      {formatCompactCurrency(forecast.revenue)}
                    </div>
                    <div className="text-sm text-slate-600">Revenus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {formatCompactCurrency(forecast.profit)}
                    </div>
                    <div className="text-sm text-slate-600">Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      ×{forecast.seasonality.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600">Saisonnalité</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Analyses IA :</h4>
                  <ul className="space-y-1">
                    {forecast.aiInsights.map((insight, insightIndex) => (
                      <li key={insightIndex} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}