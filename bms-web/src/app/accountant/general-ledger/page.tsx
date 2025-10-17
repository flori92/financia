"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Book, Filter } from "lucide-react";

export default function GeneralLedgerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function loadAccounts() {
    const cid = getCompanyId();
    if (!cid) return;
    try {
      const data = await apiGet('/api/v1/accounting/accounts', { companyId: cid });
      setAccounts(data || []);
    } catch (e: any) {
      console.error(e);
    }
  }

  async function loadLedger() {
    const cid = getCompanyId();
    if (!cid) { showError('Aucune société sélectionnée'); return; }
    
    setLoading(true);
    setError(null);
    try {
      const params: any = { companyId: cid };
      if (selectedAccountNumber) params.accountNumber = selectedAccountNumber;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const data = await apiGet('/api/v1/accounting/general-ledger', params);
      setLedgerData(data);
      showSuccess('Grand livre chargé');
    } catch (e: any) {
      setError(String(e));
      showError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAccounts(); }, []);

  const nf = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg ${toast.type==='success'?'bg-emerald-50 text-emerald-800':'bg-rose-50 text-rose-800'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Grand Livre</h1>
      </div>

      {/* Filtres */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compte (optionnel)</label>
            <select
              value={selectedAccountNumber}
              onChange={(e) => setSelectedAccountNumber(e.target.value)}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            >
              <option value="">Tous les comptes</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountNumber} — {acc.accountName}
                </option>
              ))}
            </select>
          </div>
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
          <div className="flex items-end">
            <button
              onClick={loadLedger}
              disabled={loading}
              className="w-full rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Book className="w-4 h-4" />
              {loading ? 'Chargement...' : 'Afficher'}
            </button>
          </div>
        </div>
        {selectedAccountNumber && ledgerData?.account && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-900">
              <strong>Compte sélectionné:</strong> {ledgerData.account.number} — {ledgerData.account.name}
              <span className="ml-3 text-xs">({ledgerData.account.type})</span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="card p-4 text-sm text-rose-600">{error}</div>}

      {/* Résultats */}
      {ledgerData && (
        <>
          {/* Sommaire */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">Sommaire</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">Total Débit</div>
                <div className="text-2xl font-semibold text-blue-900">{nf(ledgerData.summary.totalDebit)} FCFA</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-700 mb-1">Total Crédit</div>
                <div className="text-2xl font-semibold text-orange-900">{nf(ledgerData.summary.totalCredit)} FCFA</div>
              </div>
              <div className={`p-4 rounded-lg ${ledgerData.summary.finalBalance >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <div className={`text-sm mb-1 ${ledgerData.summary.finalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Solde Final
                </div>
                <div className={`text-2xl font-semibold ${ledgerData.summary.finalBalance >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {nf(Math.abs(ledgerData.summary.finalBalance))} FCFA
                </div>
              </div>
            </div>
          </div>

          {/* Mouvements */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">Mouvements</h3>
            {ledgerData.movements.length === 0 ? (
              <div className="text-sm text-slate-500">Aucun mouvement trouvé pour les critères sélectionnés.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-app-border">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">N° Écriture</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Référence</th>
                      <th className="pb-2 text-right">Débit</th>
                      <th className="pb-2 text-right">Crédit</th>
                      <th className="pb-2 text-right">Solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.movements.map((mvt: any, idx: number) => (
                      <tr key={idx} className="border-b border-app-border hover:bg-slate-50">
                        <td className="py-2">{new Date(mvt.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 font-mono text-xs">{mvt.entryNumber}</td>
                        <td className="py-2">{mvt.description}</td>
                        <td className="py-2 text-slate-600 text-xs">{mvt.reference || '—'}</td>
                        <td className="py-2 text-right font-mono text-blue-700">
                          {mvt.debit > 0 ? nf(mvt.debit) : '—'}
                        </td>
                        <td className="py-2 text-right font-mono text-orange-700">
                          {mvt.credit > 0 ? nf(mvt.credit) : '—'}
                        </td>
                        <td className={`py-2 text-right font-mono font-semibold ${mvt.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {nf(Math.abs(mvt.balance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold border-t-2 border-app-border">
                      <td colSpan={4} className="pt-3">Total</td>
                      <td className="pt-3 text-right text-blue-900">{nf(ledgerData.summary.totalDebit)}</td>
                      <td className="pt-3 text-right text-orange-900">{nf(ledgerData.summary.totalCredit)}</td>
                      <td className={`pt-3 text-right ${ledgerData.summary.finalBalance >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {nf(Math.abs(ledgerData.summary.finalBalance))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
