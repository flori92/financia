"use client";
import { getBaseUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, Link2, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function BankReconciliationPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [companyId, setCompanyId] = useState<string>("default-company");
  const { show } = useToast();
  const [matching, setMatching] = useState(false);
  const [threshold, setThreshold] = useState<number>(0.8);
  const [limit, setLimit] = useState<number>(100);

  useEffect(() => {
    // Récupérer companyId depuis localStorage si présent
    if (typeof window !== 'undefined') {
      const cid = window.localStorage.getItem('company_id') || window.localStorage.getItem('user_company_id');
      if (cid) setCompanyId(cid);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const loadTransactions = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/v1/banking/transactions?companyId=${companyId}`);
      if (!res.ok) throw new Error("Erreur chargement transactions");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadTransactions();
      show({ title: 'Synchronisation réussie', variant: 'success' });
    } catch (err) {
      show({ title: 'Erreur de synchronisation', variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoMatch = async () => {
    if (matching) return;
    setMatching(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/v1/banking/auto-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, threshold, limit }),
      });
      if (!res.ok) throw new Error('Erreur lettrage automatique');
      const data = await res.json();
      await loadTransactions();
      const variant = data.matched > 0 ? 'success' : 'info';
      show({
        title: 'Lettrage automatique terminé',
        description: `Tentatives: ${data.attempted} · Rapprochées: ${data.matched} · Erreurs: ${data.errors}`,
        variant: variant as any,
      });

      // Export CSV des détails si disponibles
      if (Array.isArray(data.details) && data.details.length > 0) {
        const header = ['bankTransactionId','journalEntryId','confidence','status','reason'];
        const rows = data.details.map((d: any) => [
          d.bankTransactionId || '',
          d.journalEntryId || '',
          typeof d.confidence === 'number' ? d.confidence.toFixed(2) : '',
          d.status || '',
          (d.reason || '').toString().replace(/\n|\r|;/g,' '),
        ]);
        const csv = [header.join(';'), ...rows.map((r: any[]) => r.join(';'))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'');
        a.href = url;
        a.download = `auto-match_${ts}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        show({ title: 'Export CSV généré', variant: 'success' });
      }
    } catch (e) {
      console.error(e);
      show({ title: 'Échec du lettrage automatique', variant: 'error' });
    } finally {
      setMatching(false);
    }
  };

  const openSuggestions = async (tx: any) => {
    setSelectedTx(tx);
    setSuggestionsOpen(true);
    setSuggestionsLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch(`${getBaseUrl()}/api/v1/banking/transactions/${tx.id}/entry-suggest?companyId=${companyId}`);
      if (!res.ok) throw new Error('Erreur récupération suggestions');
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      show({ title: 'Erreur', description: "Impossible de récupérer les écritures suggérées", variant: 'error' });
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const reconcileWithEntry = async (journalEntryId: string) => {
    if (!selectedTx) return;
    try {
      const res = await fetch(`${getBaseUrl()}/api/v1/banking/reconcile-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          bankTransactionId: selectedTx.id,
          journalEntryId,
          notes: note || undefined,
        }),
      });
      if (!res.ok) throw new Error('Erreur rapprochement');
      setSuggestionsOpen(false);
      setNote("");
      await loadTransactions();
      show({ title: 'Rapprochement effectué', variant: 'success' });
    } catch (e) {
      console.error(e);
      show({ title: 'Échec du rapprochement', variant: 'error' });
    }
  };

  const bankBalance = 15068500;
  const bookBalance = 15120000;
  const difference = Math.abs(bankBalance - bookBalance);
  const reconciledCount = transactions.filter(t => t.status === 'reconciled').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rapprochement bancaire</h1>
          <p className="text-gray-600">Lettrage automatique et rapprochement intelligent</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Paramètres auto-match */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border rounded-lg">
            <label className="text-sm text-gray-600">Seuil</label>
            <input
              type="number"
              min={0.5}
              max={0.99}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Math.min(0.99, Math.max(0.5, Number(e.target.value) || 0)))}
              className="w-20 border rounded px-2 py-1 text-sm"
            />
            <label className="text-sm text-gray-600">Limite</label>
            <input
              type="number"
              min={1}
              max={500}
              step={1}
              value={limit}
              onChange={(e) => setLimit(Math.min(500, Math.max(1, Number(e.target.value) || 1)))}
              className="w-20 border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
          <button
            onClick={handleAutoMatch}
            disabled={pendingCount === 0 || matching}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
          >
            <CheckCircle className={`w-4 h-4 ${matching ? 'animate-spin' : ''}`} />
            {matching ? 'Lettrage...' : `Lettrage auto (${pendingCount})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Solde bancaire</div>
          <div className="text-2xl font-semibold text-[#0D9488]">{bankBalance.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Solde comptable</div>
          <div className="text-2xl font-semibold text-blue-600">{bookBalance.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Écart à justifier</div>
          <div className={`text-2xl font-semibold ${difference === 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {difference.toLocaleString()} FCFA
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Opérations à rapprocher</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {reconciledCount} rapprochées
            </span>
            <span className="text-orange-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {pendingCount} en attente
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant banque</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant comptable</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Aucune transaction</td></tr>
              ) : transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(transaction.transactionDate || transaction.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4">{transaction.label || transaction.description}</td>
                  <td className={`py-3 px-4 text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(transaction.amount)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {transaction.status === 'reconciled' ? 
                      `${transaction.amount >= 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR').format(transaction.amount)} FCFA` : 
                      '-'
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    {transaction.status === 'reconciled' ? (
                      <span className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Rapproché
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {transaction.status === 'pending' && (
                      <button
                        onClick={() => openSuggestions(transaction)}
                        className="flex items-center gap-1 text-[#0D9488] hover:text-[#0B7C74] text-sm font-medium mx-auto"
                      >
                        <Link2 className="w-4 h-4" />
                        Rapprocher (Écriture)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Suggestions */}
      {suggestionsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="text-lg font-semibold">Suggestions d'écritures à rapprocher</div>
                {selectedTx && (
                  <div className="text-sm text-gray-600">Transaction: {new Date(selectedTx.transactionDate || selectedTx.date).toLocaleDateString('fr-FR')} · {selectedTx.label || selectedTx.description} · {new Intl.NumberFormat('fr-FR').format(selectedTx.amount)} FCFA</div>
                )}
              </div>
              <button onClick={() => setSuggestionsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {suggestionsLoading ? (
                <div className="text-center text-gray-500 py-8">Recherche des meilleures écritures...</div>
              ) : suggestions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Aucune écriture correspondante trouvée</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Écriture</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Montant (512)</th>
                        <th className="text-right py-2">Écart</th>
                        <th className="text-center py-2">Confiance</th>
                        <th className="text-center py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestions.map((s) => (
                        <tr key={s.journalEntryId} className="border-b hover:bg-gray-50">
                          <td className="py-2">{s.entryNumber}</td>
                          <td className="py-2">{new Date(s.entryDate).toLocaleDateString('fr-FR')}</td>
                          <td className="py-2 text-right font-mono">{new Intl.NumberFormat('fr-FR').format(s.matchedAmount)} FCFA</td>
                          <td className="py-2 text-right font-mono">{new Intl.NumberFormat('fr-FR').format(s.delta)} FCFA</td>
                          <td className="py-2 text-center">{Math.round(s.confidence * 100)}%</td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => reconcileWithEntry(s.journalEntryId)}
                              className="px-3 py-1.5 bg-[#0D9488] text-white rounded-lg text-sm hover:bg-[#0B7C74]"
                            >
                              Rapprocher
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4">
                <label className="text-sm text-gray-700">Notes (optionnel)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="Commentaire de rapprochement"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setSuggestionsOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}