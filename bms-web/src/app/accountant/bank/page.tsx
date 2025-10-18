"use client";
import { useState, useEffect } from "react";
import { apiPost, apiGet, getCompanyId } from "@/lib/api";
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  reconciled: "bg-emerald-100 text-emerald-800",
  ignored: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS = {
  pending: "À rapprocher",
  reconciled: "Rapproché",
  ignored: "Ignoré",
};

export default function BankPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/api/v1/banking/transactions', { companyId: cid });
      setTransactions(data || []);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const cid = getCompanyId();
    if (!cid) { showError('Aucune société sélectionnée'); return; }
    if (!csvContent.trim()) { showError('Aucun fichier sélectionné'); return; }

    setUploading(true);
    try {
      const imported = await apiPost('/api/v1/banking/import', {
        csvContent,
        companyId: cid,
        format: 'standard',
      });
      showSuccess(`${imported.length} transactions importées`);
      setCsvContent("");
      await refresh();
    } catch (e: any) {
      showError(String(e));
    } finally {
      setUploading(false);
    }
  }

  async function handleSuggest(tx: any) {
    const cid = getCompanyId();
    if (!cid) return;
    setSelectedTx(tx);
    try {
      const data = await apiGet(`/api/v1/banking/transactions/${tx.id}/suggest`, { companyId: cid });
      setSuggestions(data || []);
    } catch (e: any) {
      showError(String(e));
    }
  }

  async function handleReconcile(paymentId: string) {
    if (!selectedTx) return;
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    try {
      await apiPost('/api/v1/banking/reconcile', {
        bankTransactionId: selectedTx.id,
        paymentId,
        userId,
      });
      showSuccess('Rapprochement effectué');
      setSelectedTx(null);
      setSuggestions([]);
      await refresh();
    } catch (e: any) {
      showError(String(e));
    }
  }

  async function handleIgnore(txId: string) {
    try {
      await apiPost(`/api/v1/banking/transactions/${txId}/ignore`, {});
      showSuccess('Transaction ignorée');
      await refresh();
    } catch (e: any) {
      showError(String(e));
    }
  }

  useEffect(() => { refresh(); }, []);

  const pending = transactions.filter((t) => t.status === 'pending');
  const reconciled = transactions.filter((t) => t.status === 'reconciled');
  const ignored = transactions.filter((t) => t.status === 'ignored');

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg ${toast.type==='success'?'bg-emerald-50 text-emerald-800':'bg-rose-50 text-rose-800'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Rapprochement Bancaire</h1>
      </div>

      {/* Upload CSV */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Importer un relevé bancaire (CSV)</h3>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fichier CSV (colonnes: Date, Montant, Libellé, Référence)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleImport}
            disabled={!csvContent || uploading}
            className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Import...' : 'Importer'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Formats supportés: Date (YYYY-MM-DD ou DD/MM/YYYY), Montant (nombres avec virgule ou point), Libellé (texte), Référence (optionnel)
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">À rapprocher</div>
          <div className="text-2xl font-semibold text-amber-700">{pending.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Rapprochées</div>
          <div className="text-2xl font-semibold text-emerald-700">{reconciled.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Ignorées</div>
          <div className="text-2xl font-semibold text-slate-600">{ignored.length}</div>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Transactions bancaires</h3>
        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {loading ? (
          <div className="text-sm text-slate-500">Chargement…</div>
        ) : transactions.length === 0 ? (
          <div className="text-sm text-slate-500">Aucune transaction. Importez un relevé CSV.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Montant</th>
                  <th className="pb-2">Libellé</th>
                  <th className="pb-2">Référence</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-app-border">
                    <td className="py-2">{new Date(tx.transactionDate).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2 font-mono">
                      {(parseFloat(tx.amount) || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2">{tx.label}</td>
                    <td className="py-2 text-slate-600">{tx.reference || '—'}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[tx.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[tx.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {tx.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSuggest(tx)}
                            className="text-xs text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Rapprocher
                          </button>
                          <button
                            onClick={() => handleIgnore(tx.id)}
                            className="text-xs text-slate-600 hover:underline"
                          >
                            Ignorer
                          </button>
                        </div>
                      )}
                      {tx.status === 'reconciled' && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />
                      )}
                      {tx.status === 'ignored' && (
                        <XCircle className="w-4 h-4 text-slate-400 ml-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de suggestions */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rapprocher la transaction</h3>
              <button onClick={() => { setSelectedTx(null); setSuggestions([]); }} className="text-slate-500 hover:text-slate-700">
                ×
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-md mb-4">
              <div className="text-sm text-slate-600">Transaction bancaire</div>
              <div className="font-medium">{selectedTx.label}</div>
              <div className="text-sm text-slate-600">
                {new Date(selectedTx.transactionDate).toLocaleDateString('fr-FR')} • {(parseFloat(selectedTx.amount) || 0).toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            <div className="mb-3">
              <div className="text-sm font-medium text-slate-700 mb-2">Paiements suggérés</div>
              {suggestions.length === 0 ? (
                <div className="text-sm text-slate-500">Aucun paiement correspondant trouvé. Critères: montant ±5%, date ±7 jours.</div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((payment: any) => (
                    <div key={payment.id} className="border border-app-border rounded-md p-3 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{payment.paymentNumber}</div>
                          <div className="text-xs text-slate-600">
                            {new Date(payment.paymentDate).toLocaleDateString('fr-FR')} • {(parseFloat(payment.amount) || 0).toLocaleString('fr-FR')} FCFA • {payment.partyType === 'customer' ? 'Client' : 'Fournisseur'}
                          </div>
                          {payment.reference && <div className="text-xs text-slate-500">Réf: {payment.reference}</div>}
                        </div>
                        <button
                          onClick={() => handleReconcile(payment.id)}
                          className="rounded-md bg-app-primary text-white text-xs px-3 py-1 hover:bg-[#0F766E]"
                        >
                          Rapprocher
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
