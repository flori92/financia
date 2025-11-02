"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  Eye
} from "lucide-react";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { 
  demoDashboardData, 
  demoMobileMoneyData, 
  demoAgedBalanceData 
} from "@/lib/demo-data";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mobile-money' | 'aged-balance'>('dashboard');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Détecter si on est en mode démo (pas de données réelles)
    setIsDemo(true);
  }, []);

  const getStatusBadge = (type: string) => {
    const badges = {
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-rose-100 text-rose-800",
      info: "bg-blue-100 text-blue-800",
    };

    const colors = {
      success: "text-emerald-600",
      warning: "text-amber-600",
      danger: "text-rose-600",
      info: "text-blue-600",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges]}`}>
        {type}
      </span>
    );
  };

  const renderDashboard = () => {
    const data = demoDashboardData;

    return (
      <div className="space-y-6">
        {/* Alertes */}
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
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
                  {formatCurrency(data.kpiMonth.revenue, 'XOF')}
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
                  {formatCurrency(data.kpiMonth.expenses, 'XOF')}
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
                  {formatCurrency(data.kpiMonth.netIncome, 'XOF')}
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
                  {data.kpiMonth.margin.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-700 mt-1">Excellente</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Graphique évolution */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">Évolution CA vs Charges (12 mois)</h3>
          <div className="h-64 flex items-end gap-2">
            {data.evolutionChart.map((item, index) => {
              const maxVal = Math.max(...data.evolutionChart.map(d => Math.max(d.revenue, d.expenses)));
              const revenueHeight = (item.revenue / maxVal) * 100;
              const expensesHeight = (item.expenses / maxVal) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
                    <div 
                      className="flex-1 bg-blue-500 rounded-t" 
                      style={{ height: `${revenueHeight}%` }}
                      title={`CA: ${formatCurrency(item.revenue, 'XOF')}`}
                    />
                    <div 
                      className="flex-1 bg-orange-500 rounded-t" 
                      style={{ height: `${expensesHeight}%` }}
                      title={`Charges: ${formatCurrency(item.expenses, 'XOF')}`}
                    />
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{item.month}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">CA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Charges</span>
            </div>
          </div>
        </div>

        {/* Top Clients et Fournisseurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Top 5 Clients
            </h3>
            <div className="space-y-2">
              {data.topClients.map((client, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-emerald-700 font-mono">
                    {formatCurrency(client.amount, 'XOF')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              Top 5 Fournisseurs
            </h3>
            <div className="space-y-2">
              {data.topSuppliers.map((supplier, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{supplier.name}</span>
                  <span className="text-orange-700 font-mono">
                    {formatCurrency(supplier.amount, 'XOF')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">5 dernières écritures</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-right p-2 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.entries.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 text-sm">{entry.date}</td>
                    <td className="p-2">{entry.description}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                        {entry.type}
                      </span>
                    </td>
                    <td className={`p-2 text-right font-mono ${
                      entry.amount > 0 ? 'text-emerald-700' : 'text-orange-700'
                    }`}>
                      {formatCurrency(Math.abs(entry.amount), 'XOF')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileMoney = () => {
    const data = demoMobileMoneyData;

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total transactions</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.stats.totalAmount, 'XOF')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Succès</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.successful}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-amber-600">{data.stats.pending}</p>
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
                  <th className="text-left p-4 font-medium">Transaction</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Provider</th>
                  <th className="text-left p-4 font-medium">Montant</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{transaction.txRef}</p>
                        <p className="text-sm text-gray-600">{transaction.invoice?.invoiceNumber}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{transaction.customerName}</p>
                        <p className="text-sm text-gray-600">{transaction.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-medium">{transaction.provider}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">
                        {formatCurrency(transaction.amount, 'XOF')}
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
  };

  const renderAgedBalance = () => {
    const data = demoAgedBalanceData;
    const [activeType, setActiveType] = useState<'receivables' | 'payables'>('receivables');
    const currentData = data[activeType];

    const getPercentage = (part: number, total: number) => {
      if (total === 0) return 0;
      return ((part / total) * 100).toFixed(1);
    };

    return (
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveType('receivables')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeType === 'receivables'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Créances Clients
          </button>
          <button
            onClick={() => setActiveType('payables')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeType === 'payables'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Dettes Fournisseurs
          </button>
        </div>

        {/* Répartition */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg border">
            <p className="text-sm text-emerald-600 font-medium">0-30 jours</p>
            <p className="text-lg font-bold text-emerald-900">
              {formatCurrency(currentData.totals.current, 'XOF')}
            </p>
            <p className="text-xs text-emerald-700">
              {getPercentage(currentData.totals.current, currentData.totals.total)}%
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border">
            <p className="text-sm text-blue-600 font-medium">30-60 jours</p>
            <p className="text-lg font-bold text-blue-900">
              {formatCurrency(currentData.totals.days30_60, 'XOF')}
            </p>
            <p className="text-xs text-blue-700">
              {getPercentage(currentData.totals.days30_60, currentData.totals.total)}%
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border">
            <p className="text-sm text-amber-600 font-medium">60-90 jours</p>
            <p className="text-lg font-bold text-amber-900">
              {formatCurrency(currentData.totals.days60_90, 'XOF')}
            </p>
            <p className="text-xs text-amber-700">
              {getPercentage(currentData.totals.days60_90, currentData.totals.total)}%
            </p>
          </div>

          <div className="bg-rose-50 p-4 rounded-lg border">
            <p className="text-sm text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              +90 jours
            </p>
            <p className="text-lg font-bold text-rose-900">
              {formatCurrency(currentData.totals.over90, 'XOF')}
            </p>
            <p className="text-xs text-rose-700">
              {getPercentage(currentData.totals.over90, currentData.totals.total)}%
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg border">
            <p className="text-sm text-slate-600 font-medium">Total</p>
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(currentData.totals.total, 'XOF')}
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
                  <th className="text-left p-4 font-medium">
                    {activeType === 'receivables' ? 'Client' : 'Fournisseur'}
                  </th>
                  <th className="text-right p-4 font-medium">Total</th>
                  <th className="text-right p-4 font-medium">0-30j</th>
                  <th className="text-right p-4 font-medium">30-60j</th>
                  <th className="text-right p-4 font-medium">60-90j</th>
                  <th className="text-right p-4 font-medium">+90j</th>
                  <th className="text-left p-4 font-medium">Plus ancienne</th>
                </tr>
              </thead>
              <tbody>
                {currentData.items.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.party}</td>
                    <td className="p-4 text-right font-mono">
                      {formatCurrency(item.total, 'XOF')}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-700">
                      {formatCurrency(item.current, 'XOF')}
                    </td>
                    <td className="p-4 text-right font-mono text-blue-700">
                      {formatCurrency(item.days30_60, 'XOF')}
                    </td>
                    <td className="p-4 text-right font-mono text-amber-700">
                      {formatCurrency(item.days60_90, 'XOF')}
                    </td>
                    <td className="p-4 text-right font-mono text-rose-700">
                      {formatCurrency(item.over90, 'XOF')}
                    </td>
                    <td className="p-4 text-sm">{item.oldestDate}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <td className="p-4 font-bold">Total</td>
                  <td className="p-4 text-right font-bold font-mono">
                    {formatCurrency(currentData.totals.total, 'XOF')}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-emerald-700">
                    {formatCurrency(currentData.totals.current, 'XOF')}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-blue-700">
                    {formatCurrency(currentData.totals.days30_60, 'XOF')}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-amber-700">
                    {formatCurrency(currentData.totals.days60_90, 'XOF')}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-rose-700">
                    {formatCurrency(currentData.totals.over90, 'XOF')}
                  </td>
                  <td className="p-4"></td>
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
            BMS - Démonstration
          </h1>
          <p className="text-gray-600">
            {isDemo ? "Mode démonstration avec données exemples" : "Données réelles"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              🎭 Mode Démo
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
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
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Mode Démonstration</p>
              <p className="text-sm text-amber-700">
                Ceci est une démonstration avec données exemples. Pour utiliser des données réelles, 
                configurez la base de données et exécutez les scripts de seed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
