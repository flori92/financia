"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Layers,
  Users,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Eye,
  ArrowRight,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";

interface AnalysisData {
  dimension: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: string;
}

interface MultiDimensionalData {
  revenueBySegment: AnalysisData[];
  revenueByRegion: AnalysisData[];
  revenueByProduct: AnalysisData[];
  revenueByCustomer: AnalysisData[];
  revenueByTime: AnalysisData[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function ModernMultiDimensionalAnalysisPage() {
  const [data, setData] = useState<MultiDimensionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState('segment');
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadMultiDimensionalData();
  }, [selectedPeriod]);

  const loadMultiDimensionalData = async () => {
    setLoading(true);
    try {
      // Données mockées modernisées
      const mockData: MultiDimensionalData = {
        revenueBySegment: [
          { dimension: 'Services Conseil', value: 45600000, percentage: 35.2, trend: 'up', trendValue: 12.5, color: '#10b981' },
          { dimension: 'Solutions Logicielles', value: 38200000, percentage: 29.5, trend: 'up', trendValue: 8.3, color: '#3b82f6' },
          { dimension: 'Formation', value: 28400000, percentage: 21.9, trend: 'up', trendValue: 15.7, color: '#8b5cf6' },
          { dimension: 'Support Technique', value: 17300000, percentage: 13.4, trend: 'stable', trendValue: 0.0, color: '#f59e0b' }
        ],
        revenueByRegion: [
          { dimension: 'Abidjan', value: 68700000, percentage: 53.0, trend: 'up', trendValue: 18.2, color: '#10b981' },
          { dimension: 'Bouaké', value: 28400000, percentage: 21.9, trend: 'up', trendValue: 12.5, color: '#3b82f6' },
          { dimension: 'San Pedro', value: 19500000, percentage: 15.0, trend: 'down', trendValue: -2.1, color: '#ef4444' },
          { dimension: 'Korhogo', value: 12900000, percentage: 10.1, trend: 'up', trendValue: 5.8, color: '#06b6d4' }
        ],
        revenueByProduct: [
          { dimension: 'Suite BMS Pro', value: 52300000, percentage: 40.3, trend: 'up', trendValue: 22.1, color: '#10b981' },
          { dimension: 'Module Analytics', value: 31500000, percentage: 24.3, trend: 'up', trendValue: 14.7, color: '#3b82f6' },
          { dimension: 'Service Cloud', value: 26800000, percentage: 20.7, trend: 'up', trendValue: 9.3, color: '#8b5cf6' },
          { dimension: 'Consulting', value: 19200000, percentage: 14.7, trend: 'stable', trendValue: 1.2, color: '#f59e0b' }
        ],
        revenueByCustomer: [
          { dimension: 'Grandes Entreprises', value: 78200000, percentage: 60.3, trend: 'up', trendValue: 16.8, color: '#10b981' },
          { dimension: 'PME', value: 31500000, percentage: 24.3, trend: 'up', trendValue: 11.2, color: '#3b82f6' },
          { dimension: 'Startups', value: 12300000, percentage: 9.5, trend: 'up', trendValue: 28.4, color: '#8b5cf6' },
          { dimension: 'Particuliers', value: 7800000, percentage: 5.9, trend: 'stable', trendValue: 2.1, color: '#f59e0b' }
        ],
        revenueByTime: [
          { dimension: 'Q1 2025', value: 28500000, percentage: 22.0, trend: 'up', trendValue: 15.2, color: '#10b981' },
          { dimension: 'Q2 2025', value: 32200000, percentage: 24.8, trend: 'up', trendValue: 13.1, color: '#3b82f6' },
          { dimension: 'Q3 2025', value: 35600000, percentage: 27.5, trend: 'up', trendValue: 10.6, color: '#8b5cf6' },
          { dimension: 'Q4 2025', value: 32900000, percentage: 25.7, trend: 'up', trendValue: 8.9, color: '#f59e0b' }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error loading multi-dimensional data:', error);
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

  const getTrendIcon = (trend: string, value: number) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-rose-600 rotate-180" />;
      case 'stable':
        return <div className="w-4 h-4 bg-slate-400 rounded-full" />;
      default:
        return null;
    }
  };

  const getDimensionData = () => {
    if (!data) return [];
    switch (selectedDimension) {
      case 'segment': return data.revenueBySegment;
      case 'region': return data.revenueByRegion;
      case 'product': return data.revenueByProduct;
      case 'customer': return data.revenueByCustomer;
      case 'time': return data.revenueByTime;
      default: return data.revenueBySegment;
    }
  };

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'segment': return <Layers className="w-5 h-5" />;
      case 'region': return <MapPin className="w-5 h-5" />;
      case 'product': return <BarChart3 className="w-5 h-5" />;
      case 'customer': return <Users className="w-5 h-5" />;
      case 'time': return <Calendar className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getDimensionTitle = (dimension: string) => {
    switch (dimension) {
      case 'segment': return 'CA par Segment d\'Activité';
      case 'region': return 'CA par Région';
      case 'product': return 'CA par Produit';
      case 'customer': return 'CA par Type de Client';
      case 'time': return 'CA par Période';
      default: return 'Analyse du CA';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l\'analyse multidimensionnelle...</p>
        </div>
      </div>
    );
  }

  const dimensionData = getDimensionData();
  const totalRevenue = dimensionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analyse Multidimensionnelle du CA</h1>
          <p className="text-slate-600">Analyse détaillée du chiffre d\'affaires par plusieurs dimensions</p>
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

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Contrôles d\'Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dimension</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'segment', label: 'Segment d\'Activité', icon: Layers },
                  { key: 'region', label: 'Région', icon: MapPin },
                  { key: 'product', label: 'Produit', icon: BarChart3 },
                  { key: 'customer', label: 'Type Client', icon: Users },
                  { key: 'time', label: 'Période', icon: Calendar }
                ].map((dim) => {
                  const Icon = dim.icon;
                  return (
                    <Button
                      key={dim.key}
                      variant={selectedDimension === dim.key ? 'default' : 'outline'}
                      onClick={() => setSelectedDimension(dim.key)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Icon className="w-4 h-4" />
                      {dim.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Période</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="month">Mois</option>
                <option value="quarter">Trimestre</option>
                <option value="year">Année</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Total</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCompactCurrency(totalRevenue)}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+14.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Dimension</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {dimensionData[0]?.dimension || 'N/A'}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {dimensionData[0]?.percentage.toFixed(1)}% du total
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance Moyenne</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              +{(dimensionData.reduce((sum, item) => sum + item.trendValue, 0) / dimensionData.length).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Tendance moyenne
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Dimensions</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Layers className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{dimensionData.length}</div>
            <div className="text-sm text-slate-600 mt-1">
              Catégories analysées
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDimensionIcon(selectedDimension)}
              {getDimensionTitle(selectedDimension)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dimensionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="dimension" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis stroke="#64748b" tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'FCFA']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                >
                  {dimensionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition du CA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={dimensionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${(percentage).toFixed(1)}%`}
                  labelLine={false}
                >
                  {dimensionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'FCFA']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {dimensionData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-slate-600 truncate">{entry.dimension}</span>
                  <span className="font-medium ml-auto">{entry.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getDimensionIcon(selectedDimension)}
              Détails par {getDimensionTitle(selectedDimension).split(' par ')[1]}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 font-semibold text-slate-700">Dimension</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Chiffre d\'Affaires</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Pourcentage</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Tendance</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dimensionData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium text-slate-900">{item.dimension}</span>
                      </div>
                    </td>
                    <td className="text-right p-4 font-semibold text-slate-900">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="text-right p-4">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${item.percentage}%`, 
                              backgroundColor: item.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(item.trend, item.trendValue)}
                        <Badge className={`bg-${item.trend === 'up' ? 'emerald' : item.trend === 'down' ? 'rose' : 'slate'}-100 text-${item.trend === 'up' ? 'emerald' : item.trend === 'down' ? 'rose' : 'slate'}-800`}>
                          {item.trendValue > 0 ? '+' : ''}{item.trendValue}%
                        </Badge>
                      </div>
                    </td>
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
    </div>
  );
}