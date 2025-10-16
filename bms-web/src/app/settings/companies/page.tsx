"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete, getCompanyId } from "@/lib/api";

export default function CompaniesManagementPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function refresh() {
    setLoading(true);
    try {
      const list = await apiGet('/api/v1/companies') as any[];
      setCompanies(list || []);
    } catch (e) {
      showError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate() {
    if (!name.trim()) { showError('Le nom de la société est obligatoire'); return; }
    try {
      await apiPost('/api/v1/companies', { name, taxId, address });
      showSuccess('Société créée');
      setName(""); setTaxId(""); setAddress(""); setShowForm(false);
      await refresh();
    } catch (e) {
      showError(String(e));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette société ?')) return;
    try {
      await apiDelete(`/api/v1/companies/${id}`);
      showSuccess('Société supprimée');
      await refresh();
    } catch (e) {
      showError(String(e));
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestion des Sociétés</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">
          {showForm ? 'Annuler' : 'Nouvelle société'}
        </button>
      </div>

      {showForm && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Nouvelle société</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la société *</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Ex: SARL Entreprise ABC" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIF / IFU</label>
              <input value={taxId} onChange={e=>setTaxId(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Ex: 0202301234567" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
              <input value={address} onChange={e=>setAddress(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Ex: Cotonou, Bénin" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleCreate} className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E]">Créer</button>
            <button onClick={() => setShowForm(false)} className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-4 py-2 hover:bg-slate-50">Annuler</button>
          </div>
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Liste des sociétés ({companies.length})</h3>
        {loading ? (
          <div className="text-sm text-slate-500">Chargement…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-app-border">
                <th className="pb-2">Nom</th>
                <th className="pb-2">NIF / IFU</th>
                <th className="pb-2">Adresse</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c: any) => (
                <tr key={c.id} className="border-b border-app-border">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 text-slate-600">{c.taxId || '—'}</td>
                  <td className="py-3 text-slate-600">{c.address || '—'}</td>
                  <td className="py-3">
                    <button onClick={() => handleDelete(c.id)} className="text-rose-700 hover:underline text-sm">Supprimer</button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-slate-500 text-center">Aucune société</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
