"use client";
import { useEffect, useState } from "react";
import { SimpleTable } from "@/components/table/SimpleTable";
import { KpiCard } from "@/components/kpi/KpiCard";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/lib/api";
import { FileUpload } from "@/components/upload/FileUpload";

const columns = [
  { key: "date", header: "Date" },
  { key: "invoice", header: "Facture" },
  { key: "party", header: "Client" },
  { key: "total", header: "Total" },
  { key: "status", header: "Statut", render: (row: any) => (
      row.status === 'paid' ? <span className="badge-success">Payée</span>
      : row.status === 'overdue' ? <span className="badge-danger">En retard</span>
      : <span className="badge-warning">À payer</span>
    )
  },
  { key: "actions", header: "Actions", render: (row: any) => (
    <div className="flex gap-2">
      <button className="text-app-primary hover:underline">Voir</button>
      <button className="text-slate-500 hover:underline">PDF</button>
      <button onClick={row.onSubmit} className="text-emerald-700 hover:underline">Soumettre</button>
      <button onClick={row.onCancel} className="text-rose-700 hover:underline">Annuler</button>
      <button onClick={row.onSend} className="text-sky-700 hover:underline">Envoyer</button>
      <button onClick={row.onAttach} className="text-slate-700 hover:underline">Pièces</button>
    </div>
  )},
];

function nf(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v || 0));
  return new Intl.NumberFormat("fr-FR").format(isNaN(n) ? 0 : n) + " FCFA";
}

