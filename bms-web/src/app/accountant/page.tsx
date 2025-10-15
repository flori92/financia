"use client";
import { useEffect, useMemo, useState } from "react";
import { KpiCard } from "@/components/kpi/KpiCard";
import { SimpleTable } from "@/components/table/SimpleTable";
import { apiGet, getCompanyId } from "@/lib/api";

function nf(v: number) { return new Intl.NumberFormat("fr-FR").format(v) + " FCFA"; }
function fd(s: any) { const d = s? new Date(s): null; return !d||isNaN(d.getTime())? "": d.toLocaleDateString("fr-FR"); }

export default function AccountantDashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);

  useEffect(()=>{
    // Charger la liste des sociétés et initialiser la sélection
    apiGet('/api/v1/companies')
      .then((list: any[]) => {
        setCompanies(list||[]);
        const current = getCompanyId() || (list && list[0]?.id);
        setCompanyId(current);
        if (typeof window !== 'undefined' && current) {
          window.localStorage.setItem('companyId', current);
        }
      })
      .catch((e: unknown)=> setError(String(e)));
  },[]);

  useEffect(()=>{
    if (!companyId) return;
    setLoading(true); setError(null);
    Promise.all([
      apiGet('/api/v1/invoices', { companyId }).catch(()=>[]),
      apiGet('/api/v1/payments', { companyId }).catch(()=>[]),
    ]).then(([inv, pay])=>{ setInvoices(inv as any[]); setPayments(pay as any[]); })
      .catch((e: unknown)=> setError(String(e)))
      .finally(()=> setLoading(false));
  },[companyId]);

  useEffect(()=>{
    const h = () => {
      const next = getCompanyId();
      if (next && next !== companyId) setCompanyId(next);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  },[companyId]);

  const kpis = useMemo(()=>{
    const unpaid = (invoices||[]).filter((i:any)=> (i.paymentStatus||i.status)!=='paid');
    const unpaidTotal = unpaid.reduce((s:number,i:any)=> s + (parseFloat(String(i.outstandingAmount||i.totalAmount||0))||0), 0);
    const encaissements = (payments||[]).reduce((s:number,p:any)=> s + (parseFloat(String(p.amount||0))||0), 0);
    return { unpaidCount: unpaid.length, unpaidTotal, encaissements };
  },[invoices, payments]);

  const toValidate = useMemo(()=> (invoices||[]).filter((i:any)=> (i.status||'')==='submitted'), [invoices]);

  const recentTx = useMemo(()=> (payments||[]).slice(0,8).map((p:any)=>({
    date: fd(p.paymentDate||p.createdAt),
    ref: p.reference || p.paymentNumber || 'Paiement',
    method: p.paymentMethod,
    amount: nf(parseFloat(String(p.amount||0))||0),
  })), [payments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Comptable – Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Société</label>
          <select
            className="rounded-md border border-app-border px-3 py-2 text-sm bg-white"
            value={companyId || ''}
            onChange={(e)=>{
              const val = e.target.value || undefined;
              setCompanyId(val);
              if (typeof window !== 'undefined' && val) window.localStorage.setItem('companyId', val);
            }}
          >
            {companies.map((c:any)=>(<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Chargement…</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Factures impayées" value={String(kpis.unpaidCount)} hint={nf(kpis.unpaidTotal)} tone="danger" />
        <KpiCard title="Encaissements" value={nf(kpis.encaissements)} tone="success" />
        <KpiCard title="À valider" value={String(toValidate.length)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="mb-3 text-sm font-medium">À valider (factures)</div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-600"><th className="py-2">Date</th><th className="py-2">Numéro</th><th className="py-2">Client</th><th className="py-2">Total</th></tr></thead>
            <tbody>
              {toValidate.slice(0,8).map((i:any)=> (
                <tr key={i.id} className="border-t border-app-border">
                  <td className="py-2">{fd(i.invoiceDate||i.createdAt)}</td>
                  <td className="py-2">{i.invoiceNumber||i.name||i.id}</td>
                  <td className="py-2">{i.partyName||i.customerName||'—'}</td>
                  <td className="py-2">{nf(parseFloat(String(i.totalAmount||i.grandTotal||i.total||0))||0)}</td>
                </tr>
              ))}
              {toValidate.length===0 && <tr><td className="py-4 text-slate-500" colSpan={4}>Rien à valider.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card p-4">
          <div className="mb-3 text-sm font-medium">Transactions récentes</div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-600"><th className="py-2">Date</th><th className="py-2">Référence</th><th className="py-2">Mode</th><th className="py-2">Montant</th></tr></thead>
            <tbody>
              {recentTx.map((r:any,idx:number)=>(
                <tr key={idx} className="border-t border-app-border">
                  <td className="py-2">{r.date}</td>
                  <td className="py-2">{r.ref}</td>
                  <td className="py-2">{r.method}</td>
                  <td className="py-2">{r.amount}</td>
                </tr>
              ))}
              {recentTx.length===0 && <tr><td className="py-4 text-slate-500" colSpan={4}>Aucune transaction.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
