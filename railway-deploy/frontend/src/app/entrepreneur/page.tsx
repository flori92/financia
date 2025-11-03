'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, FileText, Award, Bell, AlertTriangle, Target, Activity } from 'lucide-react';
import { apiGet, getCompanyId } from '@/lib/api';
import { formatCurrency } from "@/lib/format-utils";
import { useEffectiveCompanyId, useSelectedClientName, isExpertClientMode } from '@/hooks/useCompanyId';
import { usePermissions } from '@/hooks/usePermissions';

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
  const { userRole, canWrite } = usePermissions();

  useEffect(() => {
    const loadData = async () => {
      const companyId = useEffectiveCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      try {
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

        if (metrics.status === "fulfilled") {
          result.kpiMonth = metrics.value.kpiMonth;
          result.evolutionChart = metrics.value.evolutionChart;
          result.topClients = metrics.value.topClients;
          result.alerts = metrics.value.alerts;
          result.recentActivity = metrics.value.recentActivity;
        }

        if (treasuryAlerts.status === "fulfilled") {
          result.treasuryMetrics = treasuryAlerts.value.metrics;
        }

        setData(result);
      } catch (err: any) {
        setError(err?.message || "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // La dépendance sera gérée par useEffectEffectiveCompanyId

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-600">Erreur: {error}</div>;
  if (!data) return <div className="p-8">Aucune donnée disponible</div>;

  // Récupérer le nom du client si on est en mode expert
  const selectedClientName = useSelectedClientName();
  const isExpertMode = isExpertClientMode();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isExpertMode ? `Gestion Client: ${selectedClientName}` : 'Tableau de Bord Entrepreneur'}
          </h1>
          <p className="text-gray-600">
            {isExpertMode 
              ? 'Vous naviguez dans l\'espace de ce client en tant qu\'expert-comptable' 
              : 'Vue d\'ensemble de votre activité'
            }
          </p>
        </div>
        {canWrite('entrepreneur') && (
          <Button className="bg-teal-600 hover:bg-teal-700">
            <FileText className="w-4 h-4 mr-2" />
            Nouvelle Transaction
          </Button>
        )}
      </div>

      {/* Alertes */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${
              alert.type === 'danger' ? 'border-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'danger' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpiMonth?.revenue?.toLocaleString() || 0} FCFA</div>
            <p className="text-xs text-green-600">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpiMonth?.expenses?.toLocaleString() || 0} FCFA</div>
            <p className="text-xs text-red-600">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.kpiMonth?.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(data.kpiMonth?.netIncome || 0).toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-600">
              {data.kpiMonth?.netIncome >= 0 ? 'Bénéfice' : 'Perte'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marge</CardTitle>
            <Target className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpiMonth?.margin?.toFixed(1) || 0}%</div>
            <p className="text-xs text-purple-600">
              {data.kpiMonth?.margin >= 20 ? 'Excellente' : 
               data.kpiMonth?.margin >= 10 ? 'Bonne' : 'Faible'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques trésorerie */}
      {data.treasuryMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Runway Trésorerie</CardTitle>
              <Activity className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                data.treasuryMetrics.runway && data.treasuryMetrics.runway < 0 ? 'text-red-600' :
                data.treasuryMetrics.runway && data.treasuryMetrics.runway < 15 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {data.treasuryMetrics.runway !== undefined ? `${data.treasuryMetrics.runway} jours` : 'N/A'}
              </div>
              <p className="text-xs text-gray-600">Jours de couverture</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Trésorerie (90j)</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.treasuryMetrics.net && data.treasuryMetrics.net < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(data.treasuryMetrics.net || 0).toLocaleString()} FCFA
              </div>
              <p className="text-xs text-gray-600">
                {data.treasuryMetrics.net && data.treasuryMetrics.net < 0 ? 'Déficit' : 'Excédent'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statut Formalisation */}
      <Card>
        <CardHeader>
          <CardTitle>Statut de Formalisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">NIF Obtenu</p>
                  <p className="text-sm text-gray-600">Numéro: {data?.nif}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">Actif</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">RCCM</p>
                <p className="font-medium">{data?.rccm || 'En cours'}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Régime Fiscal</p>
                <p className="font-medium">{data?.taxRegime}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Statut Juridique</p>
                <p className="font-medium">{data?.legalStatus}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.recentTransactions?.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'sale' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'sale' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className={`font-bold ${transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'sale' ? '+' : '-'}{transaction.amount.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes et Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.notifications?.map((notif: any) => (
              <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                notif.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                notif.type === 'info' ? 'bg-blue-50 border-blue-500' :
                'bg-green-50 border-green-500'
              }`}>
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
