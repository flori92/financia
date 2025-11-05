"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { 
  Calculator, 
  Building2, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3
} from "lucide-react";

export default function ExpertComptableDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    try {
      const metrics = await apiGet('/api/v1/expert-comptable/dashboard/metrics');
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
  const alerts = data?.alerts || [];
  const companiesPerformance = data?.companiesPerformance || [];
  const evolutionChart = data?.evolutionChart || [];
  const topCompanies = data?.topCompanies || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Expert Comptable</h1>
        <p className="text-slate-600">Vue d'ensemble de toutes les sociétés gérées</p>
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

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sociétés gérées */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Sociétés gérées</h3>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{kpis.companiesManaged || 0}</div>
          <div className="mt-2 text-sm text-slate-500">Sociétés sous votre gestion</div>
        </div>

        {/* Écritures en attente */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Écritures en attente</h3>
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{kpis.pendingEntries || 0}</div>
          <div className="mt-2 text-sm text-slate-500">À valider</div>
        </div>

        {/* Déclarations à venir */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Déclarations à venir</h3>
            <Calculator className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{kpis.upcomingDeclarations || 0}</div>
          <div className="mt-2 text-sm text-slate-500">30 prochains jours</div>
        </div>

        {/* Trésorerie globale */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Trésorerie globale</h3>
            <DollarSign className="w-8 h-8 text-[#0D9488]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{nf(kpis.globalTreasury)} FCFA</div>
          <div className="mt-2 text-sm text-slate-500">Toutes sociétés confondues</div>
        </div>
      </div>

      {/* Performance des sociétés */}
      {companiesPerformance.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0D9488]" />
            Performance des sociétés
          </h3>
          <div className="space-y-3">
            {companiesPerformance.slice(0, 10).map((company: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{company.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    CA: {nf(company.revenue)} FCFA
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${company.status === 'positive' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {company.status === 'positive' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">{nf(company.netIncome)} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique évolution */}
      {evolutionChart.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Évolution globale (12 mois)</h3>
          <div className="h-64 flex items-end gap-2">
            {evolutionChart.map((item: any, index: number) => {
              const maxValue = Math.max(...evolutionChart.map((i: any) => Math.max(i.revenue, i.expenses)));
              const revenueHeight = (item.revenue / maxValue) * 100 * 2;
              const expensesHeight = (item.expenses / maxValue) * 100 * 2;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full flex flex-col justify-end gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${revenueHeight}%` }}
                      title={`Produits: ${nf(item.revenue)} FCFA`}
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
              <span className="text-sm text-slate-600">Produits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-slate-600">Charges</span>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 sociétés */}
      {topCompanies.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Sociétés par CA</h3>
          <div className="space-y-3">
            {topCompanies.map((company: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{company.name}</div>
                  <div className="text-sm text-slate-600">
                    Résultat: {nf(company.netIncome)} FCFA
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#0D9488]">{nf(company.revenue)} FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
