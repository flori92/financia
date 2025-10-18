"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";

export default function ProfitLossPage() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totals, setTotals] = useState<{revenues:number,expenses:number,result:number}>({revenues:0,expenses:0,result:0});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0,10));

  async function refresh() {
    const cid = getCompanyId(); if (!cid) return;
    setLoading(true); setError(null);
    try {
      const data = await apiGet('/api/v1/accounting/profit-loss', { companyId: cid, startDate, endDate }) as any;
      setRevenues(data?.revenues || []);
      setExpenses(data?.expenses || []);
      setTotals(data?.totals || {revenues:0,expenses:0,result:0});
    } catch (e:any) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ refresh(); },[]);

  // Écouter les changements de société
  useEffect(() => {
    const handleCompanyChange = () => refresh();
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compte de Résultat</h1>
          <p className="text-sm text-slate-600 mt-1">Période: {startDate} → {endDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="rounded-md border border-app-border px-3 py-2 text-sm" />
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="rounded-md border border-app-border px-3 py-2 text-sm" />
          <button onClick={refresh} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Actualiser</button>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Produits</h3>
          {loading ? (
            <div className="text-sm text-slate-500">Chargement…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2 w-32">N°</th>
                  <th className="pb-2">Libellé</th>
                  <th className="pb-2 w-32 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map((r:any)=> (
                  <tr key={r.number} className="border-b border-app-border">
                    <td className="py-2 font-mono">{r.number}</td>
                    <td className="py-2">{r.name}</td>
                    <td className="py-2 text-right">{r.amount.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
                {revenues.length===0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-500">Aucun produit sur la période</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="pt-3">Total</td>
                  <td className="pt-3"></td>
                  <td className="pt-3 text-right">{totals.revenues.toLocaleString('fr-FR')}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Charges</h3>
          {loading ? (
            <div className="text-sm text-slate-500">Chargement…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2 w-32">N°</th>
                  <th className="pb-2">Libellé</th>
                  <th className="pb-2 w-32 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((r:any)=> (
                  <tr key={r.number} className="border-b border-app-border">
                    <td className="py-2 font-mono">{r.number}</td>
                    <td className="py-2">{r.name}</td>
                    <td className="py-2 text-right">{r.amount.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
                {expenses.length===0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-500">Aucune charge sur la période</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="pt-3">Total</td>
                  <td className="pt-3"></td>
                  <td className="pt-3 text-right">{totals.expenses.toLocaleString('fr-FR')}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      <div className={`rounded-md p-4 ${totals.result>=0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
        <div className="text-sm">Résultat net</div>
        <div className="text-xl font-semibold">{totals.result.toLocaleString('fr-FR')} FCFA</div>
      </div>
    </div>
  );
}
