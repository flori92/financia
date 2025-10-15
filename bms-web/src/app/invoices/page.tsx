"use client";
import { useEffect, useState } from "react";
import { SimpleTable } from "@/components/table/SimpleTable";
import { KpiCard } from "@/components/kpi/KpiCard";
import { apiGet, apiPatch, apiPost } from "@/lib/api";

const columns = [
  { key: "date", header: "Date" },
  { key: "invoice", header: "Facture" },
  { key: "party", header: "Client" },
  { key: "total", header: "Total" },
  { key: "status", header: "Statut", render: (row: any) => (
      row.status === 'paid' ? <span className="badge-success">Payée</span>
      : row.status === 'overdue' ? <span className="badge-danger">En retard</span>
      : <span className="badge-warning">À payer</span>
    )
  },
  { key: "actions", header: "Actions", render: (row: any) => (
    <div className="flex gap-2">
      <button className="text-app-primary hover:underline">Voir</button>
      <button className="text-slate-500 hover:underline">PDF</button>
      <button onClick={row.onSubmit} className="text-emerald-700 hover:underline">Soumettre</button>
      <button onClick={row.onCancel} className="text-rose-700 hover:underline">Annuler</button>
      <button onClick={row.onSend} className="text-sky-700 hover:underline">Envoyer</button>
    </div>
  )},
];

function nf(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v || 0));
  return new Intl.NumberFormat("fr-FR").format(isNaN(n) ? 0 : n) + " FCFA";
}

function fd(s: any) {
  const d = s ? new Date(s) : null;
  if (!d || isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR");
}

function getCompanyId() {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_COMPANY_ID) return process.env.NEXT_PUBLIC_COMPANY_ID;
  if (typeof window !== "undefined") return window.localStorage.getItem("companyId") || undefined;
  return undefined;
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([
    { date: "05/03/2025", invoice: "FINV-2025-003", party: "Société ABC", total: "590 000 FCFA", status: "due" },
    { date: "24/02/2025", invoice: "FINV-2025-002", party: "Global Services", total: "118 000 FCFA", status: "paid" },
    { date: "25/01/2025", invoice: "FINV-2025-001", party: "Entreprise XYZ", total: "224 700 FCFA", status: "overdue" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any[]>([]);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  function rebuild(list: any[]) {
    const mapped = (list || []).map((inv: any) => ({
      id: inv.id,
      date: fd(inv.createdAt || inv.postingDate || inv.date),
      invoice: inv.invoiceNumber || inv.name || inv.id,
      party: inv.partyName || inv.customerName || inv.party || inv.partyId,
      total: nf(inv.grandTotal || inv.total || inv.amount || inv.totalAmount),
      status: inv.status || inv.paymentStatus || 'due',
      onSubmit: () => handleSubmit(inv.id),
      onCancel: () => handleCancel(inv.id),
      onSend: () => handleSend(inv.id, 'whatsapp'),
    }));
    if (mapped.length) setRows(mapped); else setRows([]);
  }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true); setError(null);
    try {
      const list = await apiGet('/api/v1/invoices', { companyId: cid }) as any[];
      setRaw(list); rebuild(list);
    } catch (e: unknown) {
      setError(String(e));
    } finally { setLoading(false); }
  }

  async function handleSubmit(id?: string) {
    try { if (!id) return; await apiPatch(`/api/v1/invoices/${id}/submit`, {}); showSuccess('Facture soumise'); await refresh(); } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }
  async function handleCancel(id?: string) {
    try { if (!id) return; await apiPatch(`/api/v1/invoices/${id}/cancel`, {}); showSuccess('Facture annulée'); await refresh(); } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }
  async function handleSend(id?: string, method: 'whatsapp'|'sms'|'email' = 'whatsapp') {
    try { if (!id) return; await apiPost(`/api/v1/invoices/${id}/send`, { method }); showSuccess('Facture envoyée'); await refresh(); } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const h = () => { refresh(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  }, []);
  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Factures Clients</h1>
        <div className="flex gap-2">
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Rechercher par nom ou numéro" />
          <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Exporter</button>
          <button className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Nouvelle facture</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Total factures" value="932 700 FCFA" />
        <KpiCard title="Payées" value="118 000 FCFA" tone="success" />
        <KpiCard title="En retard" value="224 700 FCFA" tone="danger" />
      </div>

      <div className="card p-4">
        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {loading ? (
          <div className="text-sm text-slate-500">Chargement…</div>
        ) : (
          <SimpleTable columns={columns as any} data={rows} />
        )}
      </div>
    </div>
  );
}
