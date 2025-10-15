"use client";
import { useEffect, useMemo, useState } from "react";
import { SimpleTable } from "@/components/table/SimpleTable";
import { KpiCard } from "@/components/kpi/KpiCard";
import { apiGet, apiPost, apiPatch, apiDelete, getCompanyId } from "@/lib/api";

const columns = [
  { key: "date", header: "Date" },
  { key: "desc", header: "Description" },
  { key: "category", header: "Catégorie" },
  { key: "party", header: "Bénéficiaire/Payer" },
  { key: "amount", header: "Montant" },
  { key: "actions", header: "Actions", render: () => (
    <div className="flex gap-2">
      <button className="text-app-primary hover:underline">Voir</button>
      <button className="text-slate-500 hover:underline">Justif</button>
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

const defaults = [
  { date: "05/03/2025", desc: "Ventes mensuelles", category: "Ventes", party: "--", amount: "+171 915 FCFA" },
  { date: "24/02/2025", desc: "Prestations de service", category: "Services", party: "--", amount: "+374 619 FCFA" },
  { date: "25/01/2025", desc: "Ventes mensuelles", category: "Ventes", party: "--", amount: "+224 700 FCFA" },
];

export default function TransactionsPage() {
  const [rows, setRows] = useState<any[]>(defaults);
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("cash");
  const [reference, setReference] = useState<string>("");
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  function rebuild(list: any[]) {
    const mapped = (list || []).map((p: any) => ({
      id: p.id,
      date: fd(p.paymentDate || p.createdAt),
      desc: p.reference || p.paymentNumber || "Paiement",
      category: p.paymentMethod || "Paiement",
      party: p.partyId || "--",
      amount: (p.partyType === 'supplier' ? '-' : '+') + nf(p.amount),
      onEdit: () => handleEdit(p.id, p.reference || ""),
      onDelete: () => handleDelete(p.id),
    }));
    setRows(mapped.length ? mapped : defaults);
  }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true); setError(null);
    try {
      const list = await apiGet('/api/v1/payments', { companyId: cid }) as any[];
      setRaw(list||[]); rebuild(list||[]);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate() {
    try {
      const cid = getCompanyId(); if (!cid) return;
      const body = {
        paymentDate: new Date().toISOString().slice(0,10),
        amount: parseFloat(amount||'0')||0,
        currency: 'XOF',
        paymentMethod: method,
        reference: reference || undefined,
        partyType: 'customer',
        partyId: (typeof window!=='undefined' && localStorage.getItem('default_party_id')) || '11111111-1111-1111-1111-111111111111',
        companyId: cid,
        createdBy: '7e5d06a6-03ac-467e-abe0-d51d0ea722ff',
      };
      await apiPost('/api/v1/payments', body);
      setAmount(""); setReference(""); setMethod("cash");
      showSuccess('Paiement créé');
      await refresh();
    } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  async function handleEdit(id?: string, currentRef?: string) {
    try {
      if (!id) return;
      const nextRef = typeof window!== 'undefined' ? window.prompt('Référence', currentRef||'') : currentRef;
      await apiPatch(`/api/v1/payments/${id}`, { reference: nextRef||undefined });
      showSuccess('Paiement mis à jour');
      await refresh();
    } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  async function handleDelete(id?: string) {
    try { if (!id) return; await apiDelete(`/api/v1/payments/${id}`); showSuccess('Paiement supprimé'); await refresh(); }
    catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  function exportCsv() {
    const rowsToExport = raw.length ? raw : [];
    const header = ['paymentNumber','paymentDate','amount','currency','paymentMethod','partyType','partyId','companyId','status','reference'];
    const lines = [header.join(',')].concat(rowsToExport.map((p:any)=> header.map(h=> JSON.stringify(p[h] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Montant" value={amount} onChange={e=>setAmount(e.target.value)} />
          <select className="rounded-md border border-app-border px-3 py-2 text-sm" value={method} onChange={e=>setMethod(e.target.value)}>
            <option value="cash">Espèces</option>
            <option value="bank_transfer">Virement</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="check">Chèque</option>
            <option value="card">Carte</option>
          </select>
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Référence" value={reference} onChange={e=>setReference(e.target.value)} />
          <button onClick={handleCreate} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Ajouter</button>
          <button onClick={exportCsv} className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Exporter CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Transactions totales" value={String(raw.length)} />
        <KpiCard title="Revenus" value={nf((raw||[]).reduce((s:any,p:any)=> s + (parseFloat(String(p.amount||0))||0), 0))} tone="success" />
        <KpiCard title="Dépenses" value={nf((raw||[]).filter((p:any)=> p.partyType==='supplier').reduce((s:any,p:any)=> s + (parseFloat(String(p.amount||0))||0), 0))} tone="danger" />
        <KpiCard title="Solde" value={nf(((raw||[]).reduce((s:any,p:any)=> s + (p.partyType==='supplier' ? -1: 1)*(parseFloat(String(p.amount||0))||0), 0)))} />
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
