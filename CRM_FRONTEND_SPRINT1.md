# 🎨 FRONTEND CRM - SPRINT 1 (Code Prêt)

Code React/Next.js pour page liste contacts + formulaire création.

---

## 📂 STRUCTURE

```
bms-web/src/app/crm/
├── contacts/
│   ├── page.tsx (Liste)
│   ├── new/
│   │   └── page.tsx (Nouveau)
│   └── [id]/
│       └── page.tsx (Détail/Édition)
└── components/
    ├── ContactCard.tsx
    └── ContactForm.tsx
```

---

## 1️⃣ PAGE LISTE CONTACTS

```typescript
// bms-web/src/app/crm/contacts/page.tsx

"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Plus, Search, Filter, Users, Mail, Phone, Building2 } from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  type: 'client' | 'prospect' | 'supplier' | 'partner';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  lifetimeValue: number;
  leadScore: number;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  async function loadContacts() {
    const cid = getCompanyId();
    if (!cid) return;

    setLoading(true);
    try {
      const data = await apiGet("/api/v1/crm/contacts", {
        companyId: cid,
        search: search || undefined,
        type: typeFilter || undefined,
        page: 1,
        limit: 50,
      });
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadContacts(); }, [search, typeFilter]);

  // Listener changement société
  useEffect(() => {
    const handleCompanyChange = () => loadContacts();
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, [search, typeFilter]);

  function getDisplayName(contact: Contact) {
    if (contact.companyName) return contact.companyName;
    return `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Sans nom";
  }

  function getTypeBadge(type: string) {
    const styles = {
      client: "bg-emerald-100 text-emerald-700",
      prospect: "bg-blue-100 text-blue-700",
      supplier: "bg-orange-100 text-orange-700",
      partner: "bg-purple-100 text-purple-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {type === 'client' && 'Client'}
        {type === 'prospect' && 'Prospect'}
        {type === 'supplier' && 'Fournisseur'}
        {type === 'partner' && 'Partenaire'}
      </span>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-app-primary" />
          <div>
            <h1 className="text-2xl font-bold">Contacts CRM</h1>
            <p className="text-sm text-slate-500">{total} contacts au total</p>
          </div>
        </div>
        <Link href="/crm/contacts/new">
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau contact
          </button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input">
            <option value="">Tous les types</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
            <option value="supplier">Fournisseurs</option>
            <option value="partner">Partenaires</option>
          </select>
        </div>
      </div>

      {/* Liste Grid */}
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun contact</h3>
          <p className="text-slate-500 mb-4">Commencez par créer votre premier contact</p>
          <Link href="/crm/contacts/new">
            <button className="btn-primary">Créer un contact</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Link key={contact.id} href={`/crm/contacts/${contact.id}`}>
              <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-app-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-app-primary">
                        {getDisplayName(contact).substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{getDisplayName(contact)}</h3>
                      {contact.firstName && contact.lastName && contact.companyName && (
                        <p className="text-sm text-slate-500">
                          {contact.firstName} {contact.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  {getTypeBadge(contact.type)}
                </div>

                <div className="space-y-2 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.city && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4" />
                      <span>{contact.city}</span>
                    </div>
                  )}
                </div>

                {contact.lifetimeValue > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500">Valeur à vie</p>
                    <p className="font-semibold text-emerald-600">
                      {contact.lifetimeValue.toLocaleString()} FCFA
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 2️⃣ FORMULAIRE CRÉATION

```typescript
// bms-web/src/app/crm/contacts/new/page.tsx

"use client";
import { useState } from "react";
import { apiPost, getCompanyId } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function NewContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'client',
    companyName: '',
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: 'BJ',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cid = getCompanyId();
    if (!cid) return;

    setLoading(true);
    try {
      await apiPost("/api/v1/crm/contacts", {
        ...formData,
        companyId: cid,
      });
      router.push("/crm/contacts");
    } catch (error: any) {
      alert(error.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <h1 className="text-2xl font-bold">Nouveau Contact</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Type de contact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['client', 'prospect', 'supplier', 'partner'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="radio"
                />
                <span className="capitalize">
                  {type === 'client' && 'Client'}
                  {type === 'prospect' && 'Prospect'}
                  {type === 'supplier' && 'Fournisseur'}
                  {type === 'partner' && 'Partenaire'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Informations */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nom de l'entreprise</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="input"
                placeholder="SARL Tech Solutions"
              />
            </div>

            <div>
              <label className="label">Fonction</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="input"
                placeholder="Directeur Commercial"
              />
            </div>

            <div>
              <label className="label">Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="input"
                placeholder="Jean"
              />
            </div>

            <div>
              <label className="label">Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="input"
                placeholder="Dupont"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Coordonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input"
                placeholder="jean.dupont@techsolutions.com"
                required
              />
            </div>

            <div>
              <label className="label">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="+229 21 30 40 50"
              />
            </div>

            <div>
              <label className="label">Mobile</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                className="input"
                placeholder="+229 97 12 34 56"
              />
            </div>

            <div>
              <label className="label">Site web</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="input"
                placeholder="www.techsolutions.com"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Adresse</h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">Adresse</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                className="input"
                placeholder="123 Avenue de la République"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="input"
                  placeholder="Cotonou"
                />
              </div>

              <div>
                <label className="label">Code postal</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Pays</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="input"
                >
                  <option value="BJ">Bénin</option>
                  <option value="TG">Togo</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="SN">Sénégal</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <label className="label">Notes internes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input"
            rows={4}
            placeholder="Informations complémentaires..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary flex-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 3️⃣ SIDEBAR NAVIGATION

```typescript
// Ajouter dans bms-web/src/components/layout/Sidebar.tsx

const CRM_NAV = [
  { href: '/crm/contacts', label: 'Contacts', icon: Users },
  { href: '/crm/opportunities', label: 'Opportunités', icon: TrendingUp },
  { href: '/crm/activities', label: 'Activités', icon: Calendar },
];

// Dans le render:
<NavSection title="CRM" items={CRM_NAV} />
```

---

## ✅ TEST RAPIDE

```bash
# 1. Démarrer backend
cd bms/api-gateway
npm run start:dev

# 2. Démarrer frontend
cd bms-web
npm run dev

# 3. Accéder
http://localhost:3000/crm/contacts

# 4. Créer contact
http://localhost:3000/crm/contacts/new
```

**Sprint 1 complet prêt en 2 semaines !** 🚀
