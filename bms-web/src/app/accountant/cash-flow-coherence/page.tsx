"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRightLeft,
  Calendar,
  Target,
  Activity,
  RefreshCw
} from "lucide-react";

interface CashFlowData {
  period: string;
  revenue: number;
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  conversionRate: number;
  daysSalesOutstanding: number;
  collectionRate: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface CoherenceMetrics {
  revenueCashGap: number;
  cashConversionEfficiency: number;
  liquidityRatio: number;
  workingCapital: number;
  operatingCashFlow: number;
  freeCashFlow: number;
}

interface Alert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

export default function CashFlowCoherencePage() {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [metrics, setMetrics] = useState<CoherenceMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');

  useEffect(() => {
    loadCashFlowCoherence();
  }, [selectedPeriod]);

  const loadCashFlowCoherence = async () => {
    setLoading(true);
    try {
      // Mock data - à remplacer par un vrai appel API
      const mockCashFlowData: CashFlowData[] = [
        {
          period: '2025-10',
          revenue: 3200000,
          cashInflow: 2800000,
          cashOutflow: 2100000,
          netCashFlow: 700000,
          conversionRate: 87.5,
          daysSalesOutstanding: 35,
          collectionRate: 85.2,
          status: 'warning'
        },
        {
          period: '2025-09',
          revenue: 2900000,
          cashInflow: 2750000,
          cashOutflow: 1950000,
          netCashFlow: 800000,
          conversionRate: 94.8,
          daysSalesOutstanding: 28,
          collectionRate: 92.1,
          status: 'healthy'
        },
        {
          period: '2025-08',
          revenue: 3100000,
          cashInflow: 2550000,
          cashOutflow: 2200000,
          netCashFlow: 350000,
          conversionRate: 82.3,
          daysSalesOutstanding: 42,
          collectionRate: 78.5,
          status: 'critical'
        }
      ];

      const mockMetrics: CoherenceMetrics = {
        revenueCashGap: 450000,
        cashConversionEfficiency: 88.2,
        liquidityRatio: 1.8,
        workingCapital: 2500000,
        operatingCashFlow: 1850000,
        freeCashFlow: 950000
      };

      const mockAlerts: Alert[] = [
        {
          type: 'critical',
          title: 'Décalage CA-Trésorerie important',
          description: 'Écart de 450 000 FCFA entre chiffre d\'affaires et entrées de trésorerie',
          impact: 'Risque de liquidité à court terme',
          recommendation: 'Renforcer le recouvrement des créances clients'
        },
        {
          type: 'warning',
          title: 'Délai de paiement moyen allongé',
          description: 'DSO de 35 jours (objectif: <30 jours)',
          impact: 'Impact sur le besoin en fonds de roulement',
          recommendation: 'Mettre en place une politique de recouvrement plus stricte'
        },
        {
          type: 'info',
          title: 'Taux de conversion améliorable',
          description: '87.5% de conversion CA → trésorerie',
          impact: 'Potentiel d\'optimisation de 12.5%',
          recommendation: 'Analyser les causes des retards de paiement'
        }
      ];

      setCashFlowData(mockCashFlowData);
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading cash flow coherence:', error);
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
      case 'healthy':
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Sain</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1" />Attention</Badge>;
      case 'critical':
        return <Badge className="bg-rose-100 text-rose-800"><AlertTriangle className="w-3 h-3 mr-1" />Critique</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <div className="w-2 h-2 bg-rose-500 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-amber-500 rounded-full"></div>;
      case 'info':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-slate-500 rounded-full"></div>;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-rose-200 bg-rose-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 95) return 'text-emerald-600';
    if (rate >= 85) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getDSOColor = (dso: number) => {
    if (dso <= 30) return 'text-emerald-600';
    if (dso <= 45) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (loading) return <div>Chargement...</div>;

  const totalRevenue = cashFlowData.reduce((sum, item) => sum + item.revenue, 0);
  const totalCashInflow = cashFlowData.reduce((sum, item) => sum + item.cashInflow, 0);
  const averageConversionRate = cashFlowData.reduce((sum, item) => sum + item.conversionRate, 0) / cashFlowData.length;
  const averageDSO = cashFlowData.reduce((sum, item) => sum + item.daysSalesOutstanding, 0) / cashFlowData.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            Cohérence CA - Trésorerie
          </h1>
          <p className="text-slate-600">Analyse de la corrélation entre chiffre d'affaires et flux de trésorerie</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="month">Mois</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Année</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Décalage CA-Trésorerie</CardTitle>
            <DollarSign className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(metrics?.revenueCashGap || 0)}</div>
            <p className="text-xs text-slate-600">Écart à réduire</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
            <Target className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConversionRateColor(averageConversionRate)}`}>
              {averageConversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-600">CA → Trésorerie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DSO Moyen</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getDSOColor(averageDSO)}`}>
              {averageDSO.toFixed(0)} jours
            </div>
            <p className="text-xs text-slate-600">Délai paiement moyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratio Liquidité</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{metrics?.liquidityRatio.toFixed(1)}</div>
            <p className="text-xs text-slate-600">Actif/PASSIF circulant</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow vs Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            CA vs Flux de Trésorerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {cashFlowData.map((item, index) => {
              const maxValue = Math.max(...cashFlowData.map(d => Math.max(d.revenue, d.cashInflow)));
              const revenueHeight = (item.revenue / maxValue) * 100;
              const cashHeight = (item.cashInflow / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1">
                    <div 
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${revenueHeight}%` }}
                      title={`CA: ${formatCurrency(item.revenue)}`}
                    ></div>
                    <div 
                      className="flex-1 bg-emerald-500 rounded-t"
                      style={{ height: `${cashHeight}%` }}
                      title={`Entrées: ${formatCurrency(item.cashInflow)}`}
                    ></div>
                  </div>
                  <div className="text-xs mt-2 text-center">
                    <div className="font-medium">{item.period}</div>
                    <div className={`text-xs ${getConversionRateColor(item.conversionRate)}`}>
                      {item.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Chiffre d'Affaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm">Entrées de Trésorerie</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse Détaillée par Période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Période</th>
                  <th className="text-right p-3">CA</th>
                  <th className="text-right p-3">Entrées</th>
                  <th className="text-right p-3">Sorties</th>
                  <th className="text-right p-3">Flux Net</th>
                  <th className="text-right p-3">Conversion</th>
                  <th className="text-right p-3">DSO</th>
                  <th className="text-right p-3">Recouvrement</th>
                  <th className="text-center p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{item.period}</td>
                    <td className="text-right p-3 font-mono">{formatCurrency(item.revenue)}</td>
                    <td className="text-right p-3 font-mono text-emerald-600">{formatCurrency(item.cashInflow)}</td>
                    <td className="text-right p-3 font-mono text-rose-600">{formatCurrency(item.cashOutflow)}</td>
                    <td className="text-right p-3 font-mono">
                      <span className={item.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatCurrency(item.netCashFlow)}
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className={`font-medium ${getConversionRateColor(item.conversionRate)}`}>
                        {item.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className={`font-medium ${getDSOColor(item.daysSalesOutstanding)}`}>
                        {item.daysSalesOutstanding}j
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <span className={`font-medium ${
                        item.collectionRate >= 90 ? 'text-emerald-600' : 
                        item.collectionRate >= 80 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {item.collectionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center p-3">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
                Alertes de Cohérence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 border rounded ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{alert.title}</h4>
                      <p className="text-sm text-slate-700 mb-2">{alert.description}</p>
                      <div className="text-xs space-y-1">
                        <div><span className="font-medium">Impact:</span> {alert.impact}</div>
                        <div><span className="font-medium">Recommandation:</span> {alert.recommendation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Efficacité Conversion</div>
                  <div className="text-sm text-slate-600">CA → Trésorerie</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{metrics?.cashConversionEfficiency.toFixed(1)}%</div>
                  <div className="text-xs text-slate-600">Objectif: 95%</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">BFR</div>
                  <div className="text-sm text-slate-600">Besoin en Fonds de Roulement</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-600">{formatCurrency(metrics?.workingCapital || 0)}</div>
                  <div className="text-xs text-slate-600">À optimiser</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Cash Flow Opérationnel</div>
                  <div className="text-sm text-slate-600">Flux généré par l'activité</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">{formatCurrency(metrics?.operatingCashFlow || 0)}</div>
                  <div className="text-xs text-slate-600">Positif ✓</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Free Cash Flow</div>
                  <div className="text-sm text-slate-600">Flux de trésorerie disponible</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(metrics?.freeCashFlow || 0)}</div>
                  <div className="text-xs text-slate-600">Pour investissements</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
