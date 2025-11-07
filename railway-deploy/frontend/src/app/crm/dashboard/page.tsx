"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Activity as ActivityIcon, 
  AlertTriangle, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Line, Bar, Pie } from "recharts";

interface CRMDashboardData {
  stats: {
    totalContacts: number;
    activeOpportunities: number;
    wonDeals: number;
    revenue: number;
  };
  pipeline: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  recentActivities: Array<{
    id: string;
    contactId: string;
    contactName: string;
    description: string;
    date: string;
    type: string;
  }>;
  topContacts: Array<{
    id: string;
    name: string;
    value: number;
    lastActivity: string;
  }>;
  trends?: {
    contacts: Array<{ month: string; value: number }>;
    revenue: Array<{ month: string; value: number }>;
    opportunities: Array<{ month: string; value: number }>;
  };
}

export default function CRMDashboardPage() {
  const [data, setData] = useState<CRMDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du dashboard CRM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Erreur de chargement</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const revenueGrowth = 12.5; // Simulé - à calculer depuis les données
  const contactsGrowth = 8.3;
  const opportunitiesGrowth = 15.7;

  // Préparer les données pour les graphiques
  const pipelineChartData = data.pipeline?.map((stage, index) => ({
    name: stage.stage,
    value: stage.value,
    count: stage.count,
    fill: index === 0 ? '#3B82F6' : 
          index === 1 ? '#10B981' : 
          index === 2 ? '#8B5CF6' : 
          '#F59E0B'
  })) || [];

  const revenueChartData = data.trends?.revenue || [
    { month: 'Jan', value: 2500000 },
    { month: 'Fév', value: 3200000 },
    { month: 'Mar', value: 2800000 },
    { month: 'Avr', value: 3500000 },
    { month: 'Mai', value: 4200000 },
    { month: 'Juin', value: 3800000 },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen">
      {/* Header avec gradient moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] via-[#0B7C74] to-[#0A6B66] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Dashboard CRM</h1>
              <p className="text-white/90 text-lg">Vue d'ensemble de votre relation client</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="7d" className="text-slate-900">7 derniers jours</option>
                <option value="30d" className="text-slate-900">30 derniers jours</option>
                <option value="90d" className="text-slate-900">90 derniers jours</option>
                <option value="1y" className="text-slate-900">1 an</option>
              </select>
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contacts Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                {contactsGrowth}%
              </div>
            </div>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Contacts</div>
            <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
              {data.stats.totalContacts.toLocaleString('fr-FR')}
            </div>
            <div className="text-white/70 text-xs">Total dans la base</div>
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                {opportunitiesGrowth}%
              </div>
            </div>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Opportunités</div>
            <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
              {data.stats.activeOpportunities.toLocaleString('fr-FR')}
            </div>
            <div className="text-white/70 text-xs">En cours</div>
          </div>
        </div>

        {/* Won Deals Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                24.2%
              </div>
            </div>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Ventes gagnées</div>
            <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
              {data.stats.wonDeals.toLocaleString('fr-FR')}
            </div>
            <div className="text-white/70 text-xs">Deals fermés</div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                {revenueGrowth}%
              </div>
            </div>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">CA Total</div>
            <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
              {(data.stats.revenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-white/70 text-xs">FCFA</div>
          </div>
        </div>
      </div>

      {/* Graphiques et Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Pipeline de ventes</h3>
              <p className="text-slate-600 text-sm">Répartition des opportunités par étape</p>
            </div>
            <Link
              href="/crm/opportunities"
              className="flex items-center gap-2 px-4 py-2 text-[#0D9488] hover:bg-slate-50 rounded-lg transition-colors"
            >
              Voir tout
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-6">
            {data.pipeline && data.pipeline.length > 0 ? (
              data.pipeline.map((stage, index) => {
                const maxValue = Math.max(...data.pipeline.map(s => s.value));
                const percentage = (stage.value / maxValue) * 100;
                
                return (
                  <div key={stage.stage} className="group">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{stage.stage}</span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {stage.count} opportunités
                        </span>
                      </div>
                      <span className="text-slate-700 font-semibold tabular-nums">
                        {(stage.value / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:scale-105 origin-left ${
                          index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          index === 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                          index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Aucun pipeline disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Graphique Revenus */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Évolution CA</h3>
            <p className="text-slate-600 text-sm">6 derniers mois</p>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueChartData.map((item, index) => {
              const maxValue = Math.max(...revenueChartData.map(d => d.value));
              const height = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-[#0D9488] to-[#0B7C74] rounded-t-lg transition-all duration-300 hover:opacity-80 group relative">
                    <div 
                      className="w-full rounded-t-lg"
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {(item.value / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activités récentes et Top Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Activités récentes</h3>
              <p className="text-slate-600 text-sm">Dernières interactions avec vos contacts</p>
            </div>
            <ActivityIcon className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {data.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.slice(0, 5).map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all border border-slate-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0D9488] to-[#0B7C74] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <ActivityIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 mb-1">{activity.contactName || 'Contact inconnu'}</div>
                    <div className="text-sm text-slate-600 mb-2">{activity.description || 'Aucune description'}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      <span className="px-2 py-0.5 bg-slate-200 rounded-full text-slate-600">
                        {activity.type}
                      </span>
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

        {/* Top Contacts */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Top Contacts</h3>
              <p className="text-slate-600 text-sm">Vos meilleurs clients par valeur</p>
            </div>
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-4">
            {data.topContacts && data.topContacts.length > 0 ? (
              data.topContacts.slice(0, 5).map((contact, index) => (
                <div 
                  key={contact.id} 
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all border border-slate-200 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0D9488] to-[#0B7C74] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 mb-1">{contact.name}</div>
                    <div className="text-sm text-slate-600">
                      Dernière activité: {new Date(contact.lastActivity).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#0D9488] tabular-nums">
                      {(contact.value / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-slate-500">FCFA</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Aucun contact disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex gap-4">
        <Link
          href="/crm/contacts"
          className="flex-1 px-6 py-4 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-xl hover:from-[#0B7C74] hover:to-[#0A6B66] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-center"
        >
          Voir tous les contacts
        </Link>
        <Link
          href="/crm/opportunities"
          className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:border-[#0D9488] hover:text-[#0D9488] shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-center"
        >
          Gérer les opportunités
        </Link>
      </div>
    </div>
  );
}
