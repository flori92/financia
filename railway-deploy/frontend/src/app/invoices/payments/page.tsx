"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { CreditCard, Loader2, Plus, Download, AlertTriangle } from "lucide-react";

type PaymentStatus = "submitted" | "validated" | "pending" | "failed";

type CustomerPayment = {
  id: string;
  number: string;
  date: string;
  customer: string;
  amount: number;
  method: string;
  status: PaymentStatus;
};

const fallbackPayments: CustomerPayment[] = [
  {
    id: "PAY-001",
    number: "REC-2025-001",
    date: "2025-01-15",
    customer: "Société ABC",
    amount: 2450000,
    method: "virement",
    status: "validated",
  },
  {
    id: "PAY-002",
    number: "REC-2025-002",
    date: "2025-01-20",
    customer: "Tech Solutions",
    amount: 980000,
    method: "mobile money",
    status: "submitted",
  },
  {
    id: "PAY-003",
    number: "REC-2025-003",
    date: "2025-01-23",
    customer: "Agence Marketing",
    amount: 560000,
    method: "espèces",
    status: "pending",
  },
];



function statusBadge(status: PaymentStatus) {
  switch (status) {
    case "validated":
      return { label: "Validé", tone: "bg-emerald-100 text-emerald-700" };
    case "submitted":
      return { label: "Soumis", tone: "bg-blue-100 text-blue-700" };
    case "pending":
      return { label: "En attente", tone: "bg-amber-100 text-amber-700" };
    case "failed":
      return { label: "Échec", tone: "bg-rose-100 text-rose-700" };
    default:
      return { label: status, tone: "bg-slate-100 text-slate-600" };
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    method: "bank_transfer",
    reference: "",
  });

  const loadPayments = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setPayments(fallbackPayments);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await apiGet("/api/v1/payments", { companyId, partyType: "customer" });
      if (Array.isArray(list) && list.length) {
        setPayments(
          list.map((item: any, index: number) => ({
            id: item.id || `PAY-${String(index + 1).padStart(3, "0")}`,
            number: item.paymentNumber || item.reference || `REC-${String(index + 1).padStart(3, "0")}`,
            date: item.paymentDate || item.createdAt || new Date().toISOString().slice(0, 10),
            customer: item.partyName || item.customerName || "Client",
            amount: Number(item.amount || 0),
            method: item.paymentMethod || "virement",
            status: (item.status as PaymentStatus) || "submitted",
          }))
        );
      } else {
        setPayments(fallbackPayments);
      }
    } catch (err) {
      console.error("loadPayments", err);
      setError("Impossible de récupérer les encaissements (affichage des données de démonstration).");
      setPayments(fallbackPayments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    if (!search.trim()) return payments;
    const term = search.toLowerCase();
    return payments.filter((payment) =>
      [payment.customer, payment.number, payment.method]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [payments, search]);

  const summaries = useMemo(() => {
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const validated = payments.filter((payment) => payment.status === "validated").length;
    const pending = payments.filter((payment) => payment.status !== "validated").length;
    return { count: payments.length, totalAmount, validated, pending };
  }, [payments]);

  async function handleCreate() {
    const amountValue = Number(form.amount || 0);
    if (!form.customer.trim() || amountValue <= 0) {
      setError("Merci d'indiquer un client et un montant valide.");
      return;
    }
    setSaving(true);
    setError(null);
    const companyId = getCompanyId();
    try {
      let created: any = null;
      if (companyId) {
        created = await apiPost("/api/v1/payments", {
          companyId,
          paymentDate: form.date,
          amount: amountValue,
          currency: "FCFA",
          paymentMethod: form.method,
          reference: form.reference || undefined,
          partyType: "customer",
          partyName: form.customer,
          autoPostJournal: true,
        });
      }
      const newPayment: CustomerPayment = {
        id: created?.id || `PAY-${String(Date.now()).slice(-5)}`,
        number: created?.paymentNumber || created?.reference || form.reference || "Encaissement",
        date: created?.paymentDate || form.date,
        customer: created?.partyName || form.customer,
        amount: Number(created?.amount ?? amountValue),
        method: created?.paymentMethod || form.method,
        status: (created?.status as PaymentStatus) || "submitted",
      };
      setPayments((prev) => [newPayment, ...prev]);
      setShowForm(false);
      setForm({ customer: "", amount: "", date: new Date().toISOString().slice(0, 10), method: "bank_transfer", reference: "" });
    } catch (err) {
      console.error("createPayment", err);
      setError("Échec de l'enregistrement via l'API. L'encaissement a été ajouté localement.");
      setPayments((prev) => [
        {
          id: `PAY-${String(Date.now()).slice(-5)}`,
          number: form.reference || "Encaissement",
          date: form.date,
          customer: form.customer,
          amount: amountValue,
          method: form.method,
          status: "pending",
        },
        ...prev,
      ]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const header = ["number", "date", "customer", "amount", "method", "status"];
    const lines = [header.join(",")].concat(
      payments.map((payment) =>
        header
          .map((key) => JSON.stringify((payment as any)[key] ?? ""))
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "encaissements.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Encaissements</h1>
          <p className="text-gray-600 mt-1">Suivi des paiements clients et rapprochement comptable</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouvel encaissement
          </button>
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
          <div className="text-sm text-slate-500">Encaissements ce mois</div>
          <div className="text-xl font-semibold text-slate-900">{summaries.count}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Montant total</div>
          <div className="text-xl font-semibold text-slate-900">{formatCurrency(summaries.totalAmount)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Validés</div>
          <div className="text-xl font-semibold text-emerald-700">{summaries.validated}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">En attente</div>
          <div className="text-xl font-semibold text-amber-700">{summaries.pending}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par client, référence ou mode de paiement..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            />
          </div>
          <button
            type="button"
            onClick={loadPayments}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
            Chargement des encaissements…
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun encaissement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 font-medium text-slate-600">Référence</th>
                  <th className="py-3 font-medium text-slate-600">Client</th>
                  <th className="py-3 font-medium text-slate-600">Date</th>
                  <th className="py-3 font-medium text-slate-600">Mode</th>
                  <th className="py-3 font-medium text-slate-600 text-right">Montant</th>
                  <th className="py-3 font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const badge = statusBadge(payment.status);
                  return (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 text-slate-700 font-medium">{payment.number}</td>
                      <td className="py-3 text-slate-600">{payment.customer}</td>
                      <td className="py-3 text-slate-600">{new Date(payment.date).toLocaleDateString("fr-FR")}</td>
                      <td className="py-3 text-slate-600 capitalize">{payment.method.replace(/_/g, " ")}</td>
                      <td className="py-3 text-right text-slate-900 font-semibold">{formatCurrency(payment.amount)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.tone}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Nouvel encaissement</h2>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={form.customer}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de paiement</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode de paiement</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.method}
                    onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
                  >
                    <option value="bank_transfer">Virement</option>
                    <option value="cash">Espèces</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Carte</option>
                    <option value="check">Chèque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Référence (optionnel)</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.reference}
                    onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C74] disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
