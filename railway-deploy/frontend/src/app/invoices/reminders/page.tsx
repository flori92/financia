"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { BellRing, Loader2, Mail, PhoneCall, AlertTriangle, CheckCircle2, Eye, Send } from "lucide-react";
import { ReminderPreviewModal } from "@/components/invoices/reminder-preview-modal";

type ReminderSeverity = "critical" | "warning" | "info";

type ReminderItem = {
  party: string;
  total: number;
  over90: number;
  daysLate: number;
  oldestDate: string;
  customerEmail?: string;
  customerPhone?: string;
  customerWhatsApp?: string;
  invoiceIds?: string[];
};

type ReminderPreview = {
  invoice: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerWhatsApp?: string;
  level: 'gentle' | 'firm' | 'formal' | 'legal';
  daysOverdue: number;
  amount: number;
  penalty: number;
  totalDue: number;
  subject: string;
  emailMessage: string;
  smsMessage?: string;
  whatsappMessage?: string;
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
  const [selectedReminder, setSelectedReminder] = useState<ReminderPreview | null>(null);
  const [sendingAction, setSendingAction] = useState<string | null>(null);
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());

  const loadReminders = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setError("ID d'entreprise non trouvé");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Récupérer les données depuis la balance âgée
      const aged = await apiGet("/api/v1/accounting/aged-balance", {
        companyId,
        type: "receivables",
      });
      
      if (Array.isArray(aged?.items) && aged.items.length) {
        const rawItems = aged.items;
        const mapped: ReminderItem[] = rawItems
          .map((item: {
            party?: string;
            customerName?: string;
            total?: number;
            over90?: number;
            daysOverdue?: number;
            daysLate?: number;
            oldestDate?: string;
            firstDueDate?: string;
            customerEmail?: string;
            customerPhone?: string;
            customerWhatsApp?: string;
          }) => ({
            party: item.party || item.customerName || "Client",
            total: Number(item.total || 0),
            over90: Number(item.over90 || 0),
            daysLate: Number(item.daysOverdue ?? item.daysLate ?? 0),
            oldestDate: item.oldestDate || item.firstDueDate || new Date().toISOString().slice(0, 10),
            customerEmail: item.customerEmail || `${item.party?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            customerPhone: item.customerPhone || "+22900000000",
            customerWhatsApp: item.customerWhatsApp || item.customerPhone || "+22900000000",
          }))
          .filter((entry: ReminderItem) => entry.total > 0);
        setReminders(mapped);
      } else {
        setReminders([]);
      }
    } catch (err) {
      console.error("loadReminders", err);
      setError("Impossible de récupérer les relances");
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
    const totalOver90 = reminders.reduce((sum, item) => sum + (item.over90 || 0), 0);
    const critical = reminders.filter((item) => severity(item.over90 || item.total, item.daysLate) === "critical").length;
    return { totalAmount, totalOver90, critical };
  }, [reminders]);

  const generateReminderPreview = (item: ReminderItem): ReminderPreview => {
    let level: 'gentle' | 'firm' | 'formal' | 'legal' = 'gentle';
    if (item.daysLate > 45) level = 'legal';
    else if (item.daysLate > 30) level = 'formal';
    else if (item.daysLate > 15) level = 'firm';

    const penalty = Math.round(item.total * 0.0004 * item.daysLate + 40);
    const totalDue = item.total + penalty;

    const invoiceUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://app.bms.com'}/invoices/${item.party}`;

    let subject = '';
    let message = '';

    switch (level) {
      case 'gentle':
        subject = `⏰ Rappel amiable - Facture en retard`;
        message = `Bonjour ${item.party},

Ceci est un rappel amical concernant votre facture :

📄 Facture : Multiple factures
💰 Montant : ${item.total.toLocaleString()} FCFA
📅 Échéance la plus ancienne : ${new Date(item.oldestDate).toLocaleDateString('fr-FR')}
⏰ En retard de : ${item.daysLate} jour(s)

Vous pouvez consulter et payer vos factures ici : ${invoiceUrl}

Merci pour votre confiance !

Cordialement,
L'équipe BMS`;
        break;

      case 'firm':
        subject = `🔔 Rappel - Factures en retard de paiement`;
        message = `Bonjour ${item.party},

Vos factures sont en retard de paiement :

📄 Factures : Multiple factures
💰 Montant : ${item.total.toLocaleString()} FCFA
📅 Échéance la plus ancienne : ${new Date(item.oldestDate).toLocaleDateString('fr-FR')}
⏰ En retard de : ${item.daysLate} jour(s)

Merci de régulariser votre situation rapidement.

Consultez vos factures : ${invoiceUrl}

Cordialement,
Service comptabilité BMS`;
        break;

      case 'formal':
        subject = `🚨 DEMANDE DE PAIEMENT - Factures en retard`;
        message = `Madame, Monsieur ${item.party},

Nous vous informons que vos factures présentent un retard important :

📄 Factures : Multiple factures
💰 Montant dû : ${item.total.toLocaleString()} FCFA
📅 Date d'échéance la plus ancienne : ${new Date(item.oldestDate).toLocaleDateString('fr-FR')}
⏰ Retard : ${item.daysLate} jour(s)
💸 Pénalités de retard : ${penalty.toLocaleString()} FCFA

Nous vous demandons de procéder au règlement dans les plus brefs délais pour éviter toute procédure de recouvrement supplémentaire.

Factures détaillées : ${invoiceUrl}

Service recouvrement BMS`;
        break;

      case 'legal':
        subject = `⚖️ MISE EN DEMEURE - Factures impayées`;
        message = `Madame, Monsieur ${item.party},

MALGRÉ NOS RELANCES

Nous vous mettons en demeure de régler votre dette :

📄 Factures : Multiple factures
💰 Montant principal : ${item.total.toLocaleString()} FCFA
💸 Pénalités de retard : ${penalty.toLocaleString()} FCFA
💰 TOTAL DÛ : ${totalDue.toLocaleString()} FCFA
📅 Échéance la plus ancienne : ${new Date(item.oldestDate).toLocaleDateString('fr-FR')}
⏰ Retard : ${item.daysLate} jour(s)

À défaut de paiement sous 8 jours, nous saisirons les tribunaux compétents.

Factures : ${invoiceUrl}

Service contentieux BMS`;
        break;
    }

    const smsMessage = `${subject} - Montant : ${item.total.toLocaleString()} FCFA - Retard : ${item.daysLate}j - ${invoiceUrl}`;
    const whatsappMessage = `${subject}\n\n${message.split('\n').slice(0, 8).join('\n')}\n\n📱 ${invoiceUrl}`;

    return {
      invoice: "Multiple factures",
      customerName: item.party,
      customerEmail: item.customerEmail,
      customerPhone: item.customerPhone,
      customerWhatsApp: item.customerWhatsApp,
      level,
      daysOverdue: item.daysLate,
      amount: item.total,
      penalty,
      totalDue,
      subject,
      emailMessage: message,
      smsMessage,
      whatsappMessage,
    };
  };

  const handlePreviewReminder = (item: ReminderItem) => {
    const preview = generateReminderPreview(item);
    setSelectedReminder(preview);
  };

  const handleSendReminder = async (type: 'email' | 'sms' | 'whatsapp' | 'call') => {
    if (!selectedReminder) return;

    setSendingAction(type);
    try {
      // Simuler l'envoi (à remplacer par de vrais appels API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Marquer comme envoyé
      setSentReminders(prev => new Set(prev).add(selectedReminder.customerName));
      
      // Retirer de la liste des relances en attente
      setReminders(prev => prev.filter(item => item.party !== selectedReminder.customerName));
      
      setSelectedReminder(null);
      
      // Afficher un message de succès
      alert(`Relance ${type} envoyée avec succès à ${selectedReminder.customerName}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi de la relance');
    } finally {
      setSendingAction(null);
    }
  };

  const handleQuickAction = (item: ReminderItem, action: 'email' | 'call') => {
    const preview = generateReminderPreview(item);
    setSelectedReminder(preview);
  };

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
              const isSent = sentReminders.has(item.party);
              
              if (isSent) return null; // Ne pas afficher les relances déjà envoyées
              
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
                        onClick={() => handlePreviewReminder(item)}
                        disabled={processing === item.party}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Eye className="w-3 h-3" /> Aperçu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAction(item, "email")}
                        disabled={processing === item.party}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Mail className="w-3 h-3" /> Email
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAction(item, "call")}
                        disabled={processing === item.party}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <PhoneCall className="w-3 h-3" /> Appel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de prévisualisation */}
      <ReminderPreviewModal
        reminder={selectedReminder}
        onClose={() => setSelectedReminder(null)}
        onSend={handleSendReminder}
        sending={sendingAction !== null}
      />
    </div>
  );
}
