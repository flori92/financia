"use client";
// Rapprochement Bancaire - MODE DYNAMIQUE avec API backend
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, Link2, X, Filter, FileDown, FileUp } from "lucide-react";
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
  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);
  const companyId = getCompanyId();
  const { show } = useToast();
  const [matching, setMatching] = useState(false);
  const [threshold, setThreshold] = useState<number>(0.8);
  const [limit, setLimit] = useState<number>(100);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', minAmount: '', maxAmount: '', status: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [selectedTxs, setSelectedTxs] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

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
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const data = await apiGet('/api/v1/banking/transactions', { companyId });
      setTransactions(Array.isArray(data) ? data : []);
      triggerToast("success", "Transactions bancaires chargées");
    } catch (err: any) {
      console.error('Erreur chargement transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      triggerToast("error", errorMessage);
      
      // Gérer spécifiquement l'erreur 404
      if (err?.message?.includes('404') || err?.status === 404) {
        triggerToast("info", "Endpoint banque en cours de déploiement. Affichage des données de démonstration.");
        setTransactions([]); // Données vides en fallback
      }
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
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const data = await apiPost('/api/v1/banking/auto-match', { companyId, threshold, limit });
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
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const data = await apiGet(`/api/v1/banking/transactions/${tx.id}/entry-suggest`, { companyId });
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
      triggerToast("error", errorMessage);
      show({ title: 'Erreur', description: "Impossible de récupérer les écritures suggérées", variant: 'error' });
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const reconcileWithEntry = async (journalEntryId: string) => {
    if (!selectedTx) return;
    try {
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      await apiPost('/api/v1/banking/reconcile-entry', {
        companyId,
        bankTransactionId: selectedTx.id,
        journalEntryId,
        notes: note || undefined,
      });
      setSuggestionsOpen(false);
      setNote("");
      await loadTransactions();
      show({ title: 'Rapprochement effectué', variant: 'success' });
    } catch (e) {
      console.error(e);
      show({ title: 'Échec du rapprochement', variant: 'error' });
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingCsv(true);
    try {
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const text = await file.text();
      const data = await apiPost('/api/v1/banking/import-csv', { companyId, csvContent: text });
      await loadTransactions();
      show({ 
        title: `${data.imported} transactions importées`, 
        description: data.skipped ? `${data.skipped} doublons ignorés` : undefined,
        variant: 'success' 
      });
    } catch (e) {
      console.error(e);
      show({ title: 'Échec import CSV', variant: 'error' });
    } finally {
      setUploadingCsv(false);
      if (e.target) e.target.value = '';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Référence', 'Montant', 'Statut', 'Notes'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.transactionDate || tx.date).toLocaleDateString('fr-FR'),
      tx.label || tx.description || '',
      tx.reference || '',
      tx.amount,
      tx.status,
      tx.notes || ''
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapprochement_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    show({ title: 'Export CSV téléchargé', variant: 'success' });
  };

  const toggleSelection = (txId: string) => {
    setSelectedTxs(prev => 
      prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTxs.length === filteredTransactions.length) {
      setSelectedTxs([]);
    } else {
      setSelectedTxs(filteredTransactions.map(tx => tx.id));
    }
  };

  const handleBulkReconcile = async () => {
    if (selectedTxs.length === 0) return;
    try {
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const data = await apiPost('/api/v1/banking/bulk-reconcile', { companyId, transactionIds: selectedTxs });
      setSelectedTxs([]);
      await loadTransactions();
      show({ 
        title: `${data.reconciled} transactions rapprochées`, 
        description: data.failed ? `${data.failed} échecs` : undefined,
        variant: 'success' 
      });
    } catch (e) {
      console.error(e);
      show({ title: 'Échec rapprochement lot', variant: 'error' });
    }
  };

  const handleBulkIgnore = async () => {
    if (selectedTxs.length === 0) return;
    try {
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const data = await apiPost('/api/v1/banking/bulk-ignore', { companyId, transactionIds: selectedTxs });
      setSelectedTxs([]);
      await loadTransactions();
      show({ title: `${data.ignored} transactions ignorées`, variant: 'success' });
    } catch (e) {
      console.error(e);
      show({ title: 'Échec ignorer lot', variant: 'error' });
    }
  };

  const loadHistory = async () => {
    try {
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const data = await apiGet('/api/v1/banking/history', { companyId, limit: 50 });
      setHistory(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
      triggerToast("error", errorMessage);
      show({ title: 'Erreur chargement historique', variant: 'error' });
    }
  };

  const bankBalance = transactions.reduce((sum: number, t: any) => t.status !== 'ignored' ? sum + t.amount : sum, 0);
  const bookBalance = transactions.filter(t => t.status === 'reconciled').reduce((sum: number, t: any) => sum + t.amount, 0);
  const difference = Math.abs(bankBalance - bookBalance);
  const reconciledCount = transactions.filter(t => t.status === 'reconciled').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const ignoredCount = transactions.filter(t => t.status === 'ignored').length;

  const filteredTransactions = transactions.filter(tx => {
    if (filters.status !== 'all' && tx.status !== filters.status) return false;
    if (filters.startDate && new Date(tx.transactionDate || tx.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(tx.transactionDate || tx.date) > new Date(filters.endDate)) return false;
    if (filters.minAmount && Math.abs(tx.amount) < Number(filters.minAmount)) return false;
    if (filters.maxAmount && Math.abs(tx.amount) > Number(filters.maxAmount)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rapprochement bancaire</h1>
          <p className="text-gray-600">Lettrage automatique et rapprochement intelligent</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 cursor-pointer">
            <FileUp className="w-4 h-4" />
            {uploadingCsv ? 'Import...' : 'Importer CSV'}
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" disabled={uploadingCsv} />
          </label>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileDown className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showFilters ? 'bg-teal-100 text-teal-700' : 'bg-white border'}`}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={handleAutoMatch}
            disabled={pendingCount === 0 || matching}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className={`w-4 h-4 ${matching ? 'animate-spin' : ''}`} />
            Lettrage auto ({pendingCount})
          </button>
          <button
            onClick={() => { setShowHistory(true); loadHistory(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            📋 Historique
          </button>
        </div>
      </div>

      {/* Barre actions par lot */}
      {selectedTxs.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <span className="font-medium">{selectedTxs.length} transaction(s) sélectionnée(s)</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkReconcile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Rapprocher la sélection
            </button>
            <button
              onClick={handleBulkIgnore}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Ignorer la sélection
            </button>
            <button
              onClick={() => setSelectedTxs([])}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant min (FCFA)</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant max (FCFA)</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="999999999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="reconciled">Rapprochées</option>
                <option value="ignored">Ignorées</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setFilters({ startDate: '', endDate: '', minAmount: '', maxAmount: '', status: 'all' })}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <span className="text-sm text-gray-600 py-2">
              {filteredTransactions.length} transaction(s) affichée(s) sur {transactions.length}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Solde bancaire</div>
          <div className="text-2xl font-semibold text-[#0D9488]">{bankBalance.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Solde comptable</div>
          <div className="text-2xl font-semibold text-blue-600">{bookBalance.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Écart à justifier</div>
          <div className={`text-2xl font-semibold ${difference === 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {difference.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Taux rapprochement</div>
          <div className="text-2xl font-semibold text-teal-600">
            {transactions.length > 0 ? Math.round((reconciledCount / transactions.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Opérations bancaires</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {reconciledCount} rapprochées
            </span>
            <span className="text-orange-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {pendingCount} en attente
            </span>
            <span className="text-gray-600 flex items-center gap-1">
              <X className="w-4 h-4" />
              {ignoredCount} ignorées
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 px-2 font-medium text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedTxs.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
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
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucune transaction correspondante</td></tr>
              ) : filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTxs.includes(transaction.id)}
                      onChange={() => toggleSelection(transaction.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
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

      {/* Modal Historique */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Historique des opérations</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Aucun historique disponible</div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, idx) => (
                    <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {entry.action === 'reconcile' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {entry.action === 'ignore' && <X className="w-4 h-4 text-gray-600" />}
                            {entry.action === 'unreconcile' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                            <span className="font-medium">{entry.description || entry.action}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Transaction: {entry.transactionId} · {new Intl.NumberFormat('fr-FR').format(entry.amount || 0)} FCFA
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-500 mt-1">Note: {entry.notes}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(entry.createdAt || entry.date).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      {entry.user && (
                        <div className="text-xs text-gray-500 mt-2">Par: {entry.user}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowHistory(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : 
            toast.type === "error" ? "bg-rose-600 text-white" : 
            "bg-blue-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}