"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserPlus,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Star
} from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  type: 'client' | 'prospect' | 'supplier' | 'partner';
  status: 'active' | 'inactive' | 'archived';
  lifetimeValue?: number;
  createdAt: string;
  address?: string;
  website?: string;
  rating?: number;
}

const TYPE_COLORS = {
  client: 'bg-blue-100 text-blue-700 border-blue-200',
  prospect: 'bg-amber-100 text-amber-700 border-amber-200',
  supplier: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  partner: 'bg-purple-100 text-purple-700 border-purple-200',
};

const TYPE_LABELS = {
  client: 'Client',
  prospect: 'Prospect',
  supplier: 'Fournisseur',
  partner: 'Partenaire',
};

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  archived: 'bg-rose-100 text-rose-700 border-rose-200',
};

const STATUS_LABELS = {
  active: 'Actif',
  inactive: 'Inactif',
  archived: 'Archivé',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form refs
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContacts();
  }, [search, typeFilter, statusFilter, page]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      const params: any = {
        companyId,
        page: page.toString(),
        limit: '20',
      };

      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await apiGet("/api/v1/crm/contacts", params);
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      setError(err.message || "Erreur lors du chargement des contacts");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      return;
    }

    try {
      const companyId = getCompanyId();
      await apiDelete(`/api/v1/crm/contacts/${contactId}`, { companyId });
      triggerToast("success", "Contact supprimé avec succès");
      await loadContacts();
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
        firstName: firstNameRef.current?.value || "",
        lastName: lastNameRef.current?.value || "",
        companyName: companyNameRef.current?.value || "",
        email: emailRef.current?.value || "",
        phone: phoneRef.current?.value || "",
        position: positionRef.current?.value || "",
        type: typeRef.current?.value || "prospect",
        status: statusRef.current?.value || "active",
        address: addressRef.current?.value || "",
        website: websiteRef.current?.value || "",
      };

      if (!formData.email) {
        triggerToast("error", "L'email est requis");
        return;
      }

      if (editingContact) {
        await apiPut(`/api/v1/crm/contacts/${editingContact.id}`, formData, { companyId });
        triggerToast("success", "Contact modifié avec succès");
      } else {
        await apiPost("/api/v1/crm/contacts", formData, { companyId });
        triggerToast("success", "Contact créé avec succès");
      }

      await loadContacts();
      closeForm();
    } catch (err: any) {
      triggerToast("error", err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const getContactName = (contact: Contact) => {
    if (contact.companyName) return contact.companyName;
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    if (contact.firstName) return contact.firstName;
    return contact.email || "Contact sans nom";
  };

  const getInitials = (contact: Contact) => {
    const name = getContactName(contact);
    if (contact.companyName) {
      return contact.companyName.substring(0, 2).toUpperCase();
    }
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const stats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    clients: contacts.filter(c => c.type === 'client').length,
    prospects: contacts.filter(c => c.type === 'prospect').length,
    totalValue: contacts.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0),
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0D9488] mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement des contacts...</p>
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
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Contacts CRM</h1>
              <p className="text-white/90 text-lg">Gérez votre base de contacts professionnels</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold"
            >
              <UserPlus className="w-5 h-5" />
              Nouveau contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Total</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Actifs</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Clients</div>
          <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Prospects</div>
          <div className="text-2xl font-bold text-amber-600">{stats.prospects}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
          <div className="text-slate-600 text-sm font-medium mb-1">Valeur totale</div>
          <div className="text-2xl font-bold text-[#0D9488]">{(stats.totalValue / 1000000).toFixed(1)}M</div>
        </div>
      </div>

      {/* Filters et recherche */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              placeholder="Rechercher par nom, email, entreprise..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="client">Client</option>
            <option value="prospect">Prospect</option>
            <option value="supplier">Fournisseur</option>
            <option value="partner">Partenaire</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white">
              <h2 className="text-2xl font-bold">
                {editingContact ? "Modifier le contact" : "Nouveau contact"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Prénom</label>
                  <input
                    ref={firstNameRef}
                    type="text"
                    defaultValue={editingContact?.firstName || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Nom</label>
                  <input
                    ref={lastNameRef}
                    type="text"
                    defaultValue={editingContact?.lastName || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Entreprise</label>
                  <input
                    ref={companyNameRef}
                    type="text"
                    defaultValue={editingContact?.companyName || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Email *</label>
                  <input
                    ref={emailRef}
                    type="email"
                    defaultValue={editingContact?.email || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Téléphone</label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    defaultValue={editingContact?.phone || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Poste</label>
                  <input
                    ref={positionRef}
                    type="text"
                    defaultValue={editingContact?.position || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Type</label>
                  <select
                    ref={typeRef}
                    defaultValue={editingContact?.type || "prospect"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="client">Client</option>
                    <option value="supplier">Fournisseur</option>
                    <option value="partner">Partenaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Statut</label>
                  <select
                    ref={statusRef}
                    defaultValue={editingContact?.status || "active"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Adresse</label>
                  <input
                    ref={addressRef}
                    type="text"
                    defaultValue={editingContact?.address || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Site web</label>
                  <input
                    ref={websiteRef}
                    type="url"
                    defaultValue={editingContact?.website || ""}
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
                  {saving ? "Enregistrement..." : editingContact ? "Modifier" : "Créer"}
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

      {/* Contacts Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {contacts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <div className="text-slate-500 mb-4 font-medium">Aucun contact trouvé</div>
            <button
              onClick={handleCreate}
              className="text-[#0D9488] hover:text-[#0B7C74] underline font-semibold"
            >
              Créer votre premier contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="group relative bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-[#0D9488] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0D9488] to-[#0B7C74] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getInitials(contact)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 mb-1 truncate">{getContactName(contact)}</div>
                      {contact.position && (
                        <div className="text-sm text-slate-600 truncate">{contact.position}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{contact.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${TYPE_COLORS[contact.type]}`}>
                      {TYPE_LABELS[contact.type]}
                    </span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[contact.status]}`}>
                      {STATUS_LABELS[contact.status]}
                    </span>
                  </div>
                  {contact.lifetimeValue && contact.lifetimeValue > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#0D9488]">
                        {(contact.lifetimeValue / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-slate-500">FCFA</div>
                    </div>
                  )}
                </div>

                <Link
                  href={`/crm/contacts/${contact.id}`}
                  className="absolute inset-0 rounded-xl"
                  title="Voir les détails"
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {contacts.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="text-sm text-slate-600">
              {contacts.length} sur {total} contacts
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= total}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
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
