"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { KpiCard } from "@/components/kpi/KpiCard";
import { SimpleTable } from "@/components/table/SimpleTable";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { apiGet, getCompanyId } from "@/lib/api";

const txColumns = [
  { key: "date", header: "Date" },
  { key: "desc", header: "Description" },
  { key: "amount", header: "Montant" },
];
function nf(v: number) { return new Intl.NumberFormat("fr-FR").format(v) + " FCFA"; }
function fd(s: any) { const d = s? new Date(s): null; return !d||isNaN(d.getTime())? "": d.toLocaleDateString("fr-FR"); }
function ym(d: string | Date) { const dt = new Date(d); return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,'0'); }

export default function TreasuryPage() {
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true); setError(null);
    apiGet('/api/v1/payments', { companyId: cid })
      .then((list: any[]) => setPayments(list||[]))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const h = () => {
      const cid = getCompanyId();
      if (!cid) return;
      setLoading(true); setError(null);
      apiGet('/api/v1/payments', { companyId: cid })
        .then((list: any[]) => setPayments(list||[]))
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
    const inTotal = payments.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + asAmount(p.amount), 0);
    const outTotal = payments.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + asAmount(p.amount), 0);
    const net = inTotal - outTotal;
    const now = Date.now();
    const last90In = payments.filter(p => (p.partyType||'customer')==='customer' && (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 90*24*3600*1000)
      .reduce((s,p)=> s + asAmount(p.amount), 0);
    const last90Out = payments.filter(p => p.partyType==='supplier' && (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 90*24*3600*1000)
      .reduce((s,p)=> s + asAmount(p.amount), 0);
    const last90Net = last90In - last90Out;
    const reconcile = "—";
    return { inTotal, outTotal, net, last90Net, reconcile };
  }, [payments]);

  const chartData = useMemo(() => {
    const asAmount = (v: any) => parseFloat(String(v||0))||0;
    const byMonth: Record<string,{recettes:number,depenses:number,net:number,solde:number}> = {};
    for (const p of payments) {
      const key = ym(p.paymentDate||p.createdAt||new Date());
      byMonth[key] = byMonth[key]||{recettes:0,depenses:0,net:0,solde:0};
      const amt = asAmount(p.amount);
      if ((p.partyType||'customer')==='customer') {
        byMonth[key].recettes += amt;
      } else if (p.partyType==='supplier') {
        byMonth[key].depenses += amt;
      }
    }
    // calc net + solde cumulé
    const entries = Object.entries(byMonth).sort(([a],[b])=>a.localeCompare(b));
    let running = 0;
    const out = entries.map(([name,v])=>{
      const net = (v.recettes||0) - (v.depenses||0);
      running += net;
      return { name, recettes: v.recettes, depenses: v.depenses, net, solde: running };
    });
    return out;
  }, [payments]);

  const txData = useMemo(()=> (payments||[]).slice(0,10).map((p:any)=>{
    const amt = parseFloat(String(p.amount||0))||0;
    const isIn = (p.partyType||'customer')==='customer';
    return {
      date: fd(p.paymentDate||p.createdAt),
      desc: p.reference || p.paymentNumber || (isIn? "Encaissement" : "Décaissement"),
      amount: (isIn? "+" : "-") + nf(amt),
    };
  }), [payments]);

  const forecast = useMemo(() => {
    const now = Date.now();
    const days = payments
      .filter(p => (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 30*24*3600*1000)
      .map(p => ({ d: new Date(p.paymentDate||p.createdAt).toDateString(), v: parseFloat(String(p.amount||0))||0 }));
    const byDay: Record<string, number> = {};
    for (const x of days) byDay[x.d] = (byDay[x.d]||0) + x.v;
    const vals = Object.values(byDay);
    const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    const next_7_days = Array.from({length:7},()=> Math.round(avg));
    const next_30_days = Array.from({length:30},()=> Math.round(avg));
    const confidence = vals.length >= 7 ? 0.7 : 0.4;
    const daysOfRunway = (kpis.net/ (avg || 1)) || 0;
    const recommendations: string[] = [];
    if (daysOfRunway < 15) recommendations.push('Trésorerie critique: <15 jours – accélérer relances clients.');
    if (avg === 0) recommendations.push('Aucune entrée récente: vérifier synchronisation paiements.');
    return { next7: next_7_days, next30: next_30_days, confidence, recommendations };
  }, [payments, kpis.net]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trésorerie</h1>
        <div className="flex gap-2">
          <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Importer</button>
          <button className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Nouvelle transaction</button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "Aperçu" },
          { id: "transactions", label: "Transactions" },
          { id: "reconcile", label: "Rapprochement" },
          { id: "accounts", label: "Comptes Bancaires" },
          { id: "flows", label: "Flux de Trésorerie" },
        ]}
        defaultId="overview"
        onChange={setActive}
      />

      {active === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Entrées totales" value={nf(kpis.inTotal)} />
            <KpiCard title="Sorties totales" value={nf(kpis.outTotal)} />
            <KpiCard title="Net (90 jours)" value={nf(kpis.last90Net)} />
          </div>
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Évolution de la trésorerie</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="recettes" fill="#16A34A" name="Recettes" radius={[4,4,0,0]} />
                  <Bar dataKey="depenses" fill="#DC2626" name="Dépenses" radius={[4,4,0,0]} />
                  <Line type="monotone" dataKey="solde" stroke="#2563EB" name="Solde cumulé" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {active === "transactions" && (
        <div className="card p-4">
          <SimpleTable columns={txColumns as any} data={txData} />
        </div>
      )}

      {active === "reconcile" && (
        <div className="card p-4 text-sm text-slate-600">Module de rapprochement (à connecter à la banque).</div>
      )}

      {active === "accounts" && (
        <div className="card p-4 text-sm text-slate-600">Comptes bancaires (liste et soldes).</div>
      )}

      {active === "flows" && (
        <div className="card p-4 text-sm text-slate-600">
          <div className="mb-3 text-base font-medium">Prévisions encaissements</div>
          <div className="mb-2">7 jours: {forecast.next7.slice(0,7).map(nf).join(' | ')}</div>
          <div className="mb-4">Confiance: {(forecast.confidence*100).toFixed(0)}%</div>
          {forecast.recommendations.length>0 && (
            <div className="space-y-1">
              {forecast.recommendations.map((r,i)=>(<div key={i} className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">{r}</div>))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
