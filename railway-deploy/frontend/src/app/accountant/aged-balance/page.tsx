"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

type AgedBalanceType = 'receivables' | 'payables';

export default function AgedBalancePage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AgedBalanceType>('receivables');
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any | null>(null);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function loadData() {
    const cid = getCompanyId();
    if (!cid) { showError('Aucune société sélectionnée'); return; }
    
    setLoading(true);
    try {
      const result = await apiGet('/api/v1/accounting/aged-balance', { 
        companyId: cid, 
        type: activeTab,
        asOfDate 
      });
      setData(result);
      showSuccess('Balance âgée chargée');
    } catch (e: any) {
      // Gérer l'erreur 404 "Compte introuvable" avec un message utile
      if (e.includes('404') && e.includes('introuvable')) {
        showError('Données démo non initialisées. Veuillez contacter l\'administrateur.');
      } else {
        showError(String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [activeTab, asOfDate]);

  // Écouter les changements de société
  useEffect(() => {
    const handleCompanyChange = () => loadData();
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, [activeTab, asOfDate]);

  const nf = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const getPercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((Math.abs(part) / Math.abs(total)) * 100);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg ${toast.type==='success'?'bg-emerald-50 text-emerald-800':'bg-rose-50 text-rose-800'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Balance Âgée</h1>
      </div>

      {/* Tabs + Date */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('receivables')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'receivables'
                  ? 'bg-app-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Créances Clients
            </button>
            <button
              onClick={() => setActiveTab('payables')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payables'
                  ? 'bg-app-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4 inline mr-1" />
              Dettes Fournisseurs
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Au</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {loading && <div className="card p-8 text-center text-slate-500">Chargement...</div>}

      {!loading && data && (
        <>
          {/* Graphique / KPI */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">Répartition par Ancienneté</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-700 mb-1">0-30 jours</div>
                <div className="text-xl font-semibold text-emerald-900">{nf(Math.abs(data.totals?.current || 0))} FCFA</div>
                <div className="text-xs text-emerald-600 mt-1">{getPercentage(data.totals?.current || 0, data.totals?.total || 0)}%</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">30-60 jours</div>
                <div className="text-xl font-semibold text-blue-900">{nf(Math.abs(data.totals?.days30_60 || 0))} FCFA</div>
                <div className="text-xs text-blue-600 mt-1">{getPercentage(data.totals?.days30_60 || 0, data.totals?.total || 0)}%</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-700 mb-1">60-90 jours</div>
                <div className="text-xl font-semibold text-amber-900">{nf(Math.abs(data.totals?.days60_90 || 0))} FCFA</div>
                <div className="text-xs text-amber-600 mt-1">{getPercentage(data.totals?.days60_90 || 0, data.totals?.total || 0)}%</div>
              </div>
              <div className="bg-rose-50 p-4 rounded-lg">
                <div className="text-sm text-rose-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  &gt; 90 jours
                </div>
                <div className="text-xl font-semibold text-rose-900">{nf(Math.abs(data.totals?.over90 || 0))} FCFA</div>
                <div className="text-xs text-rose-600 mt-1">{getPercentage(data.totals?.over90 || 0, data.totals?.total || 0)}%</div>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="text-sm text-slate-700 mb-1">Total</div>
                <div className="text-xl font-semibold text-slate-900">{nf(Math.abs(data.totals?.total || 0))} FCFA</div>
                <div className="text-xs text-slate-600 mt-1">100%</div>
              </div>
            </div>

            {/* Barre de progression visuelle */}
            <div className="h-10 flex rounded-lg overflow-hidden">
              {data.totals.total !== 0 && (
                <>
                  {data.totals.current !== 0 && (
                    <div 
                      className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${getPercentage(data.totals.current, data.totals.total)}%` }}
                    >
                      {getPercentage(data.totals.current, data.totals.total) >= 10 && `${getPercentage(data.totals.current, data.totals.total)}%`}
                    </div>
                  )}
                  {data.totals.days30_60 !== 0 && (
                    <div 
                      className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${getPercentage(data.totals.days30_60, data.totals.total)}%` }}
                    >
                      {getPercentage(data.totals.days30_60, data.totals.total) >= 10 && `${getPercentage(data.totals.days30_60, data.totals.total)}%`}
                    </div>
                  )}
                  {data.totals.days60_90 !== 0 && (
                    <div 
                      className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${getPercentage(data.totals.days60_90, data.totals.total)}%` }}
                    >
                      {getPercentage(data.totals.days60_90, data.totals.total) >= 10 && `${getPercentage(data.totals.days60_90, data.totals.total)}%`}
                    </div>
                  )}
                  {data.totals.over90 !== 0 && (
                    <div 
                      className="bg-rose-500 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${getPercentage(data.totals.over90, data.totals.total)}%` }}
                    >
                      {getPercentage(data.totals.over90, data.totals.total) >= 10 && `${getPercentage(data.totals.over90, data.totals.total)}%`}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Détail par tiers */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">
              Détail par {activeTab === 'receivables' ? 'Client' : 'Fournisseur'}
            </h3>
            {data.items.length === 0 ? (
              <div className="text-sm text-slate-500">Aucune {activeTab === 'receivables' ? 'créance' : 'dette'} en cours.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-app-border">
                      <th className="pb-2">{activeTab === 'receivables' ? 'Client' : 'Fournisseur'}</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-right">0-30j</th>
                      <th className="pb-2 text-right">30-60j</th>
                      <th className="pb-2 text-right">60-90j</th>
                      <th className="pb-2 text-right">&gt;90j</th>
                      <th className="pb-2">Plus ancienne</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-app-border hover:bg-slate-50">
                        <td className="py-2 font-medium">{item.party}</td>
                        <td className="py-2 text-right font-semibold">{nf(Math.abs(item.total))}</td>
                        <td className="py-2 text-right text-emerald-700">{item.current !== 0 ? nf(Math.abs(item.current)) : '—'}</td>
                        <td className="py-2 text-right text-blue-700">{item.days30_60 !== 0 ? nf(Math.abs(item.days30_60)) : '—'}</td>
                        <td className="py-2 text-right text-amber-700">{item.days60_90 !== 0 ? nf(Math.abs(item.days60_90)) : '—'}</td>
                        <td className="py-2 text-right text-rose-700 font-medium">{item.over90 !== 0 ? nf(Math.abs(item.over90)) : '—'}</td>
                        <td className="py-2 text-slate-600 text-xs">{new Date(item.oldestDate).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold border-t-2 border-app-border">
                      <td className="pt-3">Total</td>
                      <td className="pt-3 text-right">{nf(Math.abs(data.totals.total))}</td>
                      <td className="pt-3 text-right text-emerald-700">{nf(Math.abs(data.totals.current))}</td>
                      <td className="pt-3 text-right text-blue-700">{nf(Math.abs(data.totals.days30_60))}</td>
                      <td className="pt-3 text-right text-amber-700">{nf(Math.abs(data.totals.days60_90))}</td>
                      <td className="pt-3 text-right text-rose-700">{nf(Math.abs(data.totals.over90))}</td>
                      <td className="pt-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Alertes */}
          {data.totals.over90 !== 0 && (
            <div className="card p-4 bg-rose-50 border border-rose-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-900 mb-1">Attention : Montants en souffrance</h4>
                  <p className="text-sm text-rose-800">
                    {activeTab === 'receivables' 
                      ? `Vous avez ${nf(Math.abs(data.totals.over90))} FCFA de créances impayées depuis plus de 90 jours. Considérez des actions de recouvrement.`
                      : `Vous avez ${nf(Math.abs(data.totals.over90))} FCFA de dettes fournisseurs en retard de plus de 90 jours. Planifiez des paiements pour éviter des pénalités.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
