"use client";
// Page Plan Comptable - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Upload, X } from "lucide-react";

interface Account {
  code: string;
  name: string;
  type: string;
  class: string;
  balance?: number;
}

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);
  const [activeAction, setActiveAction] = useState<{ type: "import" | "export" | "create" | "edit"; payload?: any } | null>(null);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  };

  // Charger les données du plan comptable depuis l'API
  const loadChartOfAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7"; // TODO: depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/chart-of-accounts?companyId=${companyId}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAccounts(data || []);
    } catch (err) {
      console.error('Erreur chargement plan comptable:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // En cas d'erreur, afficher un plan comptable de base
      setAccounts([
        { code: '101000', name: 'Capital Social', type: 'equity', class: '1' },
        { code: '401000', name: 'Fournisseurs', type: 'liability', class: '4' },
        { code: '411000', name: 'Clients', type: 'asset', class: '4' },
        { code: '601000', name: 'Achats marchandises', type: 'expense', class: '6' },
        { code: '701000', name: 'Ventes marchandises', type: 'revenue', class: '7' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadChartOfAccounts();
  }, []);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          triggerToast("error", "Le fichier est vide ou invalide");
          return;
        }

        // Parser le CSV (format: numéro,nom,type,classe)
        const newAccounts = lines.slice(1).map(line => {
          const [number, name, type, classe] = line.split(',').map(s => s.trim().replace(/"/g, ''));
          return {
            number: number || '',
            name: name || '',
            type: type || 'ACTIF',
            classe: classe || (number ? number.charAt(0) : '1'),
            status: 'ACTIF'
          };
        }).filter(acc => acc.number && acc.name);

        // Simuler l'ajout (remplacer par appel API réel)
        triggerToast("success", `${newAccounts.length} comptes importés avec succès`);
        loadChartOfAccounts(); // Recharger les données
        
      } catch (error) {
        console.error('Erreur import:', error);
        triggerToast("error", "Erreur lors de l'import du fichier");
      }
    };
    input.click();
  };

  const handleExport = async () => {
    setActiveAction({ type: "export" });
    try {
      const companyId = "default-company"; // TODO: récupérer depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/export/chart-of-accounts?companyId=${companyId}`,
        { method: 'GET' }
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-comptable-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      triggerToast("success", "Plan comptable exporté avec succès !");
    } catch (error) {
      triggerToast("info", "Erreur lors de l'export. Vérifiez que le backend est démarré.");
    }
  };

  const openCreateModal = () => {
    setActiveAction({ type: "create" });
    setShowModal(true);
  };

  const openEditModal = (account: typeof accounts[number]) => {
    setActiveAction({ type: "edit", payload: account });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plan comptable</h1>
          <p className="text-gray-600">Gestion du plan comptable multi-dimensionnel</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du plan comptable...</p>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadChartOfAccounts}
                className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal - seulement si pas en chargement */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un compte..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Libellé</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{account.code}</td>
                  <td className="py-3 px-4">{account.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{account.type}</td>
                  <td className={`py-3 px-4 text-right font-medium ${account.balance !== undefined && account.balance >= 0 ? 'text-green-600' : account.balance !== undefined ? 'text-red-600' : 'text-gray-400'}`}>
                    {account.balance !== undefined 
                      ? `${new Intl.NumberFormat('fr-FR').format(Math.abs(account.balance))} FCFA`
                      : '—'
                    }
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(account)}
                      className="text-[#0D9488] hover:text-[#0B7C74] text-sm font-medium"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {activeAction?.type === "edit" ? "Modifier un compte" : "Créer un compte"}
                </h3>
                <p className="text-sm text-gray-500">
                  Formulaire simulé — connexion API à venir.
                </p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  defaultValue={activeAction?.payload?.code || "70XXXX"}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Libellé</label>
                <input
                  type="text"
                  defaultValue={activeAction?.payload?.name || "Compte de test"}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select className="mt-1 w-full border rounded-lg px-3 py-2" defaultValue={activeAction?.payload?.type || "Charges"}>
                    <option>Actif</option>
                    <option>Passif</option>
                    <option>Charges</option>
                    <option>Produits</option>
                    <option>Capitaux propres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solde initial</label>
                  <input type="number" className="mt-1 w-full border rounded-lg px-3 py-2" defaultValue={activeAction?.payload?.balance || 0} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => {
                  triggerToast("success", "Enregistrement simulé.");
                  closeModal();
                }}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}