"use client";
import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle, Download, Loader2, AlertCircle } from "lucide-react";
import { apiGet, getCompanyId } from "@/lib/api";

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  currency: string;
  connectionStatus?: string;
}

interface ForecastItem {
  date: string;
  expectedInflow: number;
  expectedOutflow: number;
  projectedBalance: number;
}

interface TreasuryAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  createdAt: string;
}

interface TreasuryDashboard {
  totalCash: number;
  accounts: BankAccount[];
  weeklyInflow: number;
  weeklyOutflow: number;
  runway?: number;
}

export default function TreasuryPage() {
  const [dashboard, setDashboard] = useState<TreasuryDashboard | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [alerts, setAlerts] = useState<TreasuryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTreasuryData();
  }, []);

  const loadTreasuryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      // Load all treasury data in parallel
      const [dashboardData, forecastData, alertsData] = await Promise.all([
        apiGet("/api/v1/treasury/dashboard", { companyId }),
        apiGet("/api/v1/treasury/forecast", { companyId }),
        apiGet("/api/v1/treasury/alerts", { companyId }).catch(() => ({ alerts: [] })) // Alerts are optional
      ]);

      setDashboard(dashboardData);
      setForecast(forecastData.forecast || forecastData || []);
      setAlerts(alertsData.alerts || alertsData || []);
    } catch (err: any) {
      console.debug("Erreur chargement trésorerie:", err);
      setError(err.message || "Erreur lors du chargement des données de trésorerie");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Erreur</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadTreasuryData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trésorerie</h1>
          <p className="text-gray-600">Gestion multi-banques et prévisionnel de trésorerie</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Download className="w-4 h-4" />
            Export SEPA
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
            <Plus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200"
                  : alert.severity === "warning"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${
                  alert.severity === "critical"
                    ? "text-red-600"
                    : alert.severity === "warning"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              />
              <div>
                <span className="font-medium">{alert.type}:</span> {alert.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs Trésorerie */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#0D9488]" />
            <div>
              <div className="text-sm text-gray-600">Trésorerie totale</div>
              <div className="text-2xl font-semibold">
                {new Intl.NumberFormat("fr-FR").format(dashboard.totalCash)} FCFA
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Entrées prévues (7j)</div>
              <div className="text-2xl font-semibold text-green-600">
                {new Intl.NumberFormat("fr-FR").format(dashboard.weeklyInflow)} FCFA
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-sm text-gray-600">Sorties prévues (7j)</div>
              <div className="text-2xl font-semibold text-red-600">
                {new Intl.NumberFormat("fr-FR").format(dashboard.weeklyOutflow)} FCFA
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-gray-600">Runway</div>
              <div className="text-2xl font-semibold text-orange-600">
                {dashboard.runway ? `${dashboard.runway} jours` : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comptes bancaires */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Comptes bancaires</h2>
        <div className="space-y-4">
          {dashboard.accounts && dashboard.accounts.length > 0 ? (
            dashboard.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0D9488] rounded-lg flex items-center justify-center text-white font-semibold">
                    {account.bankName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{account.accountName}</div>
                    <div className="text-sm text-gray-600">
                      {account.bankName} - {account.accountNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {new Intl.NumberFormat("fr-FR").format(account.currentBalance)} {account.currency}
                  </div>
                  <div className={`text-sm ${account.connectionStatus === 'connected' ? 'text-green-600' : 'text-orange-600'}`}>
                    {account.connectionStatus === 'connected' ? 'Connecté' : 'Manuel'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">Aucun compte bancaire configuré</p>
          )}
        </div>
      </div>

      {/* Prévisionnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Prévisionnel de trésorerie</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Entrées</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Sorties</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde prévisionnel</th>
              </tr>
            </thead>
            <tbody>
              {forecast && forecast.length > 0 ? (
                forecast.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4">{new Date(item.date).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      +{new Intl.NumberFormat("fr-FR").format(item.expectedInflow)} FCFA
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      -{new Intl.NumberFormat("fr-FR").format(item.expectedOutflow)} FCFA
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {new Intl.NumberFormat("fr-FR").format(item.projectedBalance)} FCFA
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Aucune prévision disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}