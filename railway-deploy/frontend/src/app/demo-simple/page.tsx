"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Smartphone,
  BarChart3,
  Users,
  Building2,
  RefreshCw
} from "lucide-react";

export default function DemoSimplePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mobile-money' | 'aged-balance'>('dashboard');

  // Données de démonstration simplifiées
  const dashboardData = {
    kpiMonth: {
      revenue: 3500000,
      expenses: 2100000,
      netIncome: 1400000,
      margin: 40.0,
    },
    alerts: [
      {
        type: "success" as const,
        title: "Excellente santé financière",
        message: "Liquidité supérieure à 2.5x les exigences minimales",
      },
      {
        type: "info" as const,
        title: "Objectif mensuel atteint",
        message: "CA du mois: 3.5M XOF (+12% vs objectif)",
      },
      {
        type: "warning" as const,
        title: "Attention aux créances anciennes",
        message: "3 créances ont plus de 90 jours, actions de recouvrement recommandées",
      },
      {
        type: "danger" as const,
        title: "Liquidité critique",
        message: "Ratio de liquidité inférieur à 1, risque de trésorerie imminent",
      },
    ],
    topClients: [
      { name: "SOCIETE GENERAL", amount: 1250000 },
      { name: "ECOBANK SENEGAL", amount: 980000 },
      { name: "SONATEL SA", amount: 750000 },
    ],
    topSuppliers: [
      { name: "FOURNISSEUR INFO TECH", amount: 680000 },
      { name: "MATERIEL BUREAU SA", amount: 450000 },
      { name: "SERVICES NETTOYAGE", amount: 320000 },
    ],
  };

  const mobileMoneyData = {
    stats: {
      total: 25,
      successful: 20,
      failed: 3,
      pending: 2,
      totalAmount: 4250000,
    },
    transactions: [
      {
        id: "1",
        provider: "wave",
        amount: 250000,
        customerName: "Aliou Diop",
        status: "success" as const,
        createdAt: "2024-11-01T10:30:00Z",
      },
      {
        id: "2",
        provider: "orange",
        amount: 180000,
        customerName: "Fatou Sall",
        status: "success" as const,
        createdAt: "2024-11-01T14:15:00Z",
      },
      {
        id: "3",
        provider: "mtn",
        amount: 320000,
        customerName: "Mamadou Ba",
        status: "pending" as const,
        createdAt: "2024-11-01T16:45:00Z",
      },
    ],
  };

  const agedBalanceData = {
    receivables: {
      totals: {
        total: 5500000,
        current: 1900000,
        days30_60: 2400000,
        days60_90: 900000,
        over90: 300000,
      },
      items: [
        {
          party: "SOCIETE GENERAL",
          total: 2500000,
          current: 800000,
          days30_60: 1200000,
          days60_90: 400000,
          over90: 100000,
        },
        {
          party: "ECOBANK SENEGAL",
          total: 1800000,
          current: 600000,
          days30_60: 800000,
          days60_90: 300000,
          over90: 100000,
        },
      ],
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (type: string) => {
    const badges = {
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-rose-100 text-rose-800",
      info: "bg-blue-100 text-blue-800",
      pending: "bg-amber-100 text-amber-800",
      failed: "bg-rose-100 text-rose-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Alertes */}
      <div className="space-y-3">
        {dashboardData.alerts.map((alert, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            alert.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
            alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
            alert.type === 'danger' ? 'bg-rose-50 border-rose-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              {alert.type === 'warning' && <Clock className="w-5 h-5 text-amber-600" />}
              {alert.type === 'danger' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-600" />}
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">CA Mois</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(dashboardData.kpiMonth.revenue)}
              </p>
              <p className="text-xs text-blue-700 mt-1">Produits classe 7</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Charges Mois</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(dashboardData.kpiMonth.expenses)}
              </p>
              <p className="text-xs text-orange-700 mt-1">Charges classe 6</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Résultat Net</p>
              <p className="text-2xl font-bold text-emerald-900">
                {formatCurrency(dashboardData.kpiMonth.netIncome)}
              </p>
              <p className="text-xs text-emerald-700 mt-1">Bénéfice</p>
            </div>
            <BarChart3 className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Marge Brute</p>
              <p className="text-2xl font-bold text-purple-900">
                {dashboardData.kpiMonth.margin.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-700 mt-1">Excellente</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Top Clients et Fournisseurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Top Clients
          </h3>
          <div className="space-y-2">
            {dashboardData.topClients.map((client, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">{client.name}</span>
                <span className="text-emerald-700 font-mono">
                  {formatCurrency(client.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            Top Fournisseurs
          </h3>
          <div className="space-y-2">
            {dashboardData.topSuppliers.map((supplier, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">{supplier.name}</span>
                <span className="text-orange-700 font-mono">
                  {formatCurrency(supplier.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileMoney = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total transactions</p>
              <p className="text-2xl font-bold">{mobileMoneyData.stats.total}</p>
            </div>
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(mobileMoneyData.stats.totalAmount)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Succès</p>
              <p className="text-2xl font-bold text-green-600">{mobileMoneyData.stats.successful}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{mobileMoneyData.stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium">Provider</th>
                <th className="text-left p-4 font-medium">Montant</th>
                <th className="text-left p-4 font-medium">Statut</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {mobileMoneyData.transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{transaction.customerName}</p>
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-medium">{transaction.provider}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="p-4">
                    <p className="text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAgedBalance = () => {
    const data = agedBalanceData.receivables;
    
    const getPercentage = (part: number, total: number) => {
      if (total === 0) return 0;
      return ((part / total) * 100).toFixed(1);
    };

    return (
      <div className="space-y-6">
        {/* Répartition */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg border">
            <p className="text-sm text-emerald-600 font-medium">0-30 jours</p>
            <p className="text-lg font-bold text-emerald-900">
              {formatCurrency(data.totals.current)}
            </p>
            <p className="text-xs text-emerald-700">
              {getPercentage(data.totals.current, data.totals.total)}%
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border">
            <p className="text-sm text-blue-600 font-medium">30-60 jours</p>
            <p className="text-lg font-bold text-blue-900">
              {formatCurrency(data.totals.days30_60)}
            </p>
            <p className="text-xs text-blue-700">
              {getPercentage(data.totals.days30_60, data.totals.total)}%
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border">
            <p className="text-sm text-amber-600 font-medium">60-90 jours</p>
            <p className="text-lg font-bold text-amber-900">
              {formatCurrency(data.totals.days60_90)}
            </p>
            <p className="text-xs text-amber-700">
              {getPercentage(data.totals.days60_90, data.totals.total)}%
            </p>
          </div>

          <div className="bg-rose-50 p-4 rounded-lg border">
            <p className="text-sm text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              +90 jours
            </p>
            <p className="text-lg font-bold text-rose-900">
              {formatCurrency(data.totals.over90)}
            </p>
            <p className="text-xs text-rose-700">
              {getPercentage(data.totals.over90, data.totals.total)}%
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border">
            <p className="text-sm text-slate-600 font-medium">Total</p>
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(data.totals.total)}
            </p>
            <p className="text-xs text-slate-700">100%</p>
          </div>
        </div>

        {/* Tableau détaillé */}
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-right p-4 font-medium">Total</th>
                  <th className="text-right p-4 font-medium">0-30j</th>
                  <th className="text-right p-4 font-medium">30-60j</th>
                  <th className="text-right p-4 font-medium">60-90j</th>
                  <th className="text-right p-4 font-medium">+90j</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.party}</td>
                    <td className="p-4 text-right font-mono">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-700">
                      {formatCurrency(item.current)}
                    </td>
                    <td className="p-4 text-right font-mono text-blue-700">
                      {formatCurrency(item.days30_60)}
                    </td>
                    <td className="p-4 text-right font-mono text-amber-700">
                      {formatCurrency(item.days60_90)}
                    </td>
                    <td className="p-4 text-right font-mono text-rose-700">
                      {formatCurrency(item.over90)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <td className="p-4 font-bold">Total</td>
                  <td className="p-4 text-right font-bold font-mono">
                    {formatCurrency(data.totals.total)}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-emerald-700">
                    {formatCurrency(data.totals.current)}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-blue-700">
                    {formatCurrency(data.totals.days30_60)}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-amber-700">
                    {formatCurrency(data.totals.days60_90)}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-rose-700">
                    {formatCurrency(data.totals.over90)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            BMS - Démonstration (Version Simple)
          </h1>
          <p className="text-gray-600">
            Mode démonstration avec données exemples - Sans dépendances externes
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Dashboard Comptable
        </button>
        <button
          onClick={() => setActiveTab('mobile-money')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'mobile-money'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-4 h-4 inline mr-2" />
          Mobile Money
        </button>
        <button
          onClick={() => setActiveTab('aged-balance')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'aged-balance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Balance Âgée
        </button>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'mobile-money' && renderMobileMoney()}
      {activeTab === 'aged-balance' && renderAgedBalance()}

      {/* Footer demo info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-900">Mode Démonstration Simplifié</p>
            <p className="text-sm text-emerald-700">
              Version sans dépendances externes - fonctionne immédiatement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
