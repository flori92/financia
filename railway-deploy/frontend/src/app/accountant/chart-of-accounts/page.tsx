"use client";
// Page Plan Comptable - Fix Railway deployment issue
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState } from "react";
import { Plus, Search, Filter, Download, Upload, X } from "lucide-react";

export default function ChartOfAccountsPage() {
  const [accounts] = useState([
    { code: "101000", name: "Capital social", type: "Capitaux propres", balance: 100000 },
    { code: "411000", name: "Clients", type: "Actif circulant", balance: 45000 },
    { code: "401000", name: "Fournisseurs", type: "Dettes", balance: -25000 },
    { code: "701000", name: "Ventes de marchandises", type: "Produits", balance: -150000 },
    { code: "607000", name: "Achats de marchandises", type: "Charges", balance: 80000 }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);
  const [activeAction, setActiveAction] = useState<{ type: "import" | "export" | "create" | "edit"; payload?: any } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  };

  const handleImport = () => {
    setActiveAction({ type: "import" });
    triggerToast("info", "Import CSV/Excel disponible prochainement.");
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
                  <td className={`py-3 px-4 text-right font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('fr-FR').format(Math.abs(account.balance))} FCFA
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