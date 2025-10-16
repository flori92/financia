"use client";
import { useEffect, useMemo, useState } from "react";
import { KpiCard } from "@/components/kpi/KpiCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { apiGet, getCompanyId } from "@/lib/api";

function nf(v: number) { return new Intl.NumberFormat("fr-FR").format(v) + " FCFA"; }
function ym(d: string | Date) { const dt = new Date(d); return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,'0'); }

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true); setError(null);
    Promise.all([
      apiGet('/api/v1/invoices', { companyId: cid }).catch(() => []),
      apiGet('/api/v1/payments', { companyId: cid }).catch(() => []),
    ]).then(([inv, pay]) => { setInvoices(inv as any[]); setPayments(pay as any[]); })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = () => {
      const cid = getCompanyId();
      if (!cid) return;
      setLoading(true); setError(null);
      Promise.all([
        apiGet('/api/v1/invoices', { companyId: cid }).catch(() => []),
        apiGet('/api/v1/payments', { companyId: cid }).catch(() => []),
      ]).then(([inv, pay]) => { setInvoices(inv as any[]); setPayments(pay as any[]); })
        .catch((e: unknown) => setError(String(e)))
        .finally(() => setLoading(false));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  }, []);

  const kpis = useMemo(() => {
    const asAmount = (v: any) => parseFloat(String(v||0))||0;
    const customerPayments = payments.filter(p=> (p.partyType||'customer')==='customer');
    const supplierPayments = payments.filter(p=> p.partyType==='supplier');
    const totalPayments = customerPayments.reduce((s, p) => s + asAmount(p.amount), 0);
    const totalExpenses = supplierPayments.reduce((s, p) => s + asAmount(p.amount), 0);
    const unpaid = invoices.filter(i => (i.paymentStatus||i.status) !== 'paid');
    const unpaidTotal = unpaid.reduce((s, i) => s + asAmount(i.outstandingAmount||i.totalAmount), 0);
    const balance = totalPayments - totalExpenses;
    
    // Calcul runway simple
    const now = Date.now();
    const last30 = payments.filter(p=> (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 30*24*3600*1000);
    const last30Out = last30.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + asAmount(p.amount), 0);
    const avgDailyOut = last30Out / 30;
    const runway = avgDailyOut > 0 ? Math.floor(balance / avgDailyOut) : 999;
    
    return { totalPayments, totalExpenses, unpaidCount: unpaid.length, unpaidTotal, balance, runway };
  }, [invoices, payments]);

  const chartData = useMemo(() => {
    const byMonth: Record<string,{recettes:number,depenses:number}> = {};
    for (const p of payments) {
      const key = ym(p.paymentDate||p.createdAt||new Date());
      byMonth[key] = byMonth[key]||{recettes:0,depenses:0};
      byMonth[key].recettes += parseFloat(String(p.amount||0))||0;
    }
    return Object.entries(byMonth)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([name,v]) => ({ name, recettes: v.recettes, depenses: v.depenses, benefice: v.recettes - v.depenses }));
  }, [payments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-sm text-slate-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">
            Nouvelle transaction
          </button>
          <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">
            Exporter
          </button>
        </div>
      </div>

      {kpis.runway < 15 && kpis.runway >= 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-800">
          <div className="font-semibold">🔴 Alerte Trésorerie Critique</div>
          <div className="text-sm mt-1">Runway: {kpis.runway} jour(s) restant(s). Accélérez vos relances clients et différez les dépenses non urgentes.</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Encaissements" value={nf(kpis.totalPayments)} hint={"Revenus totaux"} tone="success" />
        <KpiCard title="Dépenses" value={nf(kpis.totalExpenses)} hint={"Sorties totales"} tone="danger" />
        <KpiCard title="Impayés" value={nf(kpis.unpaidTotal)} hint={`${kpis.unpaidCount} facture(s)`} />
        <KpiCard title="Solde" value={nf(kpis.balance)} hint={kpis.runway < 999 ? `Runway: ${kpis.runway}j` : "Situation saine"} />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Flux de trésorerie</h2>
          <div className="text-sm text-slate-500">Aperçu</div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="recettes" fill="#16A34A" name="Recettes" radius={[4,4,0,0]} />
              <Bar dataKey="depenses" fill="#DC2626" name="Dépenses" radius={[4,4,0,0]} />
              <Bar dataKey="benefice" fill="#2563EB" name="Bénéfice" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Chargement…</div>}
    </div>
  );
}