function fd(s: any) {
  const d = s ? new Date(s) : null;
  if (!d || isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR");
}

function getCompanyId() {
  if (typeof window !== "undefined") return window.localStorage.getItem("companyId") || undefined;
  return undefined;
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([
    { date: "05/03/2025", invoice: "FINV-2025-003", party: "Société ABC", total: "590 000 FCFA", status: "due" },
    { date: "24/02/2025", invoice: "FINV-2025-002", party: "Global Services", total: "118 000 FCFA", status: "paid" },
    { date: "25/01/2025", invoice: "FINV-2025-001", party: "Entreprise XYZ", total: "224 700 FCFA", status: "overdue" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any[]>([]);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<Record<string, boolean>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    partyName: '',
    amount: '',
    taxPercent: '0',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    description: '',
    invoiceType: 'sales' as 'sales'|'purchase',
    autoPostJournal: false,
    autoServiceType: 'services' as 'goods'|'services',
  });

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  function rebuild(list: any[]) {
    const mapped = (list || []).map((inv: any) => ({
      id: inv.id,
      date: fd(inv.createdAt || inv.postingDate || inv.date),
      invoice: inv.invoiceNumber || inv.name || inv.id,
      party: inv.partyName || inv.customerName || inv.party || inv.partyId,
      total: nf(inv.grandTotal || inv.total || inv.amount || inv.totalAmount),
      status: inv.status || inv.paymentStatus || 'due',
      onSubmit: () => handleSubmit(inv.id),
      onCancel: () => handleCancel(inv.id),
      onSend: () => handleSend(inv.id, 'whatsapp'),
      onAttach: () => handleAttach(inv.id),
    }));
    if (mapped.length) setRows(mapped); else setRows([]);
  }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true); setError(null);
    try {
      const list = await apiGet('/api/v1/invoices', { companyId: cid }) as any[];
      setRaw(list); rebuild(list);
    } catch (e: unknown) {
      setError(String(e));
    } finally { setLoading(false); }
  }

  async function handleSubmit(id?: string) {
    try { if (!id) return; await apiPatch(`/api/v1/invoices/${id}/submit`, {}); showSuccess('Facture soumise'); await refresh(); } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }
  async function handleCancel(id?: string) {
    try { if (!id) return; await apiPatch(`/api/v1/invoices/${id}/cancel`, {}); showSuccess('Facture annulée'); await refresh(); } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }
  async function handleSend(id?: string, method: 'whatsapp'|'sms'|'email' = 'whatsapp') {
    try { if (!id) return; await apiPost(`/api/v1/invoices/${id}/send`, { method }); showSuccess('Facture envoyée'); await refresh(); } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  async function loadAttachments(invoiceId: string) {
    try {
      const list = await apiGet(`/api/v1/uploads/entity/invoice/${invoiceId}`) as any[];
      setAttachments(list || []);
      setSelectedAttachments({});
    } catch (e) {
      setAttachments([]);
      setSelectedAttachments({});
    }
  }

  function handleAttach(id?: string) {
    if (!id) return;
    setSelectedId(id);
    loadAttachments(id);
  }

  async function deleteAttachment(id: string) {
    try {
      await apiDelete(`/api/v1/uploads/${id}`);
      if (selectedId) await loadAttachments(selectedId);
      showSuccess('Pièce supprimée');
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  async function deleteSelectedAttachments() {
    try {
      const ids = Object.entries(selectedAttachments).filter(([_,v])=>v).map(([id])=>id);
      if (!ids.length) return;
      // Suppression batch
      await apiPost('/api/v1/uploads/batch-delete', { ids });
      if (selectedId) await loadAttachments(selectedId);
      showSuccess(`${ids.length} pièce(s) supprimée(s)`);
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  async function renameAttachment(id: string, currentName: string) {
    try {
      const name = typeof window !== 'undefined' ? window.prompt('Nouveau nom du fichier', currentName) : currentName;
      if (!name) return;
      await apiPatch(`/api/v1/uploads/${id}`, { originalName: name });
      if (selectedId) await loadAttachments(selectedId);
      showSuccess('Nom mis à jour');
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  async function handleCreateInvoice() {
    try {
      const cid = getCompanyId();
      if (!cid) { showError('Aucune société sélectionnée'); return; }
      if (!newInvoice.partyName.trim()) { showError('Le nom du client/fournisseur est obligatoire'); return; }
      if (!newInvoice.amount || parseFloat(newInvoice.amount) <= 0) { showError('Montant invalide'); return; }
      
      const body = {
        companyId: cid,
        invoiceType: newInvoice.invoiceType,
        invoiceDate: newInvoice.invoiceDate,
        dueDate: newInvoice.dueDate || new Date(Date.now() + 30*24*3600*1000).toISOString().slice(0, 10),
        partyName: newInvoice.partyName,
        currency: 'XOF',
        items: [
          {
            itemName: newInvoice.description || (newInvoice.autoServiceType === 'services' ? 'Prestation' : 'Marchandises'),
            description: newInvoice.description || undefined,
            quantity: 1,
            unit: 'unit',
            unitPrice: parseFloat(newInvoice.amount),
            taxPercent: parseFloat(newInvoice.taxPercent||'0') || 0,
            discountPercent: 0,
          }
        ],
        autoPostJournal: newInvoice.autoPostJournal,
        autoServiceType: newInvoice.autoServiceType,
      } as any;
      
      await apiPost('/api/v1/invoices', body);
      showSuccess('Facture créée');
      setNewInvoice({ partyName: '', amount: '', taxPercent: '0', invoiceDate: new Date().toISOString().slice(0, 10), dueDate: '', description: '', invoiceType: 'sales', autoPostJournal: false, autoServiceType: 'services' });
      setShowNewForm(false);
      await refresh();
    } catch (e) {
      showError(String(e));
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const h = () => { refresh(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  }, []);
  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Factures Clients</h1>
        <div className="flex gap-2">
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Rechercher par nom ou numéro" />
          <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Exporter</button>
          <button onClick={() => setShowNewForm(!showNewForm)} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">
            {showNewForm ? 'Annuler' : 'Nouvelle facture'}
          </button>
        </div>
      </div>

      {showNewForm && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Nouvelle facture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client / Fournisseur *</label>
              <input value={newInvoice.partyName} onChange={e=>setNewInvoice({...newInvoice, partyName: e.target.value})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Nom du client ou fournisseur" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de facture</label>
              <select value={newInvoice.invoiceType} onChange={e=>setNewInvoice({...newInvoice, invoiceType: e.target.value as any})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm">
                <option value="sales">Vente</option>
                <option value="purchase">Achat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant HT (FCFA) *</label>
              <input type="number" value={newInvoice.amount} onChange={e=>setNewInvoice({...newInvoice, amount: e.target.value})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Ex: 150000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TVA (%)</label>
              <input type="number" value={newInvoice.taxPercent} onChange={e=>setNewInvoice({...newInvoice, taxPercent: e.target.value})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Ex: 18" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de facture</label>
              <input type="date" value={newInvoice.invoiceDate} onChange={e=>setNewInvoice({...newInvoice, invoiceDate: e.target.value})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance</label>
              <input type="date" value={newInvoice.dueDate} onChange={e=>setNewInvoice({...newInvoice, dueDate: e.target.value})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={newInvoice.description} onChange={e=>setNewInvoice({...newInvoice, description: e.target.value})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" rows={3} placeholder="Description des services ou produits..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type produit (pour comptes 706/707)</label>
              <select value={newInvoice.autoServiceType} onChange={e=>setNewInvoice({...newInvoice, autoServiceType: e.target.value as any})} className="w-full rounded-md border border-app-border px-3 py-2 text-sm">
                <option value="services">Services (706)</option>
                <option value="goods">Marchandises (707)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="autoPostJournal" type="checkbox" checked={newInvoice.autoPostJournal} onChange={e=>setNewInvoice({...newInvoice, autoPostJournal: e.target.checked})} />
              <label htmlFor="autoPostJournal" className="text-sm text-slate-700">Générer écriture comptable automatiquement</label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleCreateInvoice} className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E]">Créer la facture</button>
            <button onClick={() => setShowNewForm(false)} className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-4 py-2 hover:bg-slate-50">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Total factures" value="932 700 FCFA" />
        <KpiCard title="Payées" value="118 000 FCFA" tone="success" />
        <KpiCard title="En retard" value="224 700 FCFA" tone="danger" />
      </div>

      <div className="card p-4">
        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {loading ? (
          <div className="text-sm text-slate-500">Chargement…</div>
        ) : (
          <SimpleTable columns={columns as any} data={rows} />
        )}
      </div>

      {selectedId && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Pièces jointes — {rows.find(r=>r.id===selectedId)?.invoice || selectedId}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-sm text-slate-600 mb-2">Fichiers existants</div>
              {attachments.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {attachments.map((a:any)=> (
                    <li key={a.id} className="p-2 border border-app-border rounded-md">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedAttachments[a.id]}
                          onChange={(e)=> setSelectedAttachments(prev=> ({...prev, [a.id]: e.target.checked}))}
                        />
                        {String(a.mimeType||'').startsWith('image/') ? (
                          <img src={a.publicUrl} alt={a.originalName} className="h-10 w-10 object-cover rounded border border-slate-200" />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded border border-slate-200 bg-slate-50">PDF</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{a.originalName}</div>
                          <div className="text-xs text-slate-500">{(a.size/1024/1024).toFixed(2)} MB • {a.mimeType}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <a href={a.publicUrl} target="_blank" rel="noreferrer" className="text-app-primary hover:underline">Ouvrir</a>
                          <button onClick={()=> renameAttachment(a.id, a.originalName)} className="text-slate-700 hover:underline">Renommer</button>
                          <button onClick={()=> deleteAttachment(a.id)} className="text-rose-700 hover:underline">Supprimer</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">Aucune pièce jointe.</div>
              )}
              {attachments.length > 0 && (
                <div className="mt-3">
                  <button onClick={deleteSelectedAttachments} className="text-sm rounded-md bg-rose-600 text-white px-3 py-1.5 hover:bg-rose-700 disabled:opacity-50" disabled={!Object.values(selectedAttachments).some(Boolean)}>
                    Supprimer la sélection
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Ajouter une pièce</div>
              <FileUpload
                label="Sélectionner un fichier"
                accept="image/*,application/pdf"
                maxSize={10}
                entityType="invoice"
                entityId={selectedId}
                companyId={typeof window !== 'undefined' ? (window.localStorage.getItem('companyId')||undefined) as any : undefined}
                onUploadSuccess={async ()=> { await loadAttachments(selectedId); showSuccess('Pièce uploadée'); }}
                onUploadError={(err)=> showError(String(err))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
