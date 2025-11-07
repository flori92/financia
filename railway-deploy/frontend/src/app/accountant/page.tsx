"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, FileText, RefreshCw, DollarSign, Receipt } from "lucide-react";

export default function AccountantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    const cid = getCompanyId();
    if (!cid) { setError('Aucune société sélectionnée'); setLoading(false); return; }

    setLoading(true);
    try {
      const metrics = await apiGet('/api/v1/accounting/dashboard/metrics', { companyId: cid });
      setData(metrics);
      setError(null);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  useEffect(() => {
    loadDashboard();

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

  const safeData = data ? {
    kpiMonth: {
      revenue: Number(data.kpiMonth?.revenue) || 0,
      expenses: Number(data.kpiMonth?.expenses) || 0,
      netIncome: Number(data.kpiMonth?.netIncome) || 0,
      margin: Number.isFinite(Number(data.kpiMonth?.margin)) ? Number(data.kpiMonth.margin) : 0,
    },
    alerts: Array.isArray(data.alerts) ? data.alerts : [],
    evolutionChart: Array.isArray(data.evolutionChart) ? data.evolutionChart.map((point: any) => ({
      month: point?.month ?? '',
      revenue: Number(point?.revenue) || 0,
      expenses: Number(point?.expenses) || 0,
    })) : [],
    topClients: Array.isArray(data.topClients) ? data.topClients.map((client: any) => ({
      name: client?.name ?? '—',
      amount: Number(client?.amount) || 0,
    })) : [],
    topSuppliers: Array.isArray(data.topSuppliers) ? data.topSuppliers.map((supplier: any) => ({
      name: supplier?.name ?? '—',
      amount: Number(supplier?.amount) || 0,
    })) : [],
    financialRatios: {
      liquidityRatio: Number.isFinite(Number(data.financialRatios?.liquidityRatio)) ? Number(data.financialRatios.liquidityRatio) : 0,
      solvencyRatio: Number.isFinite(Number(data.financialRatios?.solvencyRatio)) ? Number(data.financialRatios.solvencyRatio) : 0,
    },
    recentActivity: {
      entries: Array.isArray(data.recentActivity?.entries) ? data.recentActivity.entries.map((entry: any) => ({
        date: entry?.date ? new Date(entry.date) : null,
        description: entry?.description ?? '—',
        type: entry?.type ?? '—',
        amount: Number(entry?.amount) || 0,
      })) : [],
    },
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <p className="text-rose-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!safeData) {
    return <div className="p-8 text-center text-slate-500">Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard Comptable</h1>
          <p className="text-slate-600">Vue d'ensemble de votre comptabilité</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Actualiser</span>
        </button>
      </div>

      {/* Alertes */}
      {safeData.alerts.length > 0 && (
        <div className="space-y-3">
          {safeData.alerts.map((alert: any, idx: number) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl shadow-lg p-5 transition-all hover:shadow-xl ${
                alert.type === 'danger' ? 'bg-rose-500' :
                alert.type === 'warning' ? 'bg-amber-500' :
                'bg-blue-500'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {alert.type === 'danger' && <AlertCircle className="w-5 h-5 text-white" />}
                    {alert.type === 'warning' && <Clock className="w-5 h-5 text-white" />}
                    {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg mb-1">{alert.title}</h4>
                  <p className="text-white/90">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI du Mois */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="card p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-600 text-sm font-medium uppercase tracking-wide">CA du Mois</div>
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums mb-2">
            {nf(safeData.kpiMonth.revenue)}
          </div>
          <div className="text-sm text-slate-600 font-medium">FCFA</div>
          <div className="mt-3 flex items-center text-slate-500 text-xs">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Produits (classe 7)</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-600 text-sm font-medium uppercase tracking-wide">Charges</div>
            <Receipt className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums mb-2">
            {nf(safeData.kpiMonth.expenses)}
          </div>
          <div className="text-sm text-slate-600 font-medium">FCFA</div>
          <div className="mt-3 flex items-center text-slate-500 text-xs">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>Charges (classe 6)</span>
          </div>
        </div>

        {/* Net Income Card */}
        <div className={`card p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          safeData.kpiMonth.netIncome >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-medium uppercase tracking-wide ${
              safeData.kpiMonth.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>Résultat Net</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              safeData.kpiMonth.netIncome >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
            }`}>
              {safeData.kpiMonth.netIncome >= 0 ? '✓' : '✕'}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums mb-2">
            {nf(Math.abs(safeData.kpiMonth.netIncome))}
          </div>
          <div className="text-sm text-slate-600 font-medium">FCFA</div>
          <div className={`mt-3 text-xs font-medium ${
            safeData.kpiMonth.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {safeData.kpiMonth.netIncome >= 0 ? '✓ Bénéfice' : '✕ Perte'}
          </div>
        </div>

        {/* Margin Card */}
        <div className="card p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-600 text-sm font-medium uppercase tracking-wide">Marge Brute</div>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-700 font-bold text-xs">%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums mb-2">
            {safeData.kpiMonth.margin.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-600 font-medium">Taux de marge</div>
          <div className="mt-3 text-xs text-slate-500 font-medium">
            {safeData.kpiMonth.margin >= 20 ? '⭐ Excellente' : safeData.kpiMonth.margin >= 10 ? '✓ Bonne' : '⚠ Faible'}
          </div>
        </div>
      </div>

      {/* Graphique Évolution */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Évolution 12 Derniers Mois</h3>
        <div className="h-72 flex items-end gap-2">
          {safeData.evolutionChart.map((month: any, idx: number) => {
            const maxVal = Math.max(...safeData.evolutionChart.map((m: any) => Math.max(m.revenue, m.expenses)));
            const revenueHeight = maxVal > 0 ? (month.revenue / maxVal) * 100 : 0;
            const expensesHeight = maxVal > 0 ? (month.expenses / maxVal) * 100 : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex gap-1.5">
                  <div
                    className="flex-1 bg-[#0D9488] rounded-t-lg transition-all group-hover:bg-[#0D9488]/80 cursor-pointer"
                    style={{ height: `${revenueHeight * 2.4}px`, minHeight: '4px' }}
                    title={`CA: ${nf(month.revenue)} FCFA`}
                  />
                  <div
                    className="flex-1 bg-orange-500 rounded-t-lg transition-all group-hover:bg-orange-500/80 cursor-pointer"
                    style={{ height: `${expensesHeight * 2.4}px`, minHeight: '4px' }}
                    title={`Charges: ${nf(month.expenses)} FCFA`}
                  />
                </div>
                <div className="text-xs text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                  {month.month}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#0D9488] rounded shadow-sm" />
            <span className="text-sm font-medium text-slate-700">Produits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded shadow-sm" />
            <span className="text-sm font-medium text-slate-700">Charges</span>
          </div>
        </div>
      </div>

      {/* Top Clients & Fournisseurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Top 5 Clients</h3>
          {safeData.topClients.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Aucun client enregistré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeData.topClients.map((client: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0D9488] font-bold text-sm">{idx + 1}</span>
                    </div>
                    <span className="font-medium text-slate-900">{client.name}</span>
                  </div>
                  <span className="text-[#0D9488] font-bold tabular-nums">{nf(client.amount)} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Top 5 Fournisseurs</h3>
          {safeData.topSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Aucun fournisseur enregistré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeData.topSuppliers.map((supplier: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-500 font-bold text-sm">{idx + 1}</span>
                    </div>
                    <span className="font-medium text-slate-900">{supplier.name}</span>
                  </div>
                  <span className="text-orange-500 font-bold tabular-nums">{nf(supplier.amount)} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ratios Financiers */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Ratios Financiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-sm font-medium text-slate-700 uppercase tracking-wide mb-3">
              Ratio de Liquidité Générale
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2 tabular-nums">
              {safeData.financialRatios.liquidityRatio.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 mb-4">
              Actif circulant / Passif circulant
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
              safeData.financialRatios.liquidityRatio >= 1.5
                ? 'bg-emerald-100 text-emerald-700'
                : safeData.financialRatios.liquidityRatio >= 1
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
            }`}>
              {safeData.financialRatios.liquidityRatio >= 1.5 ? '⭐ Excellent' :
               safeData.financialRatios.liquidityRatio >= 1 ? '✓ Acceptable' : '⚠ Faible'}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-sm font-medium text-slate-700 uppercase tracking-wide mb-3">
              Ratio de Solvabilité
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2 tabular-nums">
              {safeData.financialRatios.solvencyRatio.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 mb-4">
              Capitaux propres / Total passif
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
              safeData.financialRatios.solvencyRatio >= 0.5
                ? 'bg-emerald-100 text-emerald-700'
                : safeData.financialRatios.solvencyRatio >= 0.3
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
            }`}>
              {safeData.financialRatios.solvencyRatio >= 0.5 ? '⭐ Solide' :
               safeData.financialRatios.solvencyRatio >= 0.3 ? '✓ Modéré' : '⚠ Fragile'}
            </div>
          </div>
        </div>
      </div>

      {/* Activité Récente */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-700" />
          Activité Récente (5 Dernières Écritures)
        </h3>
        {safeData.recentActivity.entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">Aucune écriture récente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeData.recentActivity.entries.map((entry: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                      {entry.date ? entry.date.toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{entry.description}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right tabular-nums font-semibold">
                      {nf(entry.amount)} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
