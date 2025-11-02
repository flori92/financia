"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { BellRing, Loader2, Mail, PhoneCall, AlertTriangle, CheckCircle2 } from "lucide-react";

type ReminderSeverity = "critical" | "warning" | "info";

type ReminderItem = {
  party: string;
  total: number;
  over90: number;
  daysLate: number;
  oldestDate: string;
};

const fallbackReminders: ReminderItem[] = [
  {
    party: "SARL Martin",
    total: 520000,
    over90: 520000,
    daysLate: 112,
    oldestDate: "2024-09-30",
  },
  {
    party: "Digital Agency Pro",
    total: 285000,
    over90: 180000,
    daysLate: 76,
    oldestDate: "2024-11-15",
  },
  {
    party: "Logistique Express",
    total: 190000,
    over90: 0,
    daysLate: 48,
    oldestDate: "2024-12-10",
  },
];

type RawAgedBalanceItem = {
  party?: string;
  customerName?: string;
  total?: number;
  over90?: number;
  daysOverdue?: number;
  daysLate?: number;
  oldestDate?: string;
  firstDueDate?: string;
};

function severity(amount: number, daysLate: number): ReminderSeverity {
  if (amount >= 500000 || daysLate >= 90) return "critical";
  if (amount >= 200000 || daysLate >= 60) return "warning";
  return "info";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReminderSeverity | "all">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const loadReminders = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setReminders(fallbackReminders);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const aged = await apiGet("/api/v1/accounting/aged-balance", {
        companyId,
        type: "receivables",
      });
      if (Array.isArray(aged?.items) && aged.items.length) {
        const rawItems = aged.items as RawAgedBalanceItem[];
        const mapped: ReminderItem[] = rawItems
          .map((item) => ({
            party: item.party || item.customerName || "Client",
            total: Number(item.total || 0),
            over90: Number(item.over90 || 0),
            daysLate: Number(item.daysOverdue ?? item.daysLate ?? 0),
            oldestDate: item.oldestDate || item.firstDueDate || new Date().toISOString().slice(0, 10),
          }))
          .filter((entry) => entry.total > 0);
        setReminders(mapped.length ? mapped : fallbackReminders);
      } else {
        setReminders(fallbackReminders);
      }
    } catch (err) {
      console.error("loadReminders", err);
      setError("Impossible de récupérer les relances (affichage des données de démonstration).");
      setReminders(fallbackReminders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const filteredReminders = useMemo(() => {
    if (filter === "all") return reminders;
    return reminders.filter((item) => severity(item.over90 || item.total, item.daysLate) === filter);
  }, [reminders, filter]);

  const totals = useMemo(() => {
    const totalAmount = reminders.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalOver90 = reminders.reduce((sum, item) => sum + (item.over90 || 0), 0);
    const critical = reminders.filter((item) => severity(item.over90 || item.total, item.daysLate) === "critical").length;
    return { totalAmount, totalOver90, critical };
  }, [reminders]);

  function markAsDone(party: string) {
    setProcessing(party);
    setTimeout(() => {
      setReminders((prev) => prev.filter((item) => item.party !== party));
      setProcessing(null);
    }, 700);
  }

  function quickAction(party: string, action: "email" | "call") {
    console.info(`Action relance ${action} pour ${party}`);
    markAsDone(party);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relances clients</h1>
          <p className="text-gray-600 mt-1">Gestion proactive des créances et campagnes de relance</p>
        </div>
        <button
          type="button"
          onClick={loadReminders}
          className="text-sm px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Montant total à relancer</div>
          <div className="text-xl font-semibold text-slate-900">{formatCurrency(totals.totalAmount)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Montant &gt; 90 jours</div>
          <div className="text-xl font-semibold text-rose-700">{formatCurrency(totals.totalOver90)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Relances critiques</div>
          <div className="text-xl font-semibold text-rose-700">{totals.critical}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Filtrer :</span>
            <div className="flex items-center gap-2">
              {(["all", "critical", "warning", "info"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    filter === option
                      ? "bg-[#0D9488] border-[#0D9488] text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option === "all"
                    ? "Toutes"
                    : option === "critical"
                    ? "Critiques"
                    : option === "warning"
                    ? "A surveiller"
                    : "Toujours en attente"}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Données calculées depuis la balance âgée clients (classe 411)
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
            Analyse des créances…
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <BellRing className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucune relance en attente selon le filtre sélectionné</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((item) => {
              const tone = severity(item.over90 || item.total, item.daysLate);
              return (
                <div
                  key={item.party}
                  className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    tone === "critical"
                      ? "border-rose-200 bg-rose-50"
                      : tone === "warning"
                      ? "border-amber-200 bg-amber-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.party}</h3>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      <span>Échéance la plus ancienne : {new Date(item.oldestDate).toLocaleDateString("fr-FR")}</span>
                      <span>•</span>
                      <span>{item.daysLate} jours de retard</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Montant dû</div>
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(item.total)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">&gt; 90 jours</div>
                      <div className="text-sm font-semibold text-rose-700">{formatCurrency(item.over90)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => quickAction(item.party, "email")}
                        disabled={processing === item.party}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Mail className="w-3 h-3" /> Email
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAction(item.party, "call")}
                        disabled={processing === item.party}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <PhoneCall className="w-3 h-3" /> Appel
                      </button>
                      <button
                        type="button"
                        onClick={() => markAsDone(item.party)}
                        disabled={processing === item.party}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D9488] text-white text-xs font-medium hover:bg-[#0B7C74] disabled:opacity-60"
                      >
                        {processing === item.party ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Relancé
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
