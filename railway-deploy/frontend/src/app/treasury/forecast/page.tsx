"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { TrendingUp, AlertTriangle, Loader2, LineChart } from "lucide-react";

type ForecastPoint = {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  scenario?: "base" | "optimistic" | "pessimistic";
};

type Recommendation = {
  title: string;
  description: string;
  impact: "positive" | "neutral" | "negative";
};

const fallbackForecast: ForecastPoint[] = [
  { date: "2025-01-27", inflow: 2200000, outflow: 1500000, balance: 15200000, scenario: "base" },
  { date: "2025-02-03", inflow: 2600000, outflow: 1800000, balance: 16000000, scenario: "base" },
  { date: "2025-02-10", inflow: 2100000, outflow: 2000000, balance: 16100000, scenario: "base" },
  { date: "2025-02-17", inflow: 2800000, outflow: 2300000, balance: 16600000, scenario: "base" },
];

const fallbackRecommendations: Recommendation[] = [
  {
    title: "Relancer les factures > 60 jours",
    description: "Accélérer l'encaissement de 1,2M FCFA pour sécuriser le solde prévisionnel de février.",
    impact: "positive",
  },
  {
    title: "Planifier les décaissements fournisseurs",
    description: "Échelonner les paiements de 900k FCFA pour éviter un solde négatif la semaine du 17 février.",
    impact: "neutral",
  },
  {
    title: "Mettre en place une ligne court-terme",
    description: "Prévoir une facilité de caisse de 5M FCFA pour absorber le scénario pessimiste.",
    impact: "negative",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";
}

export default function TreasuryForecastPage() {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<"7" | "30" | "90">("30");

  const loadForecast = async (selectedHorizon: "7" | "30" | "90") => {
    const companyId = getCompanyId();
    if (!companyId) {
      setForecast(fallbackForecast);
      setRecommendations(fallbackRecommendations);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet("/api/v1/treasury/forecast", {
        companyId,
        horizon: selectedHorizon,
      });
      if (response?.series?.length) {
        setForecast(
          response.series.map((point: any) => ({
            date: point.date,
            inflow: Number(point.inflow || point.cashIn || 0),
            outflow: Number(point.outflow || point.cashOut || 0),
            balance: Number(point.balance || point.projectedBalance || 0),
            scenario: (point.scenario as ForecastPoint["scenario"]) || "base",
          }))
        );
      } else {
        setForecast(fallbackForecast);
      }
      if (Array.isArray(response?.recommendations) && response.recommendations.length) {
        setRecommendations(
          response.recommendations.map((item: any) => ({
            title: item.title || "Recommandation",
            description: item.description || item.detail || "",
            impact: (item.impact as Recommendation["impact"]) || "neutral",
          }))
        );
      } else {
        setRecommendations(fallbackRecommendations);
      }
    } catch (err) {
      console.error("loadForecast", err);
      setError("Impossible de récupérer le prévisionnel (affichage des données de démonstration).");
      setForecast(fallbackForecast);
      setRecommendations(fallbackRecommendations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(horizon);
  }, []);

  const totals = useMemo(() => {
    if (!forecast.length) {
      return { totalInflow: 0, totalOutflow: 0, finalBalance: 0 };
    }
    const totalInflow = forecast.reduce((sum, point) => sum + point.inflow, 0);
    const totalOutflow = forecast.reduce((sum, point) => sum + point.outflow, 0);
    const finalBalance = forecast[forecast.length - 1].balance;
    return { totalInflow, totalOutflow, finalBalance };
  }, [forecast]);

  const worstPoint = useMemo(() => {
    if (!forecast.length) return null;
    return forecast.reduce((min, current) => (current.balance < min.balance ? current : min), forecast[0]);
  }, [forecast]);

  const optimisticDelta = useMemo(() => {
    const optimistic = forecast.filter((point) => point.scenario === "optimistic");
    const base = forecast.filter((point) => point.scenario === "base");
    if (!optimistic.length || !base.length) return null;
    const lastOptimistic = optimistic[optimistic.length - 1];
    const lastBase = base[base.length - 1];
    return lastOptimistic.balance - lastBase.balance;
  }, [forecast]);

  function changeHorizon(value: "7" | "30" | "90") {
    setHorizon(value);
    loadForecast(value);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prévisionnel de trésorerie</h1>
          <p className="text-gray-600 mt-1">Projection des flux de trésorerie et recommandations d'actions</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7", "30", "90"] as Array<"7" | "30" | "90">).map((value) => (
            <button
              key={value}
              onClick={() => changeHorizon(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                horizon === value
                  ? "bg-[#0D9488] border-[#0D9488] text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {value === "7" ? "7 jours" : value === "30" ? "30 jours" : "90 jours"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Entrées cumulées</div>
          <div className="text-xl font-semibold text-emerald-700">{formatCurrency(totals.totalInflow)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Sorties cumulées</div>
          <div className="text-xl font-semibold text-rose-700">{formatCurrency(totals.totalOutflow)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Solde projeté</div>
          <div className="text-xl font-semibold text-slate-900">{formatCurrency(totals.finalBalance)}</div>
          {worstPoint && (
            <div className="text-xs text-slate-500 mt-1">
              Point bas: {formatCurrency(worstPoint.balance)} le {new Date(worstPoint.date).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Scénario optimiste</div>
          <div className="text-xl font-semibold text-slate-900">
            {optimisticDelta !== null ? `${optimisticDelta >= 0 ? "+" : ""}${formatCurrency(optimisticDelta)}` : "N/A"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Écart vs scénario de base</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Projection des flux</h2>
          <button
            type="button"
            onClick={() => loadForecast(horizon)}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded-lg hover:bg-slate-50"
          >
            Actualiser
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
            Calcul du prévisionnel…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 font-medium text-slate-600">Date</th>
                  <th className="py-3 font-medium text-slate-600 text-right">Encaissements</th>
                  <th className="py-3 font-medium text-slate-600 text-right">Décaissements</th>
                  <th className="py-3 font-medium text-slate-600 text-right">Solde prévisionnel</th>
                  <th className="py-3 font-medium text-slate-600">Scénario</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((point) => (
                  <tr key={point.date} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 text-slate-700">{new Date(point.date).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3 text-right text-emerald-700 font-medium">+{formatCurrency(point.inflow)}</td>
                    <td className="py-3 text-right text-rose-700 font-medium">-{formatCurrency(point.outflow)}</td>
                    <td className="py-3 text-right text-slate-900 font-semibold">{formatCurrency(point.balance)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          point.scenario === "optimistic"
                            ? "bg-emerald-100 text-emerald-700"
                            : point.scenario === "pessimistic"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <LineChart className="w-3 h-3" />
                        {point.scenario === "optimistic"
                          ? "Optimiste"
                          : point.scenario === "pessimistic"
                          ? "Pessimiste"
                          : "Base"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommandations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 ${
                item.impact === "positive"
                  ? "border-emerald-200 bg-emerald-50"
                  : item.impact === "negative"
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
