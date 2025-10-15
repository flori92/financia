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

  const kpis = useMemo(() => {
    const totalPayments = payments.reduce((s, p) => s + (parseFloat(String(p.amount||0))||0), 0);
    const unpaid = invoices.filter(i => (i.paymentStatus||i.status) !== 'paid');
    const unpaidTotal = unpaid.reduce((s, i) => s + (parseFloat(String(i.outstandingAmount||i.totalAmount||0))||0), 0);
    const expenses = 0;
    const balance = totalPayments - expenses;
    return { totalPayments, unpaidCount: unpaid.length, unpaidTotal, balance };
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
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <div className="flex gap-2">
          <button className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">
            Nouvelle transaction
          </button>
          <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">
            Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Encaissements" value={nf(kpis.totalPayments)} hint={"Cumul paiements"} tone="success" />
        <KpiCard title="Impayés" value={nf(kpis.unpaidTotal)} hint={`${kpis.unpaidCount} facture(s)`} tone="danger" />
        <KpiCard title="Solde" value={nf(kpis.balance)} hint={"Trésorerie disponible"} />
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
