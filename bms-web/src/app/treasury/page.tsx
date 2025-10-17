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

function exportCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(';'),
    ...data.map(row => headers.map(h => row[h] || '').join(';'))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export default function TreasuryPage() {
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any|null>(null);
  const [series, setSeries] = useState<{ date:string, in:number, out:number, net:number, cumulative:number }[]|null>(null);
  const [rangeMonths, setRangeMonths] = useState<number>(12);
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [horizon, setHorizon] = useState<number>(7);
  const [forecast, setForecast] = useState<any|null>(null);

  async function refreshAll(cid: string, startDate: string, endDate: string) {
    setLoading(true); setError(null);
    try {
      const [list, sum, ts, fc]: any = await Promise.all([
        apiGet('/api/v1/payments', { companyId: cid }).catch(()=>[]),
        apiGet('/api/v1/treasury/summary', { companyId: cid, startDate, endDate }).catch(()=>null),
        apiGet('/api/v1/treasury/timeseries', { companyId: cid, startDate, endDate, granularity: 'month' }).catch(()=>null),
        apiGet('/api/v1/treasury/forecast', { companyId: cid, horizonDays: horizon }).catch(()=>null),
      ]);
      setPayments(list||[]);
      setSummary(sum);
      setSeries(ts?.data||null);
      setForecast(fc||null);
    } catch (e:any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cid = getCompanyId();
    if (!cid) return;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth()-11, 1);
    const startDate = start.toISOString().slice(0,10);
    const endDate = now.toISOString().slice(0,10);
    setCustomStart(startDate);
    setCustomEnd(endDate);
    refreshAll(cid, startDate, endDate);
  }, []);

  useEffect(() => {
    const h = () => {
      const cid = getCompanyId();
      if (!cid) return;
      if (customMode && customStart && customEnd) {
        refreshAll(cid, customStart, customEnd);
      } else {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth()-(rangeMonths-1), 1);
        refreshAll(cid, start.toISOString().slice(0,10), now.toISOString().slice(0,10));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  }, []);

  const kpis = useMemo(() => {
    const asAmount = (v: any) => parseFloat(String(v||0))||0;
    let inTotal = payments.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + asAmount(p.amount), 0);
    let outTotal = payments.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + asAmount(p.amount), 0);
    let net = inTotal - outTotal;
    if (summary) {
      inTotal = asAmount(summary?.in?.amount);
      outTotal = asAmount(summary?.out?.amount);
      net = asAmount(summary?.net);
    }
    const now = Date.now();
    const last90In = payments.filter(p => (p.partyType||'customer')==='customer' && (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 90*24*3600*1000)
      .reduce((s,p)=> s + asAmount(p.amount), 0);
    const last90Out = payments.filter(p => p.partyType==='supplier' && (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 90*24*3600*1000)
      .reduce((s,p)=> s + asAmount(p.amount), 0);
    const last90Net = last90In - last90Out;
    const reconcile = "—";
    return { inTotal, outTotal, net, last90Net, reconcile };
  }, [payments, summary]);

  const chartData = useMemo(() => {
    const asAmount = (v: any) => parseFloat(String(v||0))||0;
    if (series && series.length) {
      return series.map((s:any)=>({ name: s.date, recettes: asAmount(s.in), depenses: asAmount(s.out), net: asAmount(s.net), solde: asAmount(s.cumulative) }));
    }
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
    const entries = Object.entries(byMonth).sort(([a],[b])=>a.localeCompare(b));
    let running = 0;
    const out = entries.map(([name,v])=>{
      const net = (v.recettes||0) - (v.depenses||0);
      running += net;
      return { name, recettes: v.recettes, depenses: v.depenses, net, solde: running };
    });
    return out;
  }, [payments, series]);

  const txData = useMemo(()=> (payments||[]).slice(0,10).map((p:any)=>{
    const amt = parseFloat(String(p.amount||0))||0;
    const isIn = (p.partyType||'customer')==='customer';
    return {
      date: fd(p.paymentDate||p.createdAt),
      desc: p.reference || p.paymentNumber || (isIn? "Encaissement" : "Décaissement"),
      amount: (isIn? "+" : "-") + nf(amt),
    };
  }), [payments]);

  const alerts = useMemo(() => {
    const result: { level: 'critical' | 'warning' | 'info', message: string }[] = [];
    const asAmount = (v: any) => parseFloat(String(v||0))||0;
    
    // Calcul runway (jours de trésorerie disponible)
    const last30In = payments.filter(p => (p.partyType||'customer')==='customer' && (Date.now() - new Date(p.paymentDate||p.createdAt||Date.now()).getTime()) <= 30*24*3600*1000).reduce((s,p)=> s + asAmount(p.amount), 0);
    const last30Out = payments.filter(p => p.partyType==='supplier' && (Date.now() - new Date(p.paymentDate||p.createdAt||Date.now()).getTime()) <= 30*24*3600*1000).reduce((s,p)=> s + asAmount(p.amount), 0);
    const avgDailyOut = last30Out / 30;
    const runway = avgDailyOut > 0 ? Math.floor(kpis.net / avgDailyOut) : 999;
    
    if (runway < 15 && runway >= 0) result.push({ level: 'critical', message: `🔴 Trésorerie critique: ${runway} jours de runway restants. Accélérer relances clients.` });
    else if (runway < 30 && runway >= 15) result.push({ level: 'warning', message: `🟡 Attention: ${runway} jours de runway. Surveiller encaissements à venir.` });
    
    // Tendance négative
    if (kpis.last90Net < 0) result.push({ level: 'warning', message: `🟡 Tendance négative: flux net négatif sur 90 jours (${nf(kpis.last90Net)}).` });
    
    // Aucune entrée récente
    if (last30In === 0) result.push({ level: 'warning', message: `🟡 Aucun encaissement sur les 30 derniers jours. Vérifier synchronisation.` });
    
    // Solde positif (info)
    if (result.length === 0 && kpis.net > 0) result.push({ level: 'info', message: `✅ Situation saine: solde positif (${nf(kpis.net)}), runway > 30 jours.` });
    
    return result;
  }, [payments, kpis]);
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
          {alerts.filter(a => a.level === 'critical').length > 0 && (
            <div className="space-y-2 mb-4">
              {alerts.filter(a => a.level === 'critical').map((alert, i) => (
                <div key={i} className="rounded-md px-4 py-3 bg-red-50 border border-red-200 text-red-800">
                  {alert.message}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Entrées totales" value={nf(kpis.inTotal)} />
            <KpiCard title="Sorties totales" value={nf(kpis.outTotal)} />
            <KpiCard title="Net (90 jours)" value={nf(kpis.last90Net)} />
          </div>
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Prévisions</h3>
              <div className="flex items-center gap-2 text-sm">
                <span>Horizon:</span>
                <select
                  className="border border-app-border rounded-md px-2 py-1 bg-white text-slate-700"
                  value={horizon}
                  onChange={async (e)=>{
                    const h = parseInt(e.target.value, 10) || 7;
                    setHorizon(h);
                    const cid = getCompanyId();
                    if (cid) {
                      try {
                        const fc = await apiGet('/api/v1/treasury/forecast', { companyId: cid, horizonDays: h });
                        setForecast(fc);
                      } catch {}
                    }
                  }}
                >
                  <option value={7}>7 jours</option>
                  <option value={30}>30 jours</option>
                </select>
              </div>
            </div>
            {forecast ? (
              <div className="space-y-2 text-sm text-slate-700">
                <div>Confiance: {Math.round((forecast.confidence||0)*100)}%</div>
                <div>
                  Solde projeté fin horizon: {nf((forecast.points?.[forecast.points.length-1]?.projectedBalance)||0)}
                </div>
                {Array.isArray(forecast.recommendations) && forecast.recommendations.length>0 && (
                  <div className="space-y-1 mt-2">
                    {forecast.recommendations.map((r:string,i:number)=>(
                      <div key={i} className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">{r}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-600">Prévisions indisponibles.</div>
            )}
          </div>
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Évolution de la trésorerie</h2>
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={()=> {
                    const exportData = chartData.map(d => ({
                      Date: d.name,
                      Recettes: d.recettes,
                      Depenses: d.depenses,
                      Net: d.net,
                      SoldeCumule: d.solde
                    }));
                    exportCSV(exportData, `tresorerie_${new Date().toISOString().slice(0,10)}.csv`);
                  }}
                  className="rounded-md bg-white text-slate-700 border border-app-border text-xs px-3 py-1.5 hover:bg-slate-50"
                >
                  Exporter CSV
                </button>
                <button
                  onClick={()=> setCustomMode(!customMode)}
                  className="text-app-primary underline hover:text-[#0F766E]"
                >
                  {customMode ? "Période rapide" : "Dates personnalisées"}
                </button>
                {!customMode ? (
                  <>
                    <span>Période:</span>
                    <select
                      className="border border-app-border rounded-md px-2 py-1 bg-white text-slate-700"
                      value={rangeMonths}
                      onChange={(e)=>{
                        const m = parseInt(e.target.value,10)||12;
                        setRangeMonths(m);
                        const cid = getCompanyId();
                        if (cid) {
                          const now = new Date();
                          const start = new Date(now.getFullYear(), now.getMonth()-(m-1), 1);
                          refreshAll(cid, start.toISOString().slice(0,10), now.toISOString().slice(0,10));
                        }
                      }}
                    >
                      <option value={3}>3 mois</option>
                      <option value={6}>6 mois</option>
                      <option value={12}>12 mois</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e)=> setCustomStart(e.target.value)}
                      className="border border-app-border rounded-md px-2 py-1 bg-white text-slate-700"
                    />
                    <span>→</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e)=> setCustomEnd(e.target.value)}
                      className="border border-app-border rounded-md px-2 py-1 bg-white text-slate-700"
                    />
                    <button
                      onClick={()=>{
                        const cid = getCompanyId();
                        if (cid && customStart && customEnd) refreshAll(cid, customStart, customEnd);
                      }}
                      className="rounded-md bg-app-primary text-white text-xs px-3 py-1.5 hover:bg-[#0F766E]"
                    >
                      Appliquer
                    </button>
                  </>
                )}
              </div>
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
        <div className="card p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Rapprochement Bancaire
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Le module de rapprochement bancaire complet est disponible dans l'espace comptable.
            </p>
            <a 
              href="/accountant/bank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-primary text-white rounded-lg hover:bg-app-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Accéder au Rapprochement Bancaire
            </a>
            <div className="mt-6 text-xs text-slate-500">
              <p className="font-medium mb-2">Fonctionnalités disponibles :</p>
              <ul className="space-y-1 text-left max-w-md mx-auto">
                <li>• Import CSV des relevés bancaires</li>
                <li>• Rapprochement automatique avec suggestions intelligentes</li>
                <li>• Marquage manuel des transactions</li>
                <li>• Historique complet des opérations</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {active === "accounts" && (
        <div className="card p-4 text-sm text-slate-600">Comptes bancaires (liste et soldes).</div>
      )}

      {active === "flows" && (
        <div className="card p-4">
          <div className="mb-4 text-lg font-semibold">Alertes et Recommandations</div>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div 
                  key={i} 
                  className={`rounded-md px-4 py-3 ${
                    alert.level === 'critical' ? 'bg-red-50 border border-red-200 text-red-800' :
                    alert.level === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                    'bg-green-50 border border-green-200 text-green-800'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-600 text-sm">Aucune alerte pour le moment.</div>
          )}
        </div>
      )}
    </div>
  );
}
