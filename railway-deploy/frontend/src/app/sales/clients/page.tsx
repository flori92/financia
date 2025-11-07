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
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  MoreVertical
} from "lucide-react";

interface SalesClient {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  type: 'individual' | 'company';
  status: 'active' | 'inactive' | 'prospect';
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate?: string;
  createdAt: string;
  rating: number;
}

export default function SalesClientsPage() {
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<SalesClient | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        return;
      }
      const result = await apiGet('/api/v1/sales/clients', { companyId });
      setClients(Array.isArray(result) ? result : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client: SalesClient) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }
    
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }
      await apiDelete(`/api/v1/sales/clients/${clientId}`, { companyId });
      triggerToast("success", "Client supprimé avec succès");
      await loadClients();
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
        company: companyRef.current?.value || "",
        email: emailRef.current?.value || "",
        phone: phoneRef.current?.value || "",
        address: addressRef.current?.value || "",
        type: typeRef.current?.value || "individual",
        status: statusRef.current?.value || "prospect",
        rating: 0,
      };

      if (!formData.name || !formData.email) {
        triggerToast("error", "Nom et email sont requis");
        return;
      }

      if (editingClient) {
        await apiPut(`/api/v1/sales/clients/${editingClient.id}`, formData, { companyId });
        triggerToast("success", "Client modifié avec succès");
      } else {
        await apiPost('/api/v1/sales/clients', formData, { companyId });
        triggerToast("success", "Client créé avec succès");
      }

      await loadClients();
      closeForm();
    } catch (err: any) {
      triggerToast("error", err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(client => !statusFilter || client.status === statusFilter);

  const stats = {
    total: filteredClients.length,
    active: filteredClients.filter(c => c.status === 'active').length,
    prospects: filteredClients.filter(c => c.status === 'prospect').length,
    totalRevenue: filteredClients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0),
    totalOrders: filteredClients.reduce((sum, c) => sum + (c.totalOrders || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Actif" },
      inactive: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Inactif" },
      prospect: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Prospect" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-amber-400 fill-current' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && clients.length === 0) {
  return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0D9488] mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] via-[#0B7C74] to-[#0A6B66] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Clients</h1>
              <p className="text-white/90 text-lg">Gestion de la base clients et prospects</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadClients}
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
                Nouveau Client
              </button>
            </div>
          </div>
            </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Total Clients</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Clients Actifs</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                    </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Prospects</div>
          <div className="text-2xl font-bold text-blue-600">{stats.prospects}</div>
                  </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Commandes</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalOrders}</div>
                </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">CA Total</div>
          <div className="text-2xl font-bold text-[#0D9488]">{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
                  </div>
                </div>

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="prospect">Prospect</option>
          </select>
                  </div>
                </div>

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white">
              <h2 className="text-2xl font-bold">
                {editingClient ? "Modifier le client" : "Nouveau client"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Nom complet *</label>
                  <input
                    ref={nameRef}
                    type="text"
                    defaultValue={editingClient?.name || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Entreprise (optionnel)</label>
                  <input
                    ref={companyRef}
                    type="text"
                    defaultValue={editingClient?.company || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Email *</label>
                  <input
                    ref={emailRef}
                    type="email"
                    defaultValue={editingClient?.email || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Téléphone *</label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    defaultValue={editingClient?.phone || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Adresse *</label>
                  <input
                    ref={addressRef}
                    type="text"
                    defaultValue={editingClient?.address || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Type</label>
                  <select
                    ref={typeRef}
                    defaultValue={editingClient?.type || "individual"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  >
                    <option value="individual">Particulier</option>
                    <option value="company">Entreprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Statut</label>
                  <select
                    ref={statusRef}
                    defaultValue={editingClient?.status || "prospect"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] disabled:opacity-50 font-semibold"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Enregistrement..." : editingClient ? "Modifier" : "Créer"}
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

      {/* Clients Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <div className="text-slate-500 mb-4 font-medium">Aucun client trouvé</div>
            <button
              onClick={handleCreate}
              className="text-[#0D9488] hover:text-[#0B7C74] underline font-semibold"
            >
              Créer votre premier client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="group relative bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-[#0D9488] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0D9488] to-[#0B7C74] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 mb-1 truncate">{client.name}</div>
                      {client.company && (
                        <div className="text-sm text-slate-600 truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {client.company}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 mb-4">
                  {getStatusBadge(client.status)}
                  {getRatingStars(client.rating)}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Commandes</div>
                    <div className="text-lg font-bold text-slate-900">{client.totalOrders}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">CA Total</div>
                    <div className="text-lg font-bold text-[#0D9488]">
                      {(client.totalRevenue / 1000).toFixed(0)}K
                    </div>
                  </div>
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
