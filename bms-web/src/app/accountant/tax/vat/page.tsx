"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Download, Calendar } from "lucide-react";

export default function VatReturnPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [vatReturn, setVatReturn] = useState<any | null>(null);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function calculate() {
    const cid = getCompanyId();
    if (!cid) { showError('Aucune société sélectionnée'); return; }
    if (!startDate || !endDate) { showError('Dates requises'); return; }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/api/v1/tax/vat/return', { companyId: cid, startDate, endDate });
      setVatReturn(data);
      showSuccess('Déclaration calculée');
    } catch (e: any) {
      setError(String(e));
      showError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    const cid = getCompanyId();
    if (!cid || !vatReturn) return;
    
    try {
      const csv = await apiGet('/api/v1/tax/vat/return/export', { companyId: cid, startDate, endDate });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `declaration-tva-${startDate}-${endDate}.csv`;
      a.click();
      showSuccess('Export CSV téléchargé');
    } catch (e: any) {
      showError(String(e));
    }
  }

  // Écouter les changements de société
  useEffect(() => {
    const handleCompanyChange = () => {
      if (vatReturn) calculate(); // Recalculer si déjà chargé
    };
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, [vatReturn, startDate, endDate]);

  function setQuickPeriod(type: 'month' | 'quarter' | 'year') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (type === 'month') {
      setStartDate(new Date(year, month, 1).toISOString().slice(0, 10));
      setEndDate(new Date(year, month + 1, 0).toISOString().slice(0, 10));
    } else if (type === 'quarter') {
      const quarterStart = Math.floor(month / 3) * 3;
      setStartDate(new Date(year, quarterStart, 1).toISOString().slice(0, 10));
      setEndDate(new Date(year, quarterStart + 3, 0).toISOString().slice(0, 10));
    } else if (type === 'year') {
      setStartDate(new Date(year, 0, 1).toISOString().slice(0, 10));
      setEndDate(new Date(year, 11, 31).toISOString().slice(0, 10));
    }
  }

  const nf = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg ${toast.type==='success'?'bg-emerald-50 text-emerald-800':'bg-rose-50 text-rose-800'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Déclaration de TVA</h1>
      </div>

      {/* Sélection période */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Période de déclaration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setQuickPeriod('month')}
            className="text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Mois en cours
          </button>
          <button
            onClick={() => setQuickPeriod('quarter')}
            className="text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Trimestre en cours
          </button>
          <button
            onClick={() => setQuickPeriod('year')}
            className="text-xs px-3 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Année en cours
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={calculate}
            disabled={loading}
            className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E] disabled:opacity-50 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            {loading ? 'Calcul...' : 'Calculer la déclaration'}
          </button>
          {vatReturn && (
            <button
              onClick={exportCsv}
              className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          )}
        </div>
      </div>

      {error && <div className="card p-4 text-sm text-rose-600">{error}</div>}

      {/* Résultats */}
      {vatReturn && (
        <>
          {/* Synthèse */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">Synthèse TVA</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">Chiffre d'affaires HT</div>
                <div className="text-2xl font-semibold text-blue-900">{nf(vatReturn.revenueHT)} FCFA</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-700 mb-1">TVA collectée</div>
                <div className="text-2xl font-semibold text-emerald-900">{nf(vatReturn.vatCollected)} FCFA</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-700 mb-1">Achats HT</div>
                <div className="text-2xl font-semibold text-amber-900">{nf(vatReturn.purchasesHT)} FCFA</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-700 mb-1">TVA déductible</div>
                <div className="text-2xl font-semibold text-orange-900">{nf(vatReturn.vatDeductible)} FCFA</div>
              </div>
              <div className={`p-4 rounded-lg ${vatReturn.vatNet >= 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                <div className={`text-sm mb-1 ${vatReturn.vatNet >= 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {vatReturn.vatNet >= 0 ? 'TVA nette à payer' : 'Crédit de TVA'}
                </div>
                <div className={`text-2xl font-semibold ${vatReturn.vatNet >= 0 ? 'text-rose-900' : 'text-slate-900'}`}>
                  {nf(Math.abs(vatReturn.vatNet))} FCFA
                </div>
              </div>
            </div>
          </div>

          {/* Détail Produits */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">Détail des Produits (Classe 7)</h3>
            {vatReturn.details.revenues.length === 0 ? (
              <div className="text-sm text-slate-500">Aucun produit dans la période</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-app-border">
                      <th className="pb-2">Compte</th>
                      <th className="pb-2">Libellé</th>
                      <th className="pb-2 text-right">Montant HT</th>
                      <th className="pb-2 text-right">TVA (18%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vatReturn.details.revenues.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-app-border">
                        <td className="py-2 font-mono">{item.accountNumber}</td>
                        <td className="py-2">{item.accountName}</td>
                        <td className="py-2 text-right font-mono">{nf(item.amountHT)}</td>
                        <td className="py-2 text-right font-mono text-emerald-700">{nf(item.vat)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold border-t-2 border-app-border">
                      <td colSpan={2} className="pt-2">Total</td>
                      <td className="pt-2 text-right">{nf(vatReturn.revenueHT)}</td>
                      <td className="pt-2 text-right text-emerald-700">{nf(vatReturn.vatCollected)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Détail Charges */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">Détail des Charges (Classe 6)</h3>
            {vatReturn.details.purchases.length === 0 ? (
              <div className="text-sm text-slate-500">Aucune charge dans la période</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-app-border">
                      <th className="pb-2">Compte</th>
                      <th className="pb-2">Libellé</th>
                      <th className="pb-2 text-right">Montant HT</th>
                      <th className="pb-2 text-right">TVA (18%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vatReturn.details.purchases.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-app-border">
                        <td className="py-2 font-mono">{item.accountNumber}</td>
                        <td className="py-2">{item.accountName}</td>
                        <td className="py-2 text-right font-mono">{nf(item.amountHT)}</td>
                        <td className="py-2 text-right font-mono text-orange-700">{nf(item.vat)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold border-t-2 border-app-border">
                      <td colSpan={2} className="pt-2">Total</td>
                      <td className="pt-2 text-right">{nf(vatReturn.purchasesHT)}</td>
                      <td className="pt-2 text-right text-orange-700">{nf(vatReturn.vatDeductible)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="card p-4 bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions pour la déclaration DGI</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Exportez le fichier CSV via le bouton "Exporter CSV"</li>
              <li>Connectez-vous au portail e-impôts de la DGI du Bénin</li>
              <li>Sélectionnez "Déclaration de TVA" pour la période concernée</li>
              <li>Saisissez les montants dans les cases correspondantes</li>
              <li>Le montant à payer est : <strong>{nf(Math.max(0, vatReturn.vatNet))} FCFA</strong></li>
              {vatReturn.vatNet < 0 && <li className="text-amber-700">Vous avez un crédit de TVA de {nf(Math.abs(vatReturn.vatNet))} FCFA reportable</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
