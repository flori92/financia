"use client";
import { useEffect, useMemo, useState } from "react";
import { SimpleTable } from "@/components/table/SimpleTable";
import { KpiCard } from "@/components/kpi/KpiCard";
import { apiGet, apiPost, apiPatch, apiDelete, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { FileUpload } from "@/components/upload/FileUpload";

function nf(v: any) {
  const n = typeof v === "number" ? v : parseFloat(String(v || 0));
  return new Intl.NumberFormat("fr-FR").format(isNaN(n) ? 0 : n) + " FCFA";
}

function fd(s: any) {
  const d = s ? new Date(s) : null;
  if (!d || isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR");
}

const defaults = [
  { date: "05/03/2025", desc: "Ventes mensuelles", category: "Ventes", party: "--", amount: "+171 915 FCFA" },
  { date: "24/02/2025", desc: "Prestations de service", category: "Services", party: "--", amount: "+374 619 FCFA" },
  { date: "25/01/2025", desc: "Ventes mensuelles", category: "Ventes", party: "--", amount: "+224 700 FCFA" },
];

export default function TransactionsPage() {
  const [rows, setRows] = useState<any[]>(defaults);
  const [raw, setRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("cash");
  const [reference, setReference] = useState<string>("");
  const [partyName, setPartyName] = useState<string>("");
  const [autoPost, setAutoPost] = useState<boolean>(false);
  const [partyType, setPartyType] = useState<string>("customer");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'details' | 'attachments' | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<Record<string, boolean>>({});

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  function rebuild(list: any[]) {
    const mapped = (list || []).map((p: any) => ({
      id: p.id,
      date: fd(p.paymentDate || p.createdAt),
      desc: p.reference || p.paymentNumber || "Paiement",
      category: p.paymentMethod || "Paiement",
      party: p.partyId || "--",
      amount: (p.partyType === 'supplier' ? '-' : '+') + nf(p.amount),
      onEdit: () => handleEdit(p.id, p.reference || ""),
      onDelete: () => handleDelete(p.id),
      onView: () => handleView(p),
      onJustif: () => handleJustif(p),
    }));
    setRows(mapped.length ? mapped : defaults);
  }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true); setError(null);
    try {
      const list = await apiGet('/api/v1/payments', { companyId: cid }) as any[];
      setRaw(list||[]); rebuild(list||[]);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const h = () => { refresh(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  }, []);

  async function handleCreate() {
    try {
      const cid = getCompanyId();
      if (!cid) { showError('Aucune société sélectionnée'); return; }
      if (!amount || parseFloat(amount) <= 0) { showError('Montant invalide'); return; }
      
      // Récupérer userId depuis localStorage ou utiliser UUID par défaut valide
      const userId = (typeof window !== 'undefined' && localStorage.getItem('userId')) || '550e8400-e29b-41d4-a716-446655440000';
      // Pour partyId, UUID par défaut valide (sera ignoré en prod mais valide pour tests)
      const defaultPartyId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      
      const body = {
        paymentDate: paymentDate || new Date().toISOString().slice(0, 10),
        amount: parseFloat(amount),
        currency: 'XOF',
        paymentMethod: method,
        reference: reference || undefined,
        partyType: partyType,
        partyId: defaultPartyId,
        partyName: partyName || undefined,
        companyId: cid,
        createdBy: userId,
        autoPostJournal: autoPost,
      };
      
      console.log('Creating payment with body:', body); // Debug
      await apiPost('/api/v1/payments', body);
      setAmount(""); setReference(""); setMethod("cash"); setPaymentDate(new Date().toISOString().slice(0, 10));
      showSuccess('Paiement créé');
      await refresh();
    } catch (e: unknown) { 
      console.error('Error creating payment:', e); // Debug
      setError(String(e)); 
      showError(String(e)); 
    }
  }

  async function handleEdit(id?: string, currentRef?: string) {
    try {
      if (!id) return;
      const nextRef = typeof window!== 'undefined' ? window.prompt('Référence', currentRef||'') : currentRef;
      await apiPatch(`/api/v1/payments/${id}`, { reference: nextRef||undefined });
      showSuccess('Paiement mis à jour');
      await refresh();
    } catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  async function handleDelete(id?: string) {
    try { if (!id) return; await apiDelete(`/api/v1/payments/${id}`); showSuccess('Paiement supprimé'); await refresh(); }
    catch (e: unknown) { setError(String(e)); showError(String(e)); }
  }

  function handleView(payment: any) {
    setSelectedPayment(payment);
    setViewMode('details');
  }

  async function handleJustif(payment: any) {
    setSelectedPayment(payment);
    setViewMode('attachments');
    await loadAttachments(payment.id);
  }

  async function loadAttachments(paymentId: string) {
    try {
      const list = await apiGet(`/api/v1/uploads/entity/payment/${paymentId}`) as any[];
      setAttachments(list || []);
      setSelectedAttachments({});
    } catch (e) {
      setAttachments([]);
      setSelectedAttachments({});
    }
  }

  async function deleteAttachment(id: string) {
    try {
      await apiDelete(`/api/v1/uploads/${id}`);
      if (selectedPayment) await loadAttachments(selectedPayment.id);
      showSuccess('Pièce supprimée');
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  async function deleteSelectedAttachments() {
    try {
      const ids = Object.entries(selectedAttachments).filter(([_,v])=>v).map(([id])=>id);
      if (!ids.length) return;
      await apiPost('/api/v1/uploads/batch-delete', { ids });
      if (selectedPayment) await loadAttachments(selectedPayment.id);
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
      if (selectedPayment) await loadAttachments(selectedPayment.id);
      showSuccess('Nom mis à jour');
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  function exportCsv() {
    const rowsToExport = raw.length ? raw : [];
    const header = ['paymentNumber','paymentDate','amount','currency','paymentMethod','partyType','partyId','companyId','status','reference'];
    const lines = [header.join(',')].concat(rowsToExport.map((p:any)=> header.map(h=> JSON.stringify(p[h] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click(); URL.revokeObjectURL(url);
  }

  const columns = [
    { key: "date", header: "Date" },
    { key: "desc", header: "Description" },
    { key: "category", header: "Catégorie" },
    { key: "party", header: "Bénéficiaire/Payer" },
    { key: "amount", header: "Montant" },
    { key: "actions", header: "Actions", render: (row: any) => (
      <div className="flex gap-2">
        <button onClick={() => row.onView && row.onView()} className="text-app-primary hover:underline">Voir</button>
        <button onClick={() => row.onJustif && row.onJustif()} className="text-slate-500 hover:underline">Justif</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <input type="date" className="rounded-md border border-app-border px-3 py-2 text-sm" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} />
          <select className="rounded-md border border-app-border px-3 py-2 text-sm" value={partyType} onChange={e=>setPartyType(e.target.value)}>
            <option value="customer">Encaissement</option>
            <option value="supplier">Décaissement</option>
          </select>
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Montant" value={amount} onChange={e=>setAmount(e.target.value)} />
          <select className="rounded-md border border-app-border px-3 py-2 text-sm" value={method} onChange={e=>setMethod(e.target.value)}>
            <option value="cash">Espèces</option>
            <option value="bank_transfer">Virement</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="check">Chèque</option>
            <option value="card">Carte</option>
          </select>
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Nom (client/fournisseur)" value={partyName} onChange={e=>setPartyName(e.target.value)} />
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Référence (opt.)" value={reference} onChange={e=>setReference(e.target.value)} />
          <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={autoPost} onChange={e=>setAutoPost(e.target.checked)} /> Générer écriture auto</label>
          <button onClick={handleCreate} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Ajouter</button>
          <button onClick={exportCsv} className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Exporter CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Transactions totales" value={String(raw.length)} />
        <KpiCard title="Revenus" value={nf((raw||[]).reduce((s:any,p:any)=> s + (parseFloat(String(p.amount||0))||0), 0))} tone="success" />
        <KpiCard title="Dépenses" value={nf((raw||[]).filter((p:any)=> p.partyType==='supplier').reduce((s:any,p:any)=> s + (parseFloat(String(p.amount||0))||0), 0))} tone="danger" />
        <KpiCard title="Solde" value={nf(((raw||[]).reduce((s:any,p:any)=> s + (p.partyType==='supplier' ? -1: 1)*(parseFloat(String(p.amount||0))||0), 0)))} />
      </div>

      <div className="card p-4">
        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        {loading ? (
          <div className="text-sm text-slate-500">Chargement…</div>
        ) : (
          <SimpleTable columns={columns as any} data={rows} />
        )}
      </div>

      {selectedPayment && viewMode === 'details' && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Détails du paiement</h3>
            <button onClick={() => setViewMode(null)} className="text-slate-500 hover:text-slate-700">×</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-600">Numéro</div>
              <div className="font-medium">{selectedPayment.paymentNumber || selectedPayment.reference || '—'}</div>
            </div>
            <div>
              <div className="text-slate-600">Date</div>
              <div className="font-medium">{fd(selectedPayment.paymentDate || selectedPayment.createdAt)}</div>
            </div>
            <div>
              <div className="text-slate-600">Montant</div>
              <div className="font-medium">{nf(selectedPayment.amount)}</div>
            </div>
            <div>
              <div className="text-slate-600">Devise</div>
              <div className="font-medium">{selectedPayment.currency || 'XOF'}</div>
            </div>
            <div>
              <div className="text-slate-600">Mode de paiement</div>
              <div className="font-medium">{selectedPayment.paymentMethod || '—'}</div>
            </div>
            <div>
              <div className="text-slate-600">Référence</div>
              <div className="font-medium">{selectedPayment.reference || '—'}</div>
            </div>
            <div>
              <div className="text-slate-600">Type</div>
              <div className="font-medium">{selectedPayment.partyType === 'customer' ? 'Client (Encaissement)' : 'Fournisseur (Décaissement)'}</div>
            </div>
            <div>
              <div className="text-slate-600">Statut</div>
              <div className="font-medium">{selectedPayment.status || 'draft'}</div>
            </div>
          </div>
        </div>
      )}

      {selectedPayment && viewMode === 'attachments' && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Pièces justificatives — {selectedPayment.paymentNumber || selectedPayment.reference}</h3>
            <button onClick={() => setViewMode(null)} className="text-slate-500 hover:text-slate-700">×</button>
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
                          <div className="h-10 w-10 flex items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs">PDF</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{a.originalName}</div>
                          <div className="text-xs text-slate-500">{(a.size/1024/1024).toFixed(2)} MB</div>
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
                entityType="payment"
                entityId={selectedPayment.id}
                companyId={typeof window !== 'undefined' ? (window.localStorage.getItem('companyId')||undefined) as any : undefined}
                onUploadSuccess={async ()=> { await loadAttachments(selectedPayment.id); showSuccess('Pièce uploadée'); }}
                onUploadError={(err)=> showError(String(err))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
