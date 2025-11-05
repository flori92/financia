"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { 
  Users,
  UserX,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar
} from "lucide-react";

export default function HrManagerDashboardPage() {
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
      const metrics = await apiGet('/api/v1/hr-manager/dashboard/metrics', { companyId: cid });
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
          <p className="mt-4 text-slate-600">Chargement du dashboard RH...</p>
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
  const workforce = kpis.workforce || {};
  const absences = kpis.absences || {};
  const payrollCosts = kpis.payrollCosts || {};
  const turnover = kpis.turnover || {};
  const alerts = data?.alerts || [];
  const departmentBreakdown = data?.departmentBreakdown || [];
  const evolutionChart = data?.evolutionChart || [];
  const topPositions = data?.topPositions || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard RH Manager</h1>
        <p className="text-slate-600">Gestion des ressources humaines et paie</p>
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
        {/* Effectifs */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Effectifs</h3>
            <Users className="w-8 h-8 text-[#0D9488]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{workforce.totalActive || 0}</div>
          <div className="mt-2 text-sm text-slate-500">
            CDI: {workforce.cdi || 0} | CDD: {workforce.cdd || 0}
          </div>
          <div className="mt-2 text-xs text-slate-600">
            +{workforce.newThisMonth || 0} nouveau(x) ce mois
          </div>
        </div>

        {/* Absences */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Absences</h3>
            <UserX className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{absences.currentAbsences || 0}</div>
          <div className="mt-2 text-sm text-slate-500">Absents aujourd'hui</div>
          {absences.pendingRequests > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700">
              {absences.pendingRequests} en attente
            </div>
          )}
        </div>

        {/* Masse Salariale */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Masse Salariale</h3>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{nf(payrollCosts.currentMonth)} FCFA</div>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {payrollCosts.variation > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-rose-700" />
                <span className="text-rose-700">+{payrollCosts.variation.toFixed(1)}%</span>
              </>
            ) : payrollCosts.variation < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-700">{payrollCosts.variation.toFixed(1)}%</span>
              </>
            ) : (
              <span className="text-slate-600">Stable</span>
            )}
          </div>
        </div>

        {/* Turnover */}
        <div className={`bg-white rounded-xl p-6 border ${
          turnover.status === 'high' ? 'border-rose-300' :
          turnover.status === 'moderate' ? 'border-amber-300' :
          'border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Turnover</h3>
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{turnover.turnoverRate?.toFixed(1) || 0}%</div>
          <div className="mt-2 text-sm text-slate-500">Taux annuel</div>
          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
            turnover.status === 'high' ? 'bg-rose-100 text-rose-700' :
            turnover.status === 'moderate' ? 'bg-amber-100 text-amber-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {turnover.status === 'high' ? 'Élevé' :
             turnover.status === 'moderate' ? 'Modéré' :
             'Faible'}
          </div>
        </div>
      </div>

      {/* Répartition par département */}
      {departmentBreakdown.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0D9488]" />
            Répartition par Département
          </h3>
          <div className="space-y-3">
            {departmentBreakdown.map((dept: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{dept.department}</span>
                  <span className="text-sm text-slate-600">{dept.count} ({dept.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-[#0D9488] h-2 rounded-full"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique évolution effectifs */}
      {evolutionChart.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Évolution Effectifs (12 mois)</h3>
          <div className="h-64 flex items-end gap-2">
            {evolutionChart.map((item: any, index: number) => {
              const maxValue = Math.max(...evolutionChart.map((i: any) => i.workforce));
              const height = (item.workforce / maxValue) * 100 * 2;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div
                      className="w-full bg-[#0D9488] rounded-t"
                      style={{ height: `${height}%` }}
                      title={`Effectif: ${item.workforce}`}
                    />
                  </div>
                  <div className="text-xs text-slate-600 text-center">{item.month}</div>
                  <div className="flex gap-1">
                    {item.hires > 0 && (
                      <span className="text-xs text-emerald-700" title="Embauches">+{item.hires}</span>
                    )}
                    {item.departures > 0 && (
                      <span className="text-xs text-rose-700" title="Départs">-{item.departures}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top postes */}
      {topPositions.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Postes / Fonctions</h3>
          <div className="space-y-3">
            {topPositions.map((position: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{position.position}</span>
                <span className="text-[#0D9488] font-semibold">{position.count} employé(s)</span>
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
