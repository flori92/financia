"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BellRing, SlidersHorizontal, AlertCircle, Info, FileText } from "lucide-react";
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

type AlertData = {
  alerts: Array<{
    level: "danger" | "warning" | "info";
    title?: string;
    message: string;
  }>;
  metrics: {
    runway?: number;
    net?: number;
    last90Net?: number;
    last30In?: number;
    last30Out?: number;
  };
};

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlerts = async () => {
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      try {
        // Charger les alertes comptables (écritures en attente, etc.)
        const accountingData = await apiGet("/api/v1/accounting/dashboard/metrics", { companyId });
        
        // Charger aussi les alertes trésorerie si disponibles
        let treasuryData = null;
        try {
          treasuryData = await apiGet("/api/v1/treasury/alerts", { companyId });
        } catch (e) {
          // Ignorer si l'API trésorerie n'est pas disponible
        }
        
        // Combiner les alertes
        const combinedAlerts = [
          ...(accountingData?.alerts || []),
          ...(treasuryData?.alerts || [])
        ];
        
        setAlertData({
          alerts: combinedAlerts,
          metrics: {
            ...treasuryData,
            ...accountingData
          }
        });
      } catch (err: any) {
        setError(err?.message || "Impossible de charger les alertes");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "danger":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case "danger":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "info":
      default:
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alertes intelligentes</h1>
          <p className="text-gray-600 mt-1">Notifications et seuils personnalisés</p>
        </div>
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alertes intelligentes</h1>
          <p className="text-gray-600 mt-1">Notifications et seuils personnalisés</p>
        </div>
        <div className="bg-white rounded-xl border p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-semibold text-gray-700">Erreur de chargement</p>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const hasAlerts = alertData?.alerts && alertData.alerts.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes intelligentes</h1>
        <p className="text-gray-600 mt-1">Notifications et seuils personnalisés</p>
      </div>

      {/* Métriques actuelles */}
      {alertData?.metrics && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">État actuel de la trésorerie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Runway</p>
              <p className={`text-xl font-bold ${alertData.metrics.runway && alertData.metrics.runway < 0 ? 'text-red-600' : alertData.metrics.runway && alertData.metrics.runway < 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                {alertData.metrics.runway !== undefined ? `${alertData.metrics.runway} jours` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Net (90j)</p>
              <p className={`text-xl font-bold ${alertData.metrics.last90Net && alertData.metrics.last90Net < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {alertData.metrics.last90Net !== undefined ? `${Math.abs(alertData.metrics.last90Net).toLocaleString()} XOF` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Entrées (30j)</p>
              <p className="text-xl font-bold text-green-600">
                {alertData.metrics.last30In !== undefined ? `${safeToLocaleString(alertData.metrics.last30In)} XOF` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Sorties (30j)</p>
              <p className="text-xl font-bold text-red-600">
                {alertData.metrics.last30Out !== undefined ? `${safeToLocaleString(alertData.metrics.last30Out)} XOF` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alertes */}
      {hasAlerts ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Alertes actives ({alertData.alerts.length})</h2>
          {alertData.alerts.map((alert, index) => (
            <div key={index} className={`border rounded-lg p-4 flex items-start gap-3 ${getAlertColor(alert.level)}`}>
              {getAlertIcon(alert.level)}
              <div className="flex-1">
                {alert.title && <p className="font-semibold mb-1">{alert.title}</p>}
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold text-gray-700">Aucune alerte active</p>
          <p className="mt-2 text-sm text-gray-500">
            Votre trésorerie est stable. Configurez des seuils pour être prévenu des situations critiques.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/accountant/journal?status=draft"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Voir les écritures en attente
        </Link>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Configurer mes seuils
        </Link>
        <div className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500">
          <BellRing className="h-4 w-4" />
          Documentation en cours de rédaction
        </div>
      </div>
    </div>
  );
}
