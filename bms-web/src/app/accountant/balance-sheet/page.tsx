"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";

export default function BalanceSheetPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [equity, setEquity] = useState<any[]>([]);
  const [totals, setTotals] = useState<{assets:number,liabilitiesEquity:number}>({assets:0, liabilitiesEquity:0});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));

  async function refresh() {
    const cid = getCompanyId(); if (!cid) return;
    setLoading(true); setError(null);
    try {
      const data = await apiGet('/api/v1/accounting/balance-sheet', { companyId: cid, date }) as any;
      setAssets(data?.assets||[]);
      setLiabilities(data?.liabilities||[]);
      setEquity(data?.equity||[]);
      setTotals(data?.totals||{assets:0,liabilitiesEquity:0});
    } catch (e:any) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ refresh(); },[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bilan</h1>
          <p className="text-sm text-slate-600 mt-1">Arrêté au: {date}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-md border border-app-border px-3 py-2 text-sm" />
          <button onClick={refresh} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Actualiser</button>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Actif</h3>
          {loading ? (<div className="text-sm text-slate-500">Chargement…</div>) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2 w-32">N°</th>
                  <th className="pb-2">Libellé</th>
                  <th className="pb-2 w-32 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((r:any)=> (
                  <tr key={r.number} className="border-b border-app-border">
                    <td className="py-2 font-mono">{r.number}</td>
                    <td className="py-2">{r.name}</td>
                    <td className="py-2 text-right">{r.amount.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
                {assets.length===0 && (<tr><td colSpan={3} className="py-6 text-center text-slate-500">Aucun actif</td></tr>)}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="pt-3">Total</td>
                  <td className="pt-3"></td>
                  <td className="pt-3 text-right">{totals.assets.toLocaleString('fr-FR')}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Passif & Capitaux propres</h3>
          {loading ? (<div className="text-sm text-slate-500">Chargement…</div>) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2 w-32">N°</th>
                  <th className="pb-2">Libellé</th>
                  <th className="pb-2 w-32 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {[...liabilities, ...equity].map((r:any)=> (
                  <tr key={r.number} className="border-b border-app-border">
                    <td className="py-2 font-mono">{r.number}</td>
                    <td className="py-2">{r.name}</td>
                    <td className="py-2 text-right">{r.amount.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
                {liabilities.length+equity.length===0 && (<tr><td colSpan={3} className="py-6 text-center text-slate-500">Aucun passif/CP</td></tr>)}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="pt-3">Total</td>
                  <td className="pt-3"></td>
                  <td className="pt-3 text-right">{totals.liabilitiesEquity.toLocaleString('fr-FR')}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
