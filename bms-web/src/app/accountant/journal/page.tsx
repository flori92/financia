"use client";
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, Upload, Camera, X } from "lucide-react";

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    account: "",
    minAmount: "",
    maxAmount: "",
    status: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesRes, accountsRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/accounting/general-ledger').then(r => r.json()),
        fetch('http://localhost:3001/api/v1/accounting/chart-of-accounts').then(r => r.json())
      ]);
      setEntries(entriesRes);
      setAccounts(accountsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entry = {
      description: formData.get('description'),
      debit: { account: formData.get('debitAccount'), amount: Number(formData.get('debitAmount')) },
      credit: { account: formData.get('creditAccount'), amount: Number(formData.get('creditAmount')) }
    };
    
    try {
      await fetch('http://localhost:3001/api/v1/accounting/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = entry.date ? new Date(entry.date) : undefined;
      const debitAmount = entry.debit?.amount || 0;
      const creditAmount = entry.credit?.amount || 0;
      const entryAmount = Math.max(debitAmount, creditAmount);

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (entryDate && entryDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        if (entryDate && entryDate > end) return false;
      }
      if (filters.account) {
        const accountMatch = entry.debit?.account === filters.account || entry.credit?.account === filters.account;
        if (!accountMatch) return false;
      }
      if (filters.minAmount && entryAmount < Number(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && entryAmount > Number(filters.maxAmount)) {
        return false;
      }
      if (filters.status && filters.status !== "all") {
        const normalizedStatus = filters.status === "validated" ? "Validé" : filters.status === "draft" ? "Brouillon" : filters.status;
        if ((entry.status || "Validé") !== normalizedStatus) {
          return false;
        }
      }
      return true;
    });
  }, [entries, filters]);

  const totalDebit = filteredEntries.reduce((sum, e) => sum + (e.debit?.amount || 0), 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + (e.credit?.amount || 0), 0);
  const hasActiveFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journal comptable</h1>
          <p className="text-gray-600">Saisie et consultation des écritures comptables</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Camera className="w-4 h-4" />
            OCR Facture
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouvelle écriture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total débits</div>
          <div className="text-2xl font-semibold text-green-600">{totalDebit.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total crédits</div>
          <div className="text-2xl font-semibold text-red-600">{totalCredit.toLocaleString()} FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Écritures</div>
          <div className="text-2xl font-semibold text-blue-600">{entries.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Équilibre</div>
          <div className={`text-2xl font-semibold ${totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}`}>
            {totalDebit === totalCredit ? '✓ OK' : '✗ Déséquilibré'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une écriture..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(prev => !prev)}
            className={`relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition ${
              hasActiveFilters ? "bg-[#0D9488]/10 border-[#0D9488] text-[#0D9488]" : "hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#0D9488]" />}
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <form
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setShowFilters(false);
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="filter-start-date">Date de début</label>
                <input
                  id="filter-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters(prev => ({ ...prev, startDate: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="filter-end-date">Date de fin</label>
                <input
                  id="filter-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters(prev => ({ ...prev, endDate: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="filter-account">Compte</label>
                <select
                  id="filter-account"
                  value={filters.account}
                  onChange={(event) => setFilters(prev => ({ ...prev, account: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                >
                  <option value="">Tous les comptes</option>
                  {accounts.map((account) => (
                    <option key={account.code} value={account.code}>{account.code} - {account.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="filter-min-amount">Montant min.</label>
                <input
                  id="filter-min-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minAmount}
                  onChange={(event) => setFilters(prev => ({ ...prev, minAmount: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="filter-max-amount">Montant max.</label>
                <input
                  id="filter-max-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxAmount}
                  onChange={(event) => setFilters(prev => ({ ...prev, maxAmount: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1" htmlFor="filter-status">Statut</label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(event) => setFilters(prev => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                >
                  <option value="">Tous les statuts</option>
                  <option value="validated">Validé</option>
                  <option value="draft">Brouillon</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
            </form>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({ startDate: "", endDate: "", account: "", minAmount: "", maxAmount: "", status: "" });
                }}
                className="text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-white"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-sm px-3 py-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0B7C74]"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">N° Écriture</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Référence</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Débit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Crédit</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Aucune écriture</td></tr>
              ) : filteredEntries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{entry.id}</td>
                  <td className="py-3 px-4 text-sm">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-sm">{entry.reference}</td>
                  <td className="py-3 px-4">{entry.description}</td>
                  <td className="py-3 px-4 font-mono text-sm">{entry.debit?.account}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {entry.debit?.amount > 0 ? new Intl.NumberFormat('fr-FR').format(entry.debit.amount) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    {entry.credit?.amount > 0 ? new Intl.NumberFormat('fr-FR').format(entry.credit.amount) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Validé</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Nouvelle écriture comptable</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input name="description" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Compte débit</label>
                  <select name="debitAccount" required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Sélectionner</option>
                    {accounts.map(acc => (
                      <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Montant débit</label>
                  <input name="debitAmount" type="number" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Compte crédit</label>
                  <select name="creditAccount" required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Sélectionner</option>
                    {accounts.map(acc => (
                      <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Montant crédit</label>
                  <input name="creditAmount" type="number" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}