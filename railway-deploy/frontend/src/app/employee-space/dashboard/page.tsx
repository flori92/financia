"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { 
  User,
  Calendar,
  DollarSign,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  FileText,
  TrendingUp
} from "lucide-react";

export default function EmployeeDashboardPage() {
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
      const metrics = await apiGet('/api/v1/employee/dashboard/metrics', { companyId: cid });
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
          <p className="mt-4 text-slate-600">Chargement de votre espace...</p>
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
  const employeeInfo = kpis.employeeInfo || {};
  const leaves = kpis.leaves || {};
  const payroll = kpis.payroll || {};
  const tasks = kpis.tasks || {};
  const alerts = data?.alerts || [];
  const upcomingLeaves = data?.upcomingLeaves || [];
  const recentPayslips = data?.recentPayslips || [];

  const seniorityYears = employeeInfo.seniorityDays ? Math.floor(employeeInfo.seniorityDays / 365) : 0;
  const seniorityMonths = employeeInfo.seniorityDays ? Math.floor((employeeInfo.seniorityDays % 365) / 30) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header avec info employé */}
      <div className="mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0D9488] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{employeeInfo.name}</h1>
              <p className="text-slate-600">{employeeInfo.position}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{employeeInfo.department}</span>
                </div>
                {seniorityYears > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {seniorityYears} an{seniorityYears > 1 ? 's' : ''}
                      {seniorityMonths > 0 && ` et ${seniorityMonths} mois`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
        {/* Congés */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Mes Congés</h3>
            <Calendar className="w-8 h-8 text-[#0D9488]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{leaves.remaining || 0}</div>
          <div className="mt-2 text-sm text-slate-500">Jours restants</div>
          <div className="mt-2 text-xs text-slate-600">
            {leaves.used}/{leaves.balance} utilisés cette année
          </div>
        </div>

        {/* Dernière Paie */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Dernière Paie</h3>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{nf(payroll.lastSalary)} FCFA</div>
          <div className="mt-2 text-sm text-slate-500">Salaire net</div>
          <div className="mt-2 text-xs text-slate-600">
            {payroll.slipsCount} bulletin(s) cette année
          </div>
        </div>

        {/* Demandes en Cours */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Demandes</h3>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{leaves.pending || 0}</div>
          <div className="mt-2 text-sm text-slate-500">En attente</div>
          <div className="mt-2 text-xs text-emerald-700">
            {leaves.approved || 0} approuvée(s)
          </div>
        </div>

        {/* Tâches */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Mes Tâches</h3>
            <CheckSquare className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{tasks.tasksTotal || 0}</div>
          <div className="mt-2 text-sm text-slate-500">Tâches actives</div>
          <div className="mt-2 text-xs text-emerald-700">
            {tasks.tasksCompleted || 0} complétées
          </div>
        </div>
      </div>

      {/* Congés à venir */}
      {upcomingLeaves.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0D9488]" />
            Mes Congés à venir
          </h3>
          <div className="space-y-3">
            {upcomingLeaves.map((leave: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{leave.type}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="text-sm font-medium text-[#0D9488]">
                  {leave.days} jour{leave.days > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fiches de paie récentes */}
      {recentPayslips.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0D9488]" />
            Mes Fiches de Paie
          </h3>
          <div className="space-y-3">
            {recentPayslips.map((payslip: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{payslip.month}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Brut: {nf(payslip.grossSalary)} FCFA
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#0D9488]">{nf(payslip.netSalary)} FCFA</div>
                  <div className="text-xs text-slate-500 mt-1">Net</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cumuls annuels */}
      {payroll.ytdGross > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Cumuls Année en Cours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-2">Salaire Brut Total</div>
              <div className="text-2xl font-bold text-slate-900">{nf(payroll.ytdGross)} FCFA</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Salaire Net Total</div>
              <div className="text-2xl font-bold text-[#0D9488]">{nf(payroll.ytdNet)} FCFA</div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton Actualiser */}
      <div className="mt-6 text-center">
        <button
          onClick={loadDashboard}
          className="text-[#0D9488] hover:underline text-sm font-medium"
        >
          Actualiser mes données
        </button>
      </div>
    </div>
  );
}
