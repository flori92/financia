"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { 
  BellRing, Loader2, Mail, PhoneCall, AlertTriangle, CheckCircle2, 
  Calendar, TrendingUp, Clock, FileText, Send, History, Filter
} from "lucide-react";

type ReminderSeverity = "critical" | "warning" | "info";

type ReminderItem = {
  party: string;
  total: number;
  current: number;
  days30_60: number;
  days60_90: number;
  over90: number;
  daysLate: number;
  oldestDate: string;
  lastReminderDate?: string;
  reminderCount?: number;
};

type ReminderHistory = {
  id: string;
  party: string;
  date: string;
  type: "email" | "call" | "sms";
  status: "sent" | "pending" | "failed";
  amount: number;
};

type RawAgedBalanceItem = {
  party?: string;
  customerName?: string;
  total?: number;
  current?: number;
  days30_60?: number;
  days60_90?: number;
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getDaysLate(oldestDate: string): number {
  const today = new Date();
  const oldest = new Date(oldestDate);
  const diffTime = Math.abs(today.getTime() - oldest.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [history, setHistory] = useState<ReminderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReminderSeverity | "all">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReminders = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setError("Aucune société sélectionnée. Veuillez vous connecter.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const aged = await apiGet("/api/v1/accounting/aged-balance", {
        companyId,
        type: "receivables",
        asOfDate: today,
      });
      
      console.log("[Reminders] Données reçues:", aged);
      
      if (aged && aged.items && Array.isArray(aged.items) && aged.items.length > 0) {
        const rawItems = aged.items as RawAgedBalanceItem[];
        const mapped: ReminderItem[] = rawItems
          .map((item) => {
            const oldestDate = item.oldestDate || item.firstDueDate || today;
            const daysLate = getDaysLate(oldestDate);
            
            return {
              party: item.party || item.customerName || "Client inconnu",
              total: Number(item.total || 0),
              current: Number(item.current || 0),
              days30_60: Number(item.days30_60 || 0),
              days60_90: Number(item.days60_90 || 0),
              over90: Number(item.over90 || 0),
              daysLate: daysLate,
              oldestDate: oldestDate,
            };
          })
          .filter((entry) => entry.total > 0 && entry.daysLate > 0); // Seulement les créances en retard
        
        console.log("[Reminders] Créances en retard:", mapped);
        setReminders(mapped);
        
        if (mapped.length === 0) {
          setError("Aucune créance en retard trouvée. Excellent travail ! 🎉");
        }
      } else {
        console.log("[Reminders] Aucune donnée reçue");
        setError("Aucune créance trouvée. Initialisez le plan comptable et créez des écritures.");
        setReminders([]);
      }
    } catch (err: any) {
      console.error("[Reminders] Erreur:", err);
      setError(err.message || "Erreur lors du chargement des créances");
      setReminders([]);
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
    const totalCurrent = reminders.reduce((sum, item) => sum + (item.current || 0), 0);
    const total30_60 = reminders.reduce((sum, item) => sum + (item.days30_60 || 0), 0);
    const total60_90 = reminders.reduce((sum, item) => sum + (item.days60_90 || 0), 0);
    const totalOver90 = reminders.reduce((sum, item) => sum + (item.over90 || 0), 0);
    const critical = reminders.filter((item) => severity(item.over90 || item.total, item.daysLate) === "critical").length;
    const warning = reminders.filter((item) => severity(item.over90 || item.total, item.daysLate) === "warning").length;
    const avgDaysLate = reminders.length > 0 
      ? Math.round(reminders.reduce((sum, item) => sum + item.daysLate, 0) / reminders.length)
      : 0;
    
    return { 
      totalAmount, 
      totalCurrent,
      total30_60,
      total60_90,
      totalOver90, 
      critical, 
      warning,
      avgDaysLate,
      count: reminders.length 
    };
  }, [reminders]);

  const sendReminder = async (party: string, type: "email" | "call" | "sms", amount: number) => {
    setProcessing(party);
    try {
      const companyId = getCompanyId();
      
      // Simuler l'envoi de la relance
      // TODO: Implémenter l'endpoint backend pour enregistrer les relances
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ajouter à l'historique
      const newHistory: ReminderHistory = {
        id: Date.now().toString(),
        party,
        date: new Date().toISOString(),
        type,
        status: "sent",
        amount,
      };
      
      setHistory(prev => [newHistory, ...prev]);
      
      // Mettre à jour le compteur de relances
      setReminders(prev => prev.map(item => 
        item.party === party 
          ? { ...item, lastReminderDate: new Date().toISOString(), reminderCount: (item.reminderCount || 0) + 1 }
          : item
      ));
      
      triggerToast("success", `Relance ${type === "email" ? "email" : type === "call" ? "téléphonique" : "SMS"} envoyée à ${party}`);
    } catch (err: any) {
      console.error("Erreur envoi relance:", err);
      triggerToast("error", "Erreur lors de l'envoi de la relance");
    } finally {
      setProcessing(null);
    }
  };

  const markAsPaid = async (party: string) => {
    setProcessing(party);
    try {
      // TODO: Implémenter l'endpoint backend pour marquer comme payé
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReminders(prev => prev.filter(item => item.party !== party));
      triggerToast("success", `Créance de ${party} marquée comme réglée`);
    } catch (err: any) {
      console.error("Erreur marquage payé:", err);
      triggerToast("error", "Erreur lors du marquage");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relances clients</h1>
          <p className="text-gray-600 mt-1">Gestion proactive des créances et campagnes de relance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <History className="w-4 h-4" />
            Historique ({history.length})
          </button>
          <button
            type="button"
            onClick={loadReminders}
            disabled={loading}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
          error.includes("Excellent") || error.includes("Aucune créance en retard")
            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
            : "text-amber-700 bg-amber-50 border border-amber-200"
        }`}>
          {error.includes("Excellent") || error.includes("Aucune créance en retard") 
            ? <CheckCircle2 className="w-4 h-4" />
            : <AlertTriangle className="w-4 h-4" />
          }
          {error}
        </div>
      )}

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-500">Total à recouvrer</div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totals.totalAmount)}</div>
          <div className="text-xs text-slate-500 mt-1">{totals.count} client{totals.count > 1 ? "s" : ""}</div>
        </div>
        
        <div className="bg-white border border-rose-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-rose-600">Retard &gt; 90 jours</div>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{formatCurrency(totals.totalOver90)}</div>
          <div className="text-xs text-rose-600 mt-1">{totals.critical} critique{totals.critical > 1 ? "s" : ""}</div>
        </div>
        
        <div className="bg-white border border-amber-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-amber-600">Retard 60-90 jours</div>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(totals.total60_90)}</div>
          <div className="text-xs text-amber-600 mt-1">{totals.warning} à surveiller</div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-500">Retard moyen</div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totals.avgDaysLate}</div>
          <div className="text-xs text-slate-500 mt-1">jours</div>
        </div>
      </div>

      {/* Historique des relances */}
      {showHistory && history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des relances</h3>
          <div className="space-y-2">
            {history.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  {item.type === "email" ? <Mail className="w-4 h-4 text-blue-500" /> :
                   item.type === "call" ? <PhoneCall className="w-4 h-4 text-green-500" /> :
                   <Send className="w-4 h-4 text-purple-500" />}
                  <div>
                    <div className="text-sm font-medium">{item.party}</div>
                    <div className="text-xs text-slate-500">{formatDate(item.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(item.amount)}</div>
                  <div className={`text-xs ${
                    item.status === "sent" ? "text-green-600" :
                    item.status === "pending" ? "text-amber-600" :
                    "text-red-600"
                  }`}>
                    {item.status === "sent" ? "Envoyé" :
                     item.status === "pending" ? "En attente" :
                     "Échec"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
