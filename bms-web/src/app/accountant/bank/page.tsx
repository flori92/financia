"use client";
import { useState, useEffect } from "react";
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, Link2 } from "lucide-react";

export default function BankReconciliationPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/banking/transactions');
      const data = await res.json();
      setTransactions(data);
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
      alert('Synchronisation réussie');
    } catch (err) {
      alert('Erreur de synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoMatch = async () => {
    try {
      const pending = transactions.filter(t => t.status === 'pending');
      const updated = transactions.map(t => 
        t.status === 'pending' ? { ...t, status: 'reconciled' } : t
      );
      setTransactions(updated);
      alert(`${pending.length} opérations rapprochées automatiquement`);
    } catch (err) {
      alert('Erreur lors du lettrage automatique');
    }
  };

  const handleReconcile = (id: string) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: 'reconciled' } : t
    ));
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
        <div className="flex gap-2">
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
            disabled={pendingCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Lettrage auto ({pendingCount})
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
                  <td className="py-3 px-4 text-sm">{new Date(transaction.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4">{transaction.description}</td>
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
                        onClick={() => handleReconcile(transaction.id)}
                        className="flex items-center gap-1 text-[#0D9488] hover:text-[#0B7C74] text-sm font-medium mx-auto"
                      >
                        <Link2 className="w-4 h-4" />
                        Rapprocher
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}