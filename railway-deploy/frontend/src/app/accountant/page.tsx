"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { api } from "@/lib/api-service";
import { formatCurrency } from "@/lib/format-utils";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

export default function AccountantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    const cid = getCompanyId();
    if (!cid) { setError('Aucune société sélectionnée'); setLoading(false); return; }
    
    setLoading(true);
    try {
      const metrics = await api.getDashboardMetrics(cid);
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
    return <div className="p-8 text-center text-slate-500">Chargement du dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-600">{error}</div>;
  }

  if (!safeData) {
    return <div className="p-8 text-center text-slate-500">Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Comptable</h1>
        <button 
          onClick={loadDashboard}
          className="text-sm text-app-primary hover:underline"
        >
          Actualiser
        </button>
      </div>

      {/* Alertes */}
      {safeData.alerts.length > 0 && (
        <div className="space-y-2">
          {safeData.alerts.map((alert: any, idx: number) => (
            <div 
              key={idx}
              className={`card p-4 flex items-start gap-3 ${
                alert.type === 'danger' ? 'bg-rose-50 border-rose-200' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              {alert.type === 'danger' && <AlertCircle className="w-5 h-5 text-rose-700 mt-0.5 flex-shrink-0" />}
              {alert.type === 'warning' && <Clock className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />}
              {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${
                  alert.type === 'danger' ? 'text-rose-900' :
                  alert.type === 'warning' ? 'text-amber-900' :
                  'text-blue-900'
                }`}>{alert.title}</h4>
                <p className={`text-sm ${
                  alert.type === 'danger' ? 'text-rose-800' :
                  alert.type === 'warning' ? 'text-amber-800' :
                  'text-blue-800'
                }`}>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI du Mois */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-sm text-blue-700 mb-1">CA du Mois</div>
          <div className="text-2xl font-bold text-blue-900">{nf(safeData.kpiMonth.revenue)} FCFA</div>
          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Produits (classe 7)
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-sm text-orange-700 mb-1">Charges du Mois</div>
          <div className="text-2xl font-bold text-orange-900">{nf(safeData.kpiMonth.expenses)} FCFA</div>
          <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Charges (classe 6)
          </div>
        </div>

        <div className={`card p-4 bg-gradient-to-br ${safeData.kpiMonth.netIncome >= 0 ? 'from-emerald-50 to-emerald-100' : 'from-rose-50 to-rose-100'}`}>
          <div className={`text-sm mb-1 ${safeData.kpiMonth.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Résultat Net</div>
          <div className={`text-2xl font-bold ${safeData.kpiMonth.netIncome >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
            {nf(Math.abs(safeData.kpiMonth.netIncome))} FCFA
          </div>
          <div className={`text-xs mt-1 ${safeData.kpiMonth.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {safeData.kpiMonth.netIncome >= 0 ? 'Bénéfice' : 'Perte'}
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-sm text-purple-700 mb-1">Marge Brute</div>
          <div className="text-2xl font-bold text-purple-900">{safeData.kpiMonth.margin.toFixed(1)}%</div>
          <div className="text-xs text-purple-600 mt-1">
            {safeData.kpiMonth.margin >= 20 ? 'Excellente' : safeData.kpiMonth.margin >= 10 ? 'Bonne' : 'Faible'}
          </div>
        </div>
      </div>

      {/* Graphique Évolution */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Évolution 12 Derniers Mois</h3>
        <div className="h-64 flex items-end gap-2">
          {safeData.evolutionChart.map((month: any, idx: number) => {
            const maxVal = Math.max(...safeData.evolutionChart.map((m: any) => Math.max(m.revenue, m.expenses)));
            const revenueHeight = maxVal > 0 ? (month.revenue / maxVal) * 100 : 0;
            const expensesHeight = maxVal > 0 ? (month.expenses / maxVal) * 100 : 0;
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1">
                  <div 
                    className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${revenueHeight * 2}px` }}
                    title={`CA: ${nf(month.revenue)} FCFA`}
                  />
                  <div 
                    className="flex-1 bg-orange-500 rounded-t transition-all hover:bg-orange-600"
                    style={{ height: `${expensesHeight * 2}px` }}
                    title={`Charges: ${nf(month.expenses)} FCFA`}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-1">{month.month}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-slate-700">Produits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span className="text-sm text-slate-700">Charges</span>
          </div>
        </div>
      </div>

      {/* Top Clients & Fournisseurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Top 5 Clients</h3>
          {safeData.topClients.length === 0 ? (
            <div className="text-sm text-slate-500">Aucun client enregistré</div>
          ) : (
            <div className="space-y-2">
              {safeData.topClients.map((client: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
                  <span className="text-sm font-medium">{client.name}</span>
                  <span className="text-sm text-emerald-700 font-mono">{nf(client.amount)} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Top 5 Fournisseurs</h3>
          {safeData.topSuppliers.length === 0 ? (
            <div className="text-sm text-slate-500">Aucun fournisseur enregistré</div>
          ) : (
            <div className="space-y-2">
              {safeData.topSuppliers.map((supplier: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-app-border last:border-0">
                  <span className="text-sm font-medium">{supplier.name}</span>
                  <span className="text-sm text-orange-700 font-mono">{nf(supplier.amount)} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ratios Financiers */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Ratios Financiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-600 mb-2">Ratio de Liquidité Générale</div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {safeData.financialRatios.liquidityRatio.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Actif circulant / Passif circulant
            </div>
            <div className={`text-sm ${safeData.financialRatios.liquidityRatio >= 1.5 ? 'text-emerald-700' : safeData.financialRatios.liquidityRatio >= 1 ? 'text-amber-700' : 'text-rose-700'}`}>
              {safeData.financialRatios.liquidityRatio >= 1.5 ? 'Excellent' : safeData.financialRatios.liquidityRatio >= 1 ? 'Acceptable' : 'Faible'}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Ratio de Solvabilité</div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {safeData.financialRatios.solvencyRatio.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Capitaux propres / Total passif
            </div>
            <div className={`text-sm ${safeData.financialRatios.solvencyRatio >= 0.5 ? 'text-emerald-700' : safeData.financialRatios.solvencyRatio >= 0.3 ? 'text-amber-700' : 'text-rose-700'}`}>
              {safeData.financialRatios.solvencyRatio >= 0.5 ? 'Solide' : safeData.financialRatios.solvencyRatio >= 0.3 ? 'Modéré' : 'Fragile'}
            </div>
          </div>
        </div>
      </div>

      {/* Activité Récente */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Activité Récente (5 Dernières Écritures)
        </h3>
        {safeData.recentActivity.entries.length === 0 ? (
          <div className="text-sm text-slate-500">Aucune écriture récente</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {safeData.recentActivity.entries.map((entry: any, idx: number) => (
                  <tr key={idx} className="border-b border-app-border">
                    <td className="py-2">{entry.date?.toLocaleDateString('fr-FR') || '—'}</td>
                    <td className="py-2">{entry.description}</td>
                    <td className="py-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono">{nf(entry.amount)} FCFA</td>
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
