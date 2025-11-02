"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { SimpleTable } from "@/components/table/SimpleTable";
import { apiGet, apiPatch, getCompanyId } from "@/lib/api";

function nf(v: number) { return new Intl.NumberFormat("fr-FR").format(v) + " FCFA"; }
function fd(s: any) { const d = s? new Date(s): null; return !d||isNaN(d.getTime())? "": d.toLocaleDateString("fr-FR"); }

export default function AccountantValidationPage() {
  const [active, setActive] = useState("invoices");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) { 
      setLoading(false); 
      return; 
    }
    setLoading(true); setError(null);
    try {
      const inv = await apiGet('/api/v1/invoices', { companyId: cid, status: 'submitted' }) as any[];
      const pay = await apiGet('/api/v1/payments', { companyId: cid }) as any[];
      setInvoices(inv||[]);
      setPayments(pay||[]);
    } catch (e: any) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ refresh(); },[]);
  useEffect(()=>{
    const h = () => { refresh(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  },[]);

  async function approveInvoice(id?: string) {
    try {
      if (!id) return;
      const cid = getCompanyId();
      if (!cid) return;
      await apiPatch(`/api/v1/invoices/${id}/validate`, {}, { companyId: cid });
      showSuccess('Facture approuvée');
      await refresh();
    } catch (e:any) { showError(String(e)); }
  }
  async function rejectInvoice(id?: string) {
    try {
      if (!id) return;
      const cid = getCompanyId();
      if (!cid) return;
      await apiPatch(`/api/v1/invoices/${id}/cancel`, {}, { companyId: cid });
      showSuccess('Facture rejetée');
      await refresh();
    } catch (e:any) { showError(String(e)); }
  }

  async function approvePayment(id?: string) {
    try { if (!id) return; await apiPatch(`/api/v1/payments/${id}/validate`, {}); showSuccess('Paiement approuvé'); await refresh(); }
    catch (e:any){ showError(String(e)); }
  }
  async function rejectPayment(id?: string) {
    try { if (!id) return; await apiPatch(`/api/v1/payments/${id}/cancel`, {}); showSuccess('Paiement rejeté'); await refresh(); }
    catch (e:any){ showError(String(e)); }
  }

  const invoiceRows = useMemo(()=> (invoices||[]).map((i:any)=>({
    date: fd(i.invoiceDate||i.createdAt),
    number: i.invoiceNumber || i.name || i.id,
    client: i.partyName || i.customerName || '—',
    total: nf(parseFloat(String(i.totalAmount||i.grandTotal||i.total||0))||0),
    actions: (
      <div className="flex gap-2">
        <button onClick={()=>approveInvoice(i.id)} className="text-emerald-700 hover:underline">Approuver</button>
        <button onClick={()=>rejectInvoice(i.id)} className="text-rose-700 hover:underline">Refuser</button>
      </div>
    )
  })), [invoices]);

  const paymentRows = useMemo(()=> (payments||[]).filter((p:any)=> (p.status||'')==='submitted').map((p:any)=>({
    date: fd(p.paymentDate||p.createdAt),
    ref: p.reference || p.paymentNumber || 'Paiement',
    method: p.paymentMethod,
    amount: nf(parseFloat(String(p.amount||0))||0),
    actions: (
      <div className="flex gap-2">
        <button onClick={()=>approvePayment(p.id)} className="text-emerald-700 hover:underline">Approuver</button>
        <button onClick={()=>rejectPayment(p.id)} className="text-rose-700 hover:underline">Refuser</button>
      </div>
    )
  })), [payments]);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Comptable – Centre de validation</h1>
      </div>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Chargement…</div>}

      <Tabs
        tabs={[{ id:'invoices', label:'Factures soumises' }, { id:'payments', label:'Paiements soumis' }]}
        defaultId="invoices"
        onChange={setActive}
      />

      {active==='invoices' && (
        <div className="card p-4">
          <SimpleTable columns={[
            { key:'date', header:'Date' },
            { key:'number', header:'Facture' },
            { key:'client', header:'Client' },
            { key:'total', header:'Total' },
            { key:'actions', header:'Actions' },
          ] as any} data={invoiceRows as any} />
        </div>
      )}

      {active==='payments' && (
        <div className="card p-4">
          <SimpleTable columns={[
            { key:'date', header:'Date' },
            { key:'ref', header:'Référence' },
            { key:'method', header:'Mode' },
            { key:'amount', header:'Montant' },
            { key:'actions', header:'Actions' },
          ] as any} data={paymentRows as any} />
        </div>
      )}
    </div>
  );
}
