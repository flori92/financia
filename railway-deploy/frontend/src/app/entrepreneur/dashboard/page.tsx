"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { 
  Target,
  Wallet,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Activity
} from "lucide-react";

export default function EntrepreneurDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    const cid = getCompanyId();
    if (!cid) { 
      setError('Aucune société sélectionnée'); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true);
    try {
      const metrics = await apiGet('/api/v1/entrepreneur/dashboard/metrics', { companyId: cid });
      setData(metrics);
      setError(null);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadDashboard(); 
    
    // Écouter les changements de société
    const handleCompanyChange = () => loadDashboard();
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, []);

  const nf = (value: number | null | undefined) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return '0';
    }
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488] mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600" />
            <div>
              <h3 className="font-semibold text-rose-900">Erreur de chargement</h3>
              <p className="text-sm text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const revenueVsTarget = kpis.revenueVsTarget || {};
  const cashflowRunway = kpis.cashflowRunway || {};
  const profitability = kpis.profitability || {};
  const burnRate = kpis.burnRate || {};
  const growthMetrics = data?.growthMetrics || {};
  const alerts = data?.alerts || [];
  const evolutionChart = data?.evolutionChart || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Entrepreneur</h1>
        <p className="text-slate-600">Vision stratégique et pilotage de votre entreprise</p>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert: any, index: number) => {
            const styles = {
              danger: 'bg-rose-50 border-rose-200 text-rose-900',
              warning: 'bg-amber-50 border-amber-200 text-amber-900',
              info: 'bg-blue-50 border-blue-200 text-blue-900',
            };
            const icons = {
              danger: AlertCircle,
              warning: Clock,
              info: CheckCircle,
            };
            const Icon = icons[alert.type as keyof typeof icons] || AlertCircle;

            return (
              <div key={index} className={`p-4 rounded-xl border ${styles[alert.type as keyof typeof styles]}`}>
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KPIs Stratégiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* CA vs Objectifs */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">CA vs Objectifs</h3>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{revenueVsTarget.achievementRate || 0}%</div>
          <div className="mt-2 text-sm text-slate-500">
            {nf(revenueVsTarget.actual)} / {nf(revenueVsTarget.target)} FCFA
          </div>
          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
            revenueVsTarget.status === 'achieved' ? 'bg-emerald-100 text-emerald-700' :
            revenueVsTarget.status === 'on-track' ? 'bg-blue-100 text-blue-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {revenueVsTarget.status === 'achieved' ? '✓ Atteint' :
             revenueVsTarget.status === 'on-track' ? 'En bonne voie' :
             'À risque'}
          </div>
        </div>

        {/* Cash-flow Runway */}
        <div className={`bg-white rounded-xl p-6 border ${
          cashflowRunway.status === 'critical' ? 'border-rose-300' :
          cashflowRunway.status === 'warning' ? 'border-amber-300' :
          'border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Cash-flow Runway</h3>
            <Wallet className="w-8 h-8 text-[#0D9488]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{cashflowRunway.runwayMonths || 0} mois</div>
          <div className="mt-2 text-sm text-slate-500">
            Tréso: {nf(cashflowRunway.currentCash)} FCFA
          </div>
          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
            cashflowRunway.status === 'critical' ? 'bg-rose-100 text-rose-700' :
            cashflowRunway.status === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {cashflowRunway.status === 'critical' ? '⚠ Critique' :
             cashflowRunway.status === 'warning' ? '⚠ Attention' :
             '✓ Sain'}
          </div>
        </div>

        {/* Marge Nette */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Marge Nette</h3>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
          <div className={`text-3xl font-bold ${profitability.netMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {profitability.netMargin?.toFixed(1) || 0}%
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Résultat: {nf(profitability.netIncome)} FCFA
          </div>
          <div className="mt-2 text-xs text-slate-600">
            EBITDA: {nf(profitability.ebitda)} FCFA
          </div>
        </div>

        {/* Burn Rate */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Burn Rate</h3>
            <Zap className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{nf(burnRate.monthlyAverage)} FCFA</div>
          <div className="mt-2 text-sm text-slate-500">Par mois en moyenne</div>
          <div className={`mt-2 flex items-center gap-1 text-xs ${
            burnRate.trend === 'increasing' ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {burnRate.trend === 'increasing' ? (
              <><TrendingUp className="w-3 h-3" /> En hausse</>
            ) : (
              <><TrendingDown className="w-3 h-3" /> En baisse</>
            )}
          </div>
        </div>
      </div>

      {/* Croissance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0D9488]" />
          Croissance YoY
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-slate-600 mb-1">Mois en cours</div>
            <div className="text-2xl font-bold text-slate-900">{nf(growthMetrics.currentRevenue)} FCFA</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Même mois année dernière</div>
            <div className="text-2xl font-bold text-slate-900">{nf(growthMetrics.lastYearRevenue)} FCFA</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-1">Taux de croissance</div>
            <div className={`text-2xl font-bold ${growthMetrics.growthRate >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {growthMetrics.growthRate > 0 ? '+' : ''}{growthMetrics.growthRate?.toFixed(1) || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Graphique évolution */}
      {evolutionChart.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Évolution (12 derniers mois)</h3>
          <div className="h-64 flex items-end gap-2">
            {evolutionChart.map((item: any, index: number) => {
              const maxValue = Math.max(...evolutionChart.map((i: any) => Math.max(i.revenue, i.expenses)));
              const revenueHeight = (item.revenue / maxValue) * 100 * 2;
              const expensesHeight = (item.expenses / maxValue) * 100 * 2;
              const netIncomeHeight = Math.abs((item.netIncome / maxValue) * 100 * 2);

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full flex flex-col justify-end gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${revenueHeight}%` }}
                      title={`CA: ${nf(item.revenue)} FCFA`}
                    />
                    <div
                      className="w-full bg-orange-500 rounded-t"
                      style={{ height: `${expensesHeight}%` }}
                      title={`Charges: ${nf(item.expenses)} FCFA`}
                    />
                  </div>
                  <div className="text-xs text-slate-600 text-center">{item.month}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-slate-600">CA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-slate-600">Charges</span>
            </div>
          </div>
        </div>
      )}

      {/* Profitabilité détaillée */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Indicateurs de Profitabilité</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-600 mb-2">Produits</div>
            <div className="text-2xl font-bold text-blue-700">{nf(profitability.revenue)} FCFA</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-2">Charges</div>
            <div className="text-2xl font-bold text-orange-700">{nf(profitability.expenses)} FCFA</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-2">Résultat Net</div>
            <div className={`text-2xl font-bold ${profitability.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {nf(profitability.netIncome)} FCFA
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 mb-2">Marge Brute</div>
            <div className="text-2xl font-bold text-purple-700">{profitability.grossMargin?.toFixed(1) || 0}%</div>
          </div>
        </div>
      </div>

      {/* Bouton Actualiser */}
      <div className="mt-6 text-center">
        <button
          onClick={loadDashboard}
          className="text-[#0D9488] hover:underline text-sm font-medium"
        >
          Actualiser les données
        </button>
      </div>
    </div>
  );
}
