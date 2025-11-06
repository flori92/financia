'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, FileText, Award, Bell, AlertTriangle, Target, Activity } from 'lucide-react';
import { apiGet, getCompanyId } from '@/lib/api';
import { useEffectiveCompanyId, useSelectedClientName, isExpertClientMode } from '@/hooks/useCompanyId';

interface EntrepreneurData {
  kpiMonth: {
    revenue: number;
    expenses: number;
    netIncome: number;
    margin: number;
  };
  evolutionChart: Array<{ month: string; revenue: number; expenses: number }>;
  topClients: Array<{ name: string; amount: number }>;
  alerts: Array<{
    type: "danger" | "warning" | "info";
    title: string;
    message: string;
  }>;
  recentActivity: {
    entries: Array<{
      date: string;
      description: string;
      amount: number;
      type: string;
    }>;
  };
  treasuryMetrics?: {
    runway: number;
    net: number;
    last90Net: number;
  };
  nif?: string;
  rccm?: string;
  taxRegime?: string;
  legalStatus?: string;
  recentTransactions?: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
  }>;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>;
}

export default function EntrepreneurDashboard() {
  const [data, setData] = useState<EntrepreneurData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          setError("Aucune société sélectionnée. Veuillez vous connecter.");
          setLoading(false);
          return;
        }

        // Utiliser l'API accounting existante
        const [metrics, treasuryAlerts] = await Promise.allSettled([
          apiGet("/api/v1/accounting/dashboard/metrics", { companyId }),
          apiGet("/api/v1/treasury/alerts", { companyId })
        ]);

        const result: EntrepreneurData = {
          kpiMonth: { revenue: 0, expenses: 0, netIncome: 0, margin: 0 },
          evolutionChart: [],
          topClients: [],
          alerts: [],
          recentActivity: { entries: [] }
        };

        if (metrics.status === "fulfilled" && metrics.value) {
          result.kpiMonth = metrics.value.kpiMonth || result.kpiMonth;
          result.evolutionChart = metrics.value.evolutionChart || [];
          result.topClients = metrics.value.topClients || [];
          result.alerts = metrics.value.alerts || [];
          result.recentActivity = metrics.value.recentActivity || { entries: [] };
        }

        if (treasuryAlerts.status === "fulfilled" && treasuryAlerts.value) {
          result.treasuryMetrics = treasuryAlerts.value.metrics;
        }

        setData(result);
      } catch (err: any) {
        console.error("[EntrepreneurDashboard] Erreur chargement:", err);
        setError(err?.message || "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du dashboard entrepreneur...</p>
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
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  // Récupérer le nom du client si on est en mode expert
  const selectedClientName = useSelectedClientName();
  const isExpertMode = isExpertClientMode();

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isExpertMode ? `Gestion Client: ${selectedClientName}` : 'Tableau de Bord Entrepreneur'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isExpertMode
              ? 'Vous naviguez dans l\'espace de ce client en tant qu\'expert-comptable'
              : 'Vue d\'ensemble de votre activité'
            }
          </p>
        </div>
        <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <FileText className="w-4 h-4 mr-2" />
          Nouvelle Transaction
        </Button>
      </div>

      {/* Alertes */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <div key={index} className={`relative overflow-hidden rounded-xl shadow-lg p-5 transition-all hover:shadow-xl ${
              alert.type === 'danger' ? 'bg-gradient-to-r from-rose-500 to-rose-600' :
              alert.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
              'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-teal-100 text-sm font-medium uppercase tracking-wide">Chiffre d'Affaires</div>
              <TrendingUp className="w-6 h-6 text-teal-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
              {data.kpiMonth?.revenue?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-teal-100 font-medium">FCFA</div>
            <div className="mt-3 flex items-center text-teal-100 text-xs">
              <span>Ce mois</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-orange-100 text-sm font-medium uppercase tracking-wide">Dépenses</div>
              <TrendingDown className="w-6 h-6 text-orange-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
              {data.kpiMonth?.expenses?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-orange-100 font-medium">FCFA</div>
            <div className="mt-3 flex items-center text-orange-100 text-xs">
              <span>Ce mois</span>
            </div>
          </div>
        </div>

        {/* Net Income Card */}
        <div className={`relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          data.kpiMonth?.netIncome >= 0
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-rose-500 to-rose-600'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`text-sm font-medium uppercase tracking-wide ${
                data.kpiMonth?.netIncome >= 0 ? 'text-emerald-100' : 'text-rose-100'
              }`}>
                Résultat Net
              </div>
              <DollarSign className={`w-6 h-6 ${
                data.kpiMonth?.netIncome >= 0 ? 'text-emerald-200' : 'text-rose-200'
              }`} />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
              {Math.abs(data.kpiMonth?.netIncome || 0).toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${
              data.kpiMonth?.netIncome >= 0 ? 'text-emerald-100' : 'text-rose-100'
            }`}>
              FCFA
            </div>
            <div className={`mt-3 flex items-center text-xs ${
              data.kpiMonth?.netIncome >= 0 ? 'text-emerald-100' : 'text-rose-100'
            }`}>
              <span>{data.kpiMonth?.netIncome >= 0 ? 'Bénéfice' : 'Perte'}</span>
            </div>
          </div>
        </div>

        {/* Margin Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-purple-100 text-sm font-medium uppercase tracking-wide">Marge</div>
              <Target className="w-6 h-6 text-purple-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
              {data.kpiMonth?.margin?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-purple-100 font-medium">
              {data.kpiMonth?.margin >= 20 ? 'Excellente' :
               data.kpiMonth?.margin >= 10 ? 'Bonne' : 'Faible'}
            </div>
            <div className="mt-3 flex items-center text-purple-100 text-xs">
              <span>Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques trésorerie */}
      {data.treasuryMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Runway Card */}
          <div className={`relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
            data.treasuryMetrics.runway && data.treasuryMetrics.runway < 0 ? 'bg-gradient-to-br from-rose-500 to-rose-600' :
            data.treasuryMetrics.runway && data.treasuryMetrics.runway < 15 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
            'bg-gradient-to-br from-emerald-500 to-emerald-600'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white text-sm font-medium uppercase tracking-wide">Runway Trésorerie</div>
                <Activity className="w-6 h-6 text-white/80" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
                {data.treasuryMetrics.runway !== undefined ? `${data.treasuryMetrics.runway}` : 'N/A'}
              </div>
              <div className="text-sm text-white/90 font-medium">
                {data.treasuryMetrics.runway !== undefined ? 'jours' : ''}
              </div>
              <div className="mt-3 flex items-center text-white/80 text-xs">
                <span>Jours de couverture</span>
              </div>
            </div>
          </div>

          {/* Net Treasury Card */}
          <div className={`relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
            data.treasuryMetrics.net && data.treasuryMetrics.net < 0
              ? 'bg-gradient-to-br from-rose-500 to-rose-600'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white text-sm font-medium uppercase tracking-wide">Net Trésorerie (90j)</div>
                <DollarSign className="w-6 h-6 text-white/80" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight tabular-nums mb-2">
                {Math.abs(data.treasuryMetrics.net || 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/90 font-medium">FCFA</div>
              <div className="mt-3 flex items-center text-white/80 text-xs">
                <span>{data.treasuryMetrics.net && data.treasuryMetrics.net < 0 ? 'Déficit' : 'Excédent'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statut Formalisation */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Statut de Formalisation</h3>
        <div className="space-y-4">
          <div className="relative overflow-hidden flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">NIF Obtenu</p>
                <p className="text-sm text-white/90">Numéro: {data?.nif || 'Non renseigné'}</p>
              </div>
            </div>
            <span className="relative z-10 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold">Actif</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-slate-50">
              <p className="text-sm text-slate-600 mb-2 font-medium uppercase tracking-wide">RCCM</p>
              <p className="font-bold text-slate-900">{data?.rccm || 'En cours'}</p>
            </div>
            <div className="p-5 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-slate-50">
              <p className="text-sm text-slate-600 mb-2 font-medium uppercase tracking-wide">Régime Fiscal</p>
              <p className="font-bold text-slate-900">{data?.taxRegime || 'Non défini'}</p>
            </div>
            <div className="p-5 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-slate-50">
              <p className="text-sm text-slate-600 mb-2 font-medium uppercase tracking-wide">Statut Juridique</p>
              <p className="font-bold text-slate-900">{data?.legalStatus || 'Non défini'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Récentes */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Transactions Récentes</h3>
        <div className="space-y-3">
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            data.recentTransactions.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-110 ${
                    transaction.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {transaction.type === 'sale' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-600">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className={`font-bold text-lg tabular-nums ${transaction.type === 'sale' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {transaction.type === 'sale' ? '+' : '-'}{transaction.amount.toLocaleString()} FCFA
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Aucune transaction récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertes et Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
        </div>
        <div className="space-y-3">
          {data?.notifications && data.notifications.length > 0 ? (
            data.notifications.map((notif: any) => (
              <div key={notif.id} className={`relative overflow-hidden p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${
                notif.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                notif.type === 'info' ? 'bg-blue-50 border-blue-500' :
                'bg-emerald-50 border-emerald-500'
              }`}>
                <p className="font-bold text-slate-900">{notif.title}</p>
                <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Aucune notification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
