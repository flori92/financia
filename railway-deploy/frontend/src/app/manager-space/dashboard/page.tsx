"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { 
  Users,
  UserX,
  Target,
  FolderKanban,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Phone
} from "lucide-react";

export default function ManagerDashboardPage() {
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
      const metrics = await apiGet('/api/v1/manager/dashboard/metrics', { companyId: cid });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488] mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement de votre équipe...</p>
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
  const teamSize = kpis.teamSize || {};
  const absences = kpis.absences || {};
  const performance = kpis.performance || {};
  const projects = kpis.projects || {};
  const alerts = data?.alerts || [];
  const teamMembers = data?.teamMembers || [];
  const upcomingLeaves = data?.upcomingLeaves || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Manager</h1>
        <p className="text-slate-600">Gestion de votre équipe et projets</p>
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
        {/* Mon Équipe */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Mon Équipe</h3>
            <Users className="w-8 h-8 text-[#0D9488]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{teamSize.totalMembers || 0}</div>
          <div className="mt-2 text-sm text-slate-500">Membres actifs</div>
          {teamSize.newThisMonth > 0 && (
            <div className="mt-2 text-xs text-emerald-700">
              +{teamSize.newThisMonth} nouveau(x) ce mois
            </div>
          )}
        </div>

        {/* Absences */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Absences</h3>
            <UserX className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{absences.todayAbsences || 0}</div>
          <div className="mt-2 text-sm text-slate-500">Absent(s) aujourd'hui</div>
          {absences.pendingRequests > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700">
              {absences.pendingRequests} demande(s) à valider
            </div>
          )}
        </div>

        {/* Performance Équipe */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Performance</h3>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{performance.completionRate || 0}%</div>
          <div className="mt-2 text-sm text-slate-500">
            {performance.objectivesCompleted}/{performance.objectivesTotal} objectifs
          </div>
        </div>

        {/* Projets */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Projets</h3>
            <FolderKanban className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{projects.activeProjects || 0}</div>
          <div className="mt-2 text-sm text-slate-500">En cours</div>
          {projects.tasksOverdue > 0 && (
            <div className="mt-2 text-xs text-rose-700">
              {projects.tasksOverdue} tâche(s) en retard
            </div>
          )}
        </div>
      </div>

      {/* Membres de l'équipe */}
      {teamMembers.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Membres de l'Équipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member: any, index: number) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{member.position}</div>
                    <div className="text-xs text-slate-500 mt-1">{member.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Congés à venir */}
      {upcomingLeaves.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0D9488]" />
            Congés à venir (7 prochains jours)
          </h3>
          <div className="space-y-3">
            {upcomingLeaves.map((leave: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{leave.employeeName}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="text-sm font-medium text-[#0D9488]">
                  {leave.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state si aucun membre */}
      {teamMembers.length === 0 && (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Aucun membre d'équipe trouvé</p>
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
