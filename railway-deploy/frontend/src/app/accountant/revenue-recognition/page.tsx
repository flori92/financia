"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign, BarChart3, Eye, CheckCircle } from "lucide-react";

interface RevenueData {
  id: string;
  period: string;
  recognizedRevenue: number;
  deferredRevenue: number;
  totalRevenue: number;
  recognitionRate: number;
  status: 'pending' | 'in-review' | 'recognized';
  contracts: number;
}

export default function RevenueRecognitionPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    loadRevenueRecognition();
  }, [selectedPeriod]);

  const loadRevenueRecognition = async () => {
    setLoading(true);
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const apiData = await apiGet('/api/v1/accounting/revenue-recognition', { 
        companyId, 
        period: selectedPeriod 
      });
      
      const revenueData: RevenueData[] = Array.isArray(apiData) ? apiData : (apiData.items || []);
      setRevenueData(revenueData);
    } catch (err: any) {
      console.error('Error loading revenue recognition:', err);
      
      // En cas d'erreur 404, afficher des données de démonstration
      if (err?.message?.includes('404') || err?.status === 404) {
        const fallbackData: RevenueData[] = [
          {
            id: 'demo-1',
            period: '2025-10',
            recognizedRevenue: 2500000,
            deferredRevenue: 500000,
            totalRevenue: 3000000,
            recognitionRate: 83.3,
            status: 'recognized',
            contracts: 45
          },
          {
            id: 'demo-2',
            period: '2025-09',
            recognizedRevenue: 2200000,
            deferredRevenue: 800000,
            totalRevenue: 3000000,
            recognitionRate: 73.3,
            status: 'recognized',
            contracts: 38
          }
        ];
        setRevenueData(fallbackData);
      } else {
        setRevenueData([]);
      }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recognized':
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Reconnu</Badge>;
      case 'in-review':
        return <Badge className="bg-amber-100 text-amber-800"><Eye className="w-3 h-3 mr-1" />En révision</Badge>;
      case 'pending':
        return <Badge className="bg-slate-100 text-slate-800"><Calendar className="w-3 h-3 mr-1" />En attente</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const totalRecognized = revenueData.reduce((sum, item) => sum + item.recognizedRevenue, 0);
  const totalDeferred = revenueData.reduce((sum, item) => sum + item.deferredRevenue, 0);
  const totalContracts = revenueData.reduce((sum, item) => sum + item.contracts, 0);
  const avgRecognitionRate = revenueData.length > 0 
    ? revenueData.reduce((sum, item) => sum + item.recognitionRate, 0) / revenueData.length 
    : 0;

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reconnaissance Chiffre d'Affaires</h1>
          <p className="text-slate-600">Suivi et validation des revenus selon les normes IFRS 15</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="current">Période actuelle</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Année</option>
          </select>
          <Button>
            <TrendingUp className="w-4 h-4 mr-2" />
            Générer rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Reconnu</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRecognized)}</div>
            <p className="text-xs text-slate-600">Total des revenus validés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Différé</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalDeferred)}</div>
            <p className="text-xs text-slate-600">Revenus à reconnaître</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Reconnaissance</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgRecognitionRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-600">Moyenne du taux</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats Traités</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalContracts}</div>
            <p className="text-xs text-slate-600">Nombre de contrats</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Recognition Table */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par Période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Période</th>
                  <th className="text-right p-3">CA Total</th>
                  <th className="text-right p-3">CA Reconnu</th>
                  <th className="text-right p-3">CA Différé</th>
                  <th className="text-right p-3">Taux</th>
                  <th className="text-center p-3">Contrats</th>
                  <th className="text-center p-3">Statut</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{item.period}</td>
                    <td className="text-right p-3">{formatCurrency(item.totalRevenue)}</td>
                    <td className="text-right p-3 text-emerald-600">{formatCurrency(item.recognizedRevenue)}</td>
                    <td className="text-right p-3 text-amber-600">{formatCurrency(item.deferredRevenue)}</td>
                    <td className="text-right p-3">
                      <span className={`font-medium ${
                        item.recognitionRate >= 80 ? 'text-emerald-600' : 
                        item.recognitionRate >= 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {item.recognitionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center p-3">{item.contracts}</td>
                    <td className="text-center p-3">{getStatusBadge(item.status)}</td>
                    <td className="text-center p-3">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recognition Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Règles de Reconnaissance Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Services - Réalisation progressive</div>
                  <div className="text-sm text-slate-600">Basé sur l'avancement des travaux</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Produits - Livraison</div>
                  <div className="text-sm text-slate-600">Reconnaissance à la livraison</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Abonnements - Temps écoulé</div>
                  <div className="text-sm text-slate-600">Répartition linéaire sur la période</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes de Reconnaissance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border border-amber-200 bg-amber-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="font-medium text-amber-800">Contrats en attente de validation</div>
                </div>
                <div className="text-sm text-amber-700 mt-1">3 contrats nécessitent une révision manuelle</div>
              </div>
              <div className="p-3 border border-blue-200 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="font-medium text-blue-800">Taux de reconnaissance faible</div>
                </div>
                <div className="text-sm text-blue-700 mt-1">Période Août: 60% (objectif: 80%)</div>
              </div>
              <div className="p-3 border border-emerald-200 bg-emerald-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="font-medium text-emerald-800">Reconnaissance automatique réussie</div>
                </div>
                <div className="text-sm text-emerald-700 mt-1">12 contrats traités automatiquement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
