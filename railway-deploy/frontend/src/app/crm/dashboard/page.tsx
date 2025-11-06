"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { TrendingUp, Users, DollarSign, Target, Activity as ActivityIcon, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CRMDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const cid = getCompanyId();
    if (!cid) {
      setError("Aucune société sélectionnée");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet('/api/v1/crm/dashboard', { companyId: cid });
      setData(result);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du dashboard CRM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Erreur de chargement</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard CRM</h1>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Contacts Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">Contacts</div>
              <Users className="w-6 h-6 text-blue-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {data.stats.totalContacts}
            </div>
            <div className="mt-3 text-blue-100 text-xs">
              Total dans la base
            </div>
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Opportunités</div>
              <Target className="w-6 h-6 text-emerald-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {data.stats.activeOpportunities}
            </div>
            <div className="mt-3 text-emerald-100 text-xs">
              En cours
            </div>
          </div>
        </div>

        {/* Won Deals Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-purple-100 text-sm font-medium uppercase tracking-wide">Ventes gagnées</div>
              <TrendingUp className="w-6 h-6 text-purple-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {data.stats.wonDeals}
            </div>
            <div className="mt-3 text-purple-100 text-xs">
              Deals fermés
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-amber-100 text-sm font-medium uppercase tracking-wide">CA Total</div>
              <DollarSign className="w-6 h-6 text-amber-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {(data.stats.revenue / 1000000).toFixed(1)}M
            </div>
            <div className="mt-3 text-amber-100 text-xs">
              FCFA
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline and Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipeline Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Pipeline de ventes</h3>
          <div className="space-y-5">
            {data.pipeline && data.pipeline.length > 0 ? (
              data.pipeline.map((stage: any, index: number) => (
                <div key={stage.stage} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-900">{stage.stage}</span>
                    <span className="text-slate-600 font-medium tabular-nums">
                      {stage.count} • {(stage.value / 1000000).toFixed(1)}M FCFA
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        index === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                        index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                        'bg-gradient-to-r from-amber-500 to-amber-600'
                      } group-hover:scale-105 origin-left`}
                      style={{ width: `${Math.min((stage.value / 5000000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Aucun pipeline disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Activities Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Activités récentes</h3>
          <div className="space-y-3">
            {data.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all border border-slate-200">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{activity.contactName || 'Contact inconnu'}</div>
                    <div className="text-sm text-slate-600 mt-1">{activity.description || 'Aucune description'}</div>
                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                      <ActivityIcon className="w-3 h-3" />
                      {new Date(activity.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ActivityIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          href="/crm/contacts"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Voir tous les contacts
        </Link>
        <Link
          href="/crm/opportunities"
          className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
        >
          Gérer les opportunités
        </Link>
      </div>
    </div>
  );
}
