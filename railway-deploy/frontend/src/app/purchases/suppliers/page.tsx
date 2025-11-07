"use client";
import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Package,
  DollarSign,
  Calendar,
  MoreVertical
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
  totalOrders?: number;
  totalAmount?: number;
  rating?: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const taxIdRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        return;
      }
      const result = await apiGet('/api/v1/purchases/suppliers', { companyId });
      setSuppliers(Array.isArray(result) ? result : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      return;
    }

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }
      await apiDelete(`/api/v1/purchases/suppliers/${supplierId}`, { companyId });
      triggerToast("success", "Fournisseur supprimé avec succès");
      await loadSuppliers();
    } catch (err: any) {
      triggerToast("error", err?.message || "Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }

      const formData = {
        name: nameRef.current?.value || "",
        email: emailRef.current?.value || "",
        phone: phoneRef.current?.value || "",
        address: addressRef.current?.value || "",
        taxId: taxIdRef.current?.value || "",
        description: descriptionRef.current?.value || "",
        status: statusRef.current?.value || "active",
      };

      if (!formData.name) {
        triggerToast("error", "Le nom est requis");
        return;
      }

      if (editingSupplier) {
        await apiPut(`/api/v1/purchases/suppliers/${editingSupplier.id}`, formData, { companyId });
        triggerToast("success", "Fournisseur modifié avec succès");
      } else {
        await apiPost('/api/v1/purchases/suppliers', formData, { companyId });
        triggerToast("success", "Fournisseur créé avec succès");
      }

      await loadSuppliers();
      closeForm();
    } catch (err: any) {
      triggerToast("error", err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  const stats = {
    total: filteredSuppliers.length,
    active: filteredSuppliers.filter(s => s.status === 'active').length,
    totalValue: filteredSuppliers.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    totalOrders: filteredSuppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0),
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0D9488] mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement des fournisseurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] via-[#0B7C74] to-[#0A6B66] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Fournisseurs</h1>
              <p className="text-white/90 text-lg">Gérez votre base de fournisseurs</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadSuppliers}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Nouveau fournisseur
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Total</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Actifs</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Commandes</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Valeur totale</div>
          <div className="text-2xl font-bold text-[#0D9488]">{(stats.totalValue / 1000000).toFixed(1)}M</div>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
          />
        </div>
      </div>

      {/* Supplier Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white">
              <h2 className="text-2xl font-bold">
                {editingSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Nom *</label>
                  <input
                    ref={nameRef}
                    type="text"
                    defaultValue={editingSupplier?.name || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
                  <input
                    ref={emailRef}
                    type="email"
                    defaultValue={editingSupplier?.email || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Téléphone</label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    defaultValue={editingSupplier?.phone || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Adresse</label>
                  <input
                    ref={addressRef}
                    type="text"
                    defaultValue={editingSupplier?.address || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">NIF / Tax ID</label>
                  <input
                    ref={taxIdRef}
                    type="text"
                    defaultValue={editingSupplier?.taxId || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Statut</label>
                  <select
                    ref={statusRef}
                    defaultValue={editingSupplier?.status || "active"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
                  <textarea
                    ref={descriptionRef}
                    defaultValue={editingSupplier?.description || ""}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] disabled:opacity-50 font-semibold"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Enregistrement..." : editingSupplier ? "Modifier" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                  disabled={saving}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <div className="text-slate-500 mb-4 font-medium">Aucun fournisseur trouvé</div>
            <button
              onClick={handleCreate}
              className="text-[#0D9488] hover:text-[#0B7C74] underline font-semibold"
            >
              Créer votre premier fournisseur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="group relative bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-[#0D9488] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0D9488] to-[#0B7C74] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                      {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 mb-1 truncate">{supplier.name}</div>
                      {supplier.taxId && (
                        <div className="text-xs text-slate-500">NIF: {supplier.taxId}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                </div>

                {supplier.description && (
                  <div className="text-sm text-slate-600 mb-4 line-clamp-2">{supplier.description}</div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    supplier.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {supplier.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                  {supplier.totalAmount && supplier.totalAmount > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#0D9488]">
                        {(supplier.totalAmount / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-slate-500">FCFA</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-6 py-4 text-sm shadow-2xl flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
              : "bg-gradient-to-r from-rose-500 to-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
