"use client";
// Trésorerie - MODE DYNAMIQUE avec API backend
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle, Download, X, RefreshCw } from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  currency: string;
  status: "Connecté" | "Manuel";
  lastUpdated: string;
}

interface TreasuryForecast {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface TreasuryData {
  accounts: BankAccount[];
  forecast: TreasuryForecast[];
  totalBalance: number;
  totalInflow: number;
  totalOutflow: number;
  period: string;
}

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    bank: "",
    balance: "",
    currency: "FCFA",
    status: "Manuel" as "Connecté" | "Manuel"
  });

  // Charger les données de trésorerie depuis l'API
  const loadTreasuryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const apiData = await apiGet('/api/v1/treasury/summary', { companyId });
      
      // Transformer les données API au format attendu
      const transformedData: TreasuryData = {
        accounts: apiData.accounts || [],
        forecast: apiData.forecast || [],
        totalBalance: apiData.totalBalance || 0,
        totalInflow: apiData.totalInflow || 0,
        totalOutflow: apiData.totalOutflow || 0,
        period: apiData.period || 'Trésorerie actuelle'
      };
      
      setData(transformedData);
      triggerToast("success", "Trésorerie chargée avec succès");
    } catch (err: any) {
      console.error('Erreur chargement trésorerie:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      triggerToast("error", errorMessage);
      
      // Gérer spécifiquement l'erreur 404 (endpoint non disponible)
      if (err?.message?.includes('404') || err?.status === 404) {
        triggerToast("info", "Endpoint trésorerie en cours de déploiement. Affichage des données de démonstration.");
      }
      
      // En cas d'erreur, afficher des données de démonstration
      const mockAccounts: BankAccount[] = [
        { id: "1", name: "Compte Principal BNI", bank: "BNI", balance: 15000000, currency: "FCFA", status: "Connecté", lastUpdated: "2025-01-19" },
        { id: "2", name: "Compte USD", bank: "Ecobank", balance: 25000, currency: "USD", status: "Connecté", lastUpdated: "2025-01-19" },
        { id: "3", name: "Compte Épargne", bank: "BOA", balance: 5000000, currency: "FCFA", status: "Manuel", lastUpdated: "2025-01-18" }
      ];
      
      const mockForecast: TreasuryForecast[] = [
        { date: "2025-01-20", inflow: 2000000, outflow: 1500000, balance: 15500000 },
        { date: "2025-01-27", inflow: 1800000, outflow: 2200000, balance: 15100000 },
        { date: "2025-02-03", inflow: 2500000, outflow: 1800000, balance: 15800000 },
        { date: "2025-02-10", inflow: 2200000, outflow: 2000000, balance: 16000000 }
      ];
      
      const totalBalance = mockAccounts.reduce((sum: number, account: BankAccount) => sum + account.balance, 0);
      const totalInflow = mockForecast.reduce((sum: number, item: TreasuryForecast) => sum + item.inflow, 0);
      const totalOutflow = mockForecast.reduce((sum: number, item: TreasuryForecast) => sum + item.outflow, 0);
      
      setData({
        accounts: mockAccounts,
        forecast: mockForecast,
        totalBalance,
        totalInflow,
        totalOutflow,
        period: 'Données de démonstration'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadTreasuryData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.bank || !newAccount.balance) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setCreatingAccount(true);
    try {
      // Simuler la création (remplacer par appel API réel)
      const account: BankAccount = {
        id: Date.now().toString(),
        name: newAccount.name,
        bank: newAccount.bank,
        balance: parseFloat(newAccount.balance),
        currency: newAccount.currency,
        status: newAccount.status,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      if (data) {
        setData({
          ...data,
          accounts: [account, ...data.accounts],
          totalBalance: data.totalBalance + account.balance
        });
      }
      
      setIsCreateModalOpen(false);
      setNewAccount({
        name: "",
        bank: "",
        balance: "",
        currency: "FCFA",
        status: "Manuel"
      });
    } catch (error) {
      console.error("Erreur création compte:", error);
      alert("Erreur lors de la création du compte");
    } finally {
      setCreatingAccount(false);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Trésorerie</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la trésorerie...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur sans données
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Trésorerie</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadTreasuryData}
                className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trésorerie</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTreasuryData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Download className="w-4 h-4" />
            Export SEPA
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>
      </div>

      {/* KPIs Trésorerie */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Solde total</div>
              <div className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR').format(data.totalBalance)} FCFA
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Entrées prévues</div>
              <div className="text-xl font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR').format(data.totalInflow)} FCFA
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Sorties prévues</div>
              <div className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat('fr-FR').format(data.totalOutflow)} FCFA
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Comptes actifs</div>
              <div className="text-xl font-bold text-gray-900">
                {data.accounts.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comptes bancaires */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Comptes bancaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.accounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-600">{account.bank}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  account.status === 'Connecté' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.status === 'Connecté' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  {account.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solde</span>
                  <span className="font-bold text-lg">
                    {new Intl.NumberFormat('fr-FR').format(account.balance)} {account.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Dernière mise à jour</span>
                  <span className="text-xs text-gray-600">{new Date(account.lastUpdated).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prévisionnel de trésorerie */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Prévisionnel de trésorerie</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Entrées</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Sorties</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde prévisionnel</th>
              </tr>
            </thead>
            <tbody>
              {data.forecast.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {new Intl.NumberFormat('fr-FR').format(item.inflow)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    {new Intl.NumberFormat('fr-FR').format(item.outflow)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(item.balance)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création de compte */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Nouveau compte bancaire</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du compte</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
                <input
                  type="text"
                  value={newAccount.bank}
                  onChange={(e) => setNewAccount({...newAccount, bank: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solde initial</label>
                <input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                <select
                  value={newAccount.currency}
                  onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="FCFA">FCFA</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={newAccount.status}
                  onChange={(e) => setNewAccount({...newAccount, status: e.target.value as "Connecté" | "Manuel"})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Manuel">Manuel</option>
                  <option value="Connecté">Connecté</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:opacity-50"
                >
                  {creatingAccount ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Indicateur mode démo si erreur */}
      {error && data && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Mode démonstration: {data.period}
            </p>
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
  );
}
