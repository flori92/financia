"use client";

import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Eye, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Target
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface RevenueData {
  id: string;
  period: string;
  recognizedRevenue: number;
  deferredRevenue: number;
  totalRevenue: number;
  recognitionRate: number;
  status: 'pending' | 'in-review' | 'recognized';
  contracts: number;
  month: string;
}

interface RecognitionTrend {
  month: string;
  recognized: number;
  deferred: number;
  total: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ModernRevenueRecognitionPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [trendData, setTrendData] = useState<RecognitionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadRevenueRecognition();
  }, [selectedPeriod]);

  const loadRevenueRecognition = async () => {
    setLoading(true);
    try {
      // Données mockées modernisées
      const mockData: RevenueData[] = [
        {
          id: '1',
          period: 'Janvier 2025',
          recognizedRevenue: 12500000,
          deferredRevenue: 2300000,
          totalRevenue: 14800000,
          recognitionRate: 84.5,
          status: 'recognized',
          contracts: 8,
          month: 'Jan'
        },
        {
          id: '2',
          period: 'Février 2025',
          recognizedRevenue: 15200000,
          deferredRevenue: 1800000,
          totalRevenue: 17000000,
          recognitionRate: 89.4,
          status: 'recognized',
          contracts: 12,
          month: 'Fév'
        },
        {
          id: '3',
          period: 'Mars 2025',
          recognizedRevenue: 18900000,
          deferredRevenue: 2100000,
          totalRevenue: 21000000,
          recognitionRate: 90.0,
          status: 'in-review',
          contracts: 15,
          month: 'Mar'
        },
        {
          id: '4',
          period: 'Avril 2025',
          recognizedRevenue: 16800000,
          deferredRevenue: 3200000,
          totalRevenue: 20000000,
          recognitionRate: 84.0,
          status: 'pending',
          contracts: 11,
          month: 'Avr'
        }
      ];

      const mockTrendData: RecognitionTrend[] = [
        { month: 'Jan', recognized: 12.5, deferred: 2.3, total: 14.8 },
        { month: 'Fév', recognized: 15.2, deferred: 1.8, total: 17.0 },
        { month: 'Mar', recognized: 18.9, deferred: 2.1, total: 21.0 },
        { month: 'Avr', recognized: 16.8, deferred: 3.2, total: 20.0 },
        { month: 'Mai', recognized: 19.5, deferred: 1.5, total: 21.0 },
        { month: 'Jun', recognized: 22.1, deferred: 2.9, total: 25.0 }
      ];

      setRevenueData(mockData);
      setTrendData(mockTrendData);
    } catch (error) {
      console.error('Error loading revenue recognition:', error);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recognized':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Reconnu
          </Badge>
        );
      case 'in-review':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Eye className="w-3 h-3 mr-1" />
            En révision
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredData = selectedStatus === 'all' 
    ? revenueData 
    : revenueData.filter(item => item.status === selectedStatus);

  const totalRecognized = revenueData.reduce((sum, item) => sum + item.recognizedRevenue, 0);
  const totalDeferred = revenueData.reduce((sum, item) => sum + item.deferredRevenue, 0);
  const totalContracts = revenueData.reduce((sum, item) => sum + item.contracts, 0);
  const avgRecognitionRate = revenueData.length > 0 
    ? revenueData.reduce((sum, item) => sum + item.recognitionRate, 0) / revenueData.length 
    : 0;

  const pieData = [
    { name: 'Reconnu', value: totalRecognized, color: '#10b981' },
    { name: 'Différé', value: totalDeferred, color: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de reconnaissance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reconnaissance du Chiffre d'Affaires</h1>
          <p className="text-slate-600">Suivi et validation des revenus selon les normes IFRS 15</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Reconnu</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCompactCurrency(totalRecognized)}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+12.5%</span>
              <span className="text-xs text-slate-500 ml-2">vs période précédente</span>
            </div>
            <Progress value={85} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Différé</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCompactCurrency(totalDeferred)}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-amber-600 mr-1" />
              <span className="text-sm text-amber-600 font-medium">+8.3%</span>
              <span className="text-xs text-slate-500 ml-2">à reconnaître</span>
            </div>
            <Progress value={15} className="mt-2 h-2 bg-amber-200" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Reconnaissance</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {avgRecognitionRate.toFixed(1)}%
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+2.1%</span>
              <span className="text-xs text-slate-500 ml-2">moyenne annuelle</span>
            </div>
            <Progress value={avgRecognitionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats Traités</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalContracts}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+18%</span>
              <span className="text-xs text-slate-500 ml-2">ce mois</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Moyenne: {(totalRecognized / totalContracts / 1000000).toFixed(1)}M par contrat
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Évolution de la Reconnaissance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value}M FCFA`, 
                    name === 'recognized' ? 'Reconnu' : name === 'deferred' ? 'Différé' : 'Total'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="recognized" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="recognized"
                />
                <Line 
                  type="monotone" 
                  dataKey="deferred" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="deferred"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition Reconnu/Différé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-slate-600">{entry.name}</span>
                  <span className="text-sm font-medium">
                    {((entry.value / (totalRecognized + totalDeferred)) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Détail par Période</CardTitle>
            <div className="flex gap-2">
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="recognized">Reconnu</option>
                <option value="in-review">En révision</option>
                <option value="pending">En attente</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
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
                  <th className="text-right p-4 font-semibold text-slate-700">CA Total</th>
                  <th className="text-right p-4 font-semibold text-slate-700">CA Reconnu</th>
                  <th className="text-right p-4 font-semibold text-slate-700">CA Différé</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Taux</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Contrats</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Statut</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.period}</td>
                    <td className="text-right p-4 font-semibold">{formatCurrency(item.totalRevenue)}</td>
                    <td className="text-right p-4 text-emerald-600 font-medium">
                      {formatCurrency(item.recognizedRevenue)}
                    </td>
                    <td className="text-right p-4 text-amber-600 font-medium">
                      {formatCurrency(item.deferredRevenue)}
                    </td>
                    <td className="text-right p-4">
                      <span className={`font-semibold ${
                        item.recognitionRate >= 90 ? 'text-emerald-600' : 
                        item.recognitionRate >= 80 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {item.recognitionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="secondary" className="bg-slate-100">
                        {item.contracts}
                      </Badge>
                    </td>
                    <td className="text-center p-4">{getStatusBadge(item.status)}</td>
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