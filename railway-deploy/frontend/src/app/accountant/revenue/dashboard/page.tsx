"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  LineChart,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Eye,
  ArrowRight,
  Clock
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
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Link from "next/link";

interface RevenueKPI {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  target: number;
  icon: any;
  color: string;
}

interface RevenueSegment {
  name: string;
  revenue: number;
  growth: number;
  percentage: number;
  color: string;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  recognized: number;
  deferred: number;
  forecast: number;
  actual?: number;
}

interface QuickAction {
  title: string;
  description: string;
  link: string;
  icon: any;
  color: string;
}

export default function ModernRevenueDashboardPage() {
  const [kpiData, setKpiData] = useState<RevenueKPI[]>([]);
  const [segmentData, setSegmentData] = useState<RevenueSegment[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Données KPI mockées
      const mockKPIs: RevenueKPI[] = [
        {
          title: "CA Total Annuel",
          value: 208000000,
          change: 15.2,
          trend: 'up',
          target: 220000000,
          icon: DollarSign,
          color: 'emerald'
        },
        {
          title: "CA Reconnu",
          value: 187200000,
          change: 12.8,
          trend: 'up',
          target: 200000000,
          icon: CheckCircle,
          color: 'blue'
        },
        {
          title: "CA Différé",
          value: 20800000,
          change: -5.3,
          trend: 'down',
          target: 20000000,
          icon: Clock,
          color: 'amber'
        },
        {
          title: "Taux de Reconnaissance",
          value: 90,
          change: 2.1,
          trend: 'up',
          target: 95,
          icon: Target,
          color: 'purple'
        },
        {
          title: "Contrats Actifs",
          value: 1247,
          change: 8.7,
          trend: 'up',
          target: 1300,
          icon: Users,
          color: 'indigo'
        },
        {
          title: "Panier Moyen",
          value: 166800,
          change: 3.2,
          trend: 'up',
          target: 170000,
          icon: ShoppingCart,
          color: 'rose'
        }
      ];

      // Données par segment mockées
      const mockSegments: RevenueSegment[] = [
        { name: 'Services Professionnels', revenue: 83200000, growth: 18.5, percentage: 40, color: '#3b82f6' },
        { name: 'Licences Logiciel', revenue: 62400000, growth: 12.3, percentage: 30, color: '#10b981' },
        { name: 'Support Technique', revenue: 41600000, growth: 8.7, percentage: 20, color: '#f59e0b' },
        { name: 'Formation', revenue: 20800000, growth: 15.2, percentage: 10, color: '#8b5cf6' }
      ];

      // Données mensuelles mockées
      const mockMonthlyData: MonthlyRevenue[] = [
        { month: 'Jan', revenue: 15600000, recognized: 14040000, deferred: 1560000, forecast: 16000000, actual: 15600000 },
        { month: 'Fév', revenue: 14800000, recognized: 13320000, deferred: 1480000, forecast: 15000000, actual: 14800000 },
        { month: 'Mar', revenue: 17200000, recognized: 15480000, deferred: 1720000, forecast: 17000000, actual: 17200000 },
        { month: 'Avr', revenue: 16400000, recognized: 14760000, deferred: 1640000, forecast: 16500000, actual: 16400000 },
        { month: 'Mai', revenue: 16800000, recognized: 15120000, deferred: 1680000, forecast: 17000000, actual: 16800000 },
        { month: 'Jun', revenue: 18200000, recognized: 16380000, deferred: 1820000, forecast: 18000000, actual: 18200000 },
        { month: 'Jul', revenue: 17800000, recognized: 16020000, deferred: 1780000, forecast: 17500000, actual: 17800000 },
        { month: 'Aoû', revenue: 16200000, recognized: 14580000, deferred: 1620000, forecast: 16000000, actual: 16200000 },
        { month: 'Sep', revenue: 17400000, recognized: 15660000, deferred: 1740000, forecast: 17000000, actual: 17400000 },
        { month: 'Oct', revenue: 18800000, recognized: 16920000, deferred: 1880000, forecast: 18500000, actual: 18800000 },
        { month: 'Nov', revenue: 19200000, recognized: 17280000, deferred: 1920000, forecast: 19000000, actual: 19200000 },
        { month: 'Déc', revenue: 19800000, recognized: 17820000, deferred: 1980000, forecast: 19500000, actual: 19800000 }
      ];

      setKpiData(mockKPIs);
      setSegmentData(mockSegments);
      setMonthlyData(mockMonthlyData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const quickActions: QuickAction[] = [
    {
      title: "Reconnaissance du CA",
      description: "Gérer la reconnaissance des revenus",
      link: "/accountant/revenue-recognition-new",
      icon: CheckCircle,
      color: "blue"
    },
    {
      title: "Analyse Multidimensionnelle",
      description: "Analyser les revenus par dimensions",
      link: "/accountant/multi-dimensional-analysis-new",
      icon: BarChart3,
      color: "green"
    },
    {
      title: "Prévisions Financières",
      description: "Consulter les prévisions IA",
      link: "/accountant/revenue-forecast-new",
      icon: Target,
      color: "purple"
    },
    {
      title: "Rapports Détaillés",
      description: "Générer des rapports personnalisés",
      link: "#",
      icon: Download,
      color: "amber"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord - Chiffre d'Affaires</h1>
          <p className="text-slate-600">Vue d'ensemble complète des performances de revenus</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Link key={index} href={action.link}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 bg-${action.color}-100 rounded-lg`}>
                      <IconComponent className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <ArrowRight className={`w-4 h-4 text-${action.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const progress = getProgressPercentage(kpi.value, kpi.target);
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`p-2 bg-${kpi.color}-100 rounded-lg`}>
                  <IconComponent className={`h-4 w-4 text-${kpi.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold text-${kpi.color}-600`}>
                  {kpi.title.includes('Taux') ? `${kpi.value}%` : formatCompactCurrency(kpi.value)}
                </div>
                <div className="flex items-center mt-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600 mr-1" />
                  )}
                  <span className={`text-sm ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} font-medium`}>
                    {kpi.trend === 'up' ? '+' : ''}{kpi.change}%
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Objectif</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-slate-500 mt-1">
                    {formatCompactCurrency(kpi.target)} cible
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Évolution Mensuelle du CA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatCurrency(value), 
                    name === 'revenue' ? 'CA Réel' : 
                    name === 'forecast' ? 'Prévision' : 
                    name === 'recognized' ? 'CA Reconnu' : 'CA Différé'
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
                  dataKey="recognized"
                  fill="#10b981"
                  fillOpacity={0.3}
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Segment */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Répartition du CA par Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCompactCurrency(value), 'CA']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-40% space-y-3">
                {segmentData.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <span className="text-sm font-medium">{segment.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCompactCurrency(segment.revenue)}</div>
                      <div className="text-xs text-slate-500">+{segment.growth}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Récente</CardTitle>
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
                  <th className="text-left p-4 font-semibold text-slate-700">Mois</th>
                  <th className="text-right p-4 font-semibold text-slate-700">CA Réel</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Prévision</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Écart</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Taux Reconnaissance</th>
                  <th className="text-center p-4 font-semibold text-slate-700">CA Différé</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.slice(-6).map((month, index) => {
                  const variance = month.actual && month.forecast ? ((month.actual - month.forecast) / month.forecast * 100) : 0;
                  const recognitionRate = (month.recognized / month.revenue) * 100;
                  
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{month.month}</td>
                      <td className="text-right p-4 font-semibold text-emerald-600">
                        {formatCurrency(month.revenue)}
                      </td>
                      <td className="text-right p-4 text-slate-600">
                        {formatCurrency(month.forecast)}
                      </td>
                      <td className="text-right p-4">
                        <span className={`font-semibold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={recognitionRate} className="w-16 h-2" />
                          <span className="text-sm font-medium">{recognitionRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="text-center p-4 font-semibold text-amber-600">
                        {formatCurrency(month.deferred)}
                      </td>
                      <td className="text-center p-4">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes et Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-800">CA Différé Élevé</div>
                  <div className="text-sm text-amber-700">Le CA différé a augmenté de 15% ce mois-ci. Revoir les contrats à reconnaître.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-800">Objectif Q4 Atteint</div>
                  <div className="text-sm text-emerald-700">Les objectifs de chiffre d'affaires du Q4 ont été dépassés de 8%.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-800">Nouvelle Opportunité</div>
                  <div className="text-sm text-blue-700">Un gros contrat potentiel de 50M FCFA identifié dans le pipeline.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Métriques Clés du Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Objectif Annuel</span>
                  <span className="text-sm font-semibold text-emerald-600">94.5%</span>
                </div>
                <Progress value={94.5} className="h-2" />
                <div className="text-xs text-slate-500 mt-1">
                  {formatCompactCurrency(208000000)} / {formatCompactCurrency(220000000)}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Croissance Moyenne</span>
                  <span className="text-sm font-semibold text-emerald-600">+12.8%</span>
                </div>
                <Progress value={80} className="h-2 bg-emerald-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Taux de Reconnaissance</span>
                  <span className="text-sm font-semibold text-blue-600">90%</span>
                </div>
                <Progress value={90} className="h-2 bg-blue-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Satisfaction Client</span>
                  <span className="text-sm font-semibold text-purple-600">4.8/5</span>
                </div>
                <Progress value={96} className="h-2 bg-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}