"use client";
import { useEffect, useState } from "react";
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
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
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');

  useEffect(() => {
    loadCashFlowCoherence();
  }, [selectedPeriod]);

  const loadCashFlowCoherence = async () => {
    setLoading(true);
    setError(null);
    try {
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7";
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/cash-flow-coherence?companyId=${companyId}&period=${selectedPeriod}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
      // Utiliser les données API
      setCashFlowData(apiData.cashFlowData || []);
      setMetrics(apiData.metrics || null);
      setAlerts(apiData.alerts || []);
      
    } catch (err) {
      console.error('Erreur chargement cash flow coherence:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
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
        revenueCashGap: 400000,
        cashConversionEfficiency: 85.2,
        liquidityRatio: 1.8,
        workingCapital: 1200000,
        operatingCashFlow: 700000,
        freeCashFlow: 450000
      };
      
      const mockAlerts: Alert[] = [
        {
          type: 'warning',
          title: 'Taux de conversion en baisse',
          description: 'Le taux de conversion revenu/encaissement est de 87.5%',
          impact: 'Impact modéré sur la trésorerie',
          recommendation: 'Renforcer le suivi des créances clients'
        },
        {
          type: 'info',
          title: 'Délai de paiement moyen',
          description: 'Le délai moyen de paiement est de 35 jours',
          impact: 'Impact faible sur la liquidité',
          recommendation: 'Maintenir les politiques de recouvrement actuelles'
        }
      ];
      
      setCashFlowData(mockCashFlowData);
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Cohérence du flux de trésorerie</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'analyse...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur sans données
  if (error && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Cohérence du flux de trésorerie</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadCashFlowCoherence}
                className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cohérence du flux de trésorerie</h1>
          <p className="text-gray-600 text-sm">Analyse de la conversion revenus → trésorerie</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="month">Mois</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Année</option>
          </select>
          <button
            onClick={loadCashFlowCoherence}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Ecart revenus/trésorerie</div>
              <div className="text-xl font-bold text-gray-900">
                {metrics ? formatCurrency(metrics.revenueCashGap) : '0 FCFA'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Efficacité de conversion</div>
              <div className="text-xl font-bold text-green-600">
                {metrics ? metrics.cashConversionEfficiency.toFixed(1) : '0'}%
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Ratio de liquidité</div>
              <div className="text-xl font-bold text-purple-600">
                {metrics ? metrics.liquidityRatio.toFixed(2) : '0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des flux de trésorerie */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Analyse des flux de trésorerie</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Période</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Revenus</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Encaissements</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Décaissements</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Flux net</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Taux conversion</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {cashFlowData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.period}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.revenue)}</td>
                  <td className="py-3 px-4 text-right text-green-600">{formatCurrency(item.cashInflow)}</td>
                  <td className="py-3 px-4 text-right text-red-600">{formatCurrency(item.cashOutflow)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${item.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.netCashFlow)}
                  </td>
                  <td className="py-3 px-4 text-right">{item.conversionRate.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'healthy' ? 'Sain' : item.status === 'warning' ? 'Attention' : 'Critique'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Métriques détaillées */}
      {metrics && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Métriques de cohérence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Fonds de roulement</div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(metrics.workingCapital)}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Flux de trésorerie opérationnel</div>
              <div className="text-lg font-bold text-green-600">{formatCurrency(metrics.operatingCashFlow)}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Flux de trésorerie libre</div>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(metrics.freeCashFlow)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Alertes et recommandations</h2>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${
                alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-amber-200 bg-amber-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Impact:</span> {alert.impact} | 
                      <span className="font-medium ml-2">Recommandation:</span> {alert.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicateur mode démo si erreur */}
      {error && metrics && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Mode démonstration: Données affichées à titre indicatif
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
