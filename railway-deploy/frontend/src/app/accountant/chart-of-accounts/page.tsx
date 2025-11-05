"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Download, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { apiGet, apiPost, apiPut, getCompanyId } from "@/lib/api";

interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  syscohadaClass: number;
  balance?: number;
}

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);
  const [activeAction, setActiveAction] = useState<{ type: "import" | "export" | "create" | "edit"; payload?: Account | null } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form refs
  const accountNumberRef = useRef<HTMLInputElement>(null);
  const accountNameRef = useRef<HTMLInputElement>(null);
  const accountTypeRef = useRef<HTMLSelectElement>(null);
  const syscohadaClassRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      const data = await apiGet("/api/v1/accounting/chart-of-accounts", { companyId });
      setAccounts(data);
    } catch (err: any) {
      console.error("Erreur chargement plan comptable:", err);
      setError(err.message || "Erreur lors du chargement du plan comptable");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
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
      const companyId = getCompanyId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(
        `${apiUrl}/api/v1/accounting/export/chart-of-accounts?companyId=${companyId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/csv',
            'Authorization': `Bearer ${localStorage.getItem('bms_token')}`
          }
        }
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
      triggerToast("error", "Erreur lors de l'export.");
    }
  };

  const openCreateModal = () => {
    setActiveAction({ type: "create", payload: null });
    setShowModal(true);
  };

  const openEditModal = (account: Account) => {
    setActiveAction({ type: "edit", payload: account });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveAction(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }

      // Collect form data
      const formData = {
        companyId,
        accountNumber: accountNumberRef.current?.value || "",
        accountName: accountNameRef.current?.value || "",
        accountType: accountTypeRef.current?.value || "",
        syscohadaClass: parseInt(syscohadaClassRef.current?.value || "0", 10),
      };

      // Validate
      if (!formData.accountNumber || !formData.accountName) {
        triggerToast("error", "Le code et le libellé sont requis");
        return;
      }

      if (activeAction?.type === "edit" && activeAction.payload?.id) {
        // Update existing account
        await apiPut(`/api/v1/accounting/accounts/${activeAction.payload.id}`, formData);
        triggerToast("success", "Compte modifié avec succès !");
      } else {
        // Create new account
        await apiPost("/api/v1/accounting/accounts", formData);
        triggerToast("success", "Compte créé avec succès !");
      }

      // Reload accounts list
      await loadAccounts();
      closeModal();
    } catch (err: any) {
      console.error("Erreur enregistrement compte:", err);
      triggerToast("error", err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Erreur</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadAccounts}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plan comptable</h1>
          <p className="text-gray-600">Gestion du plan comptable SYSCOHADA</p>
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
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aucun compte trouvé. Créez votre premier compte.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{account.accountNumber}</td>
                    <td className="py-3 px-4">{account.accountName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {account.accountType} (Classe {account.syscohadaClass})
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${(account.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('fr-FR').format(Math.abs(account.balance || 0))} FCFA
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-800 text-white"
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
                  Plan comptable SYSCOHADA
                </p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100" disabled={saving}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code compte *</label>
                <input
                  ref={accountNumberRef}
                  type="text"
                  defaultValue={activeAction?.payload?.accountNumber || ""}
                  placeholder="Ex: 701000"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  disabled={saving}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Libellé *</label>
                <input
                  ref={accountNameRef}
                  type="text"
                  defaultValue={activeAction?.payload?.accountName || ""}
                  placeholder="Ex: Ventes de marchandises"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  disabled={saving}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    ref={accountTypeRef}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    defaultValue={activeAction?.payload?.accountType || "ASSET"}
                    disabled={saving}
                    required
                  >
                    <option value="ASSET">Actif</option>
                    <option value="LIABILITY">Passif</option>
                    <option value="EQUITY">Capitaux propres</option>
                    <option value="REVENUE">Produits</option>
                    <option value="EXPENSE">Charges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Classe SYSCOHADA *</label>
                  <input
                    ref={syscohadaClassRef}
                    type="number"
                    min="1"
                    max="8"
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    defaultValue={activeAction?.payload?.syscohadaClass || 1}
                    disabled={saving}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">1-8 (OHADA)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}