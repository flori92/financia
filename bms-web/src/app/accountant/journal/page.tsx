"use client";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";

interface LineInput { accountId?: string; debit?: string; credit?: string; label?: string; }

export default function JournalPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [journalType, setJournalType] = useState<string>('general');
  const [reference, setReference] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [lines, setLines] = useState<LineInput[]>([{},{},]);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  const totals = useMemo(()=>{
    const debit = lines.reduce((s,l)=> s + (parseFloat(l.debit||'0')||0), 0);
    const credit = lines.reduce((s,l)=> s + (parseFloat(l.credit||'0')||0), 0);
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.01 };
  },[lines]);

  async function refresh() {
    const cid = getCompanyId(); if (!cid) return;
    setLoading(true); setError(null);
    try {
      const [accs, ents] = await Promise.all([
        apiGet('/api/v1/accounting/accounts', { companyId: cid }),
        apiGet('/api/v1/accounting/journal-entries', { companyId: cid })
      ]) as any[];
      setAccounts(accs||[]);
      setEntries((ents||[]).slice(0,20));
    } catch (e:any) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ refresh(); },[]);

  // Écouter les changements de société
  useEffect(() => {
    const handleCompanyChange = () => refresh();
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, []);

  function addLine(){ setLines(prev=> [...prev, {}]); }
  function removeLine(idx: number){ setLines(prev=> prev.filter((_,i)=> i!==idx)); }
  function updateLine(idx: number, patch: Partial<LineInput>){ setLines(prev=> prev.map((l,i)=> i===idx? { ...l, ...patch }: l)); }

  async function handleCreateEntry(){
    const cid = getCompanyId(); if (!cid) { showError('Aucune société sélectionnée'); return; }
    if (!totals.balanced) { showError('Les débits et crédits doivent être égaux'); return; }
    const cleaned = lines.filter(l=> (l.accountId && ((parseFloat(l.debit||'0')||0)>0 || ((parseFloat(l.credit||'0')||0)>0))));
    if (cleaned.length < 2) { showError('Au moins 2 lignes requises'); return; }
    try {
      const payload = {
        companyId: cid,
        entryDate,
        journalType,
        reference: reference || undefined,
        description: description || undefined,
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        lines: cleaned.map(l=> ({ accountId: l.accountId, debit: l.debit? parseFloat(l.debit): 0, credit: l.credit? parseFloat(l.credit): 0, label: l.label || 'Ligne sans libellé' }))
      };
      await apiPost('/api/v1/accounting/journal-entries', payload);
      showSuccess('Écriture créée');
      setReference(''); setDescription(''); setLines([{},{}]);
      await refresh();
    } catch (e:any) { showError(String(e)); }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Journal des écritures</h1>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Date</label>
            <input type="date" value={entryDate} onChange={e=>setEntryDate(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Journal</label>
            <select value={journalType} onChange={e=>setJournalType(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm">
              <option value="general">Opérations diverses</option>
              <option value="sales">Ventes</option>
              <option value="purchase">Achats</option>
              <option value="bank">Banque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Référence</label>
            <input value={reference} onChange={e=>setReference(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="REF-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Description</label>
            <input value={description} onChange={e=>setDescription(e.target.value)} className="w-full rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Libellé de l'écriture" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-app-border">
                <th className="pb-2">Compte</th>
                <th className="pb-2 w-32 text-right">Débit</th>
                <th className="pb-2 w-32 text-right">Crédit</th>
                <th className="pb-2">Libellé</th>
                <th className="pb-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx)=> (
                <tr key={idx} className="border-b border-app-border">
                  <td className="py-2">
                    <select value={l.accountId||''} onChange={e=> updateLine(idx,{ accountId: e.target.value })} className="w-full rounded-md border border-app-border px-2 py-1 text-sm">
                      <option value="">Sélectionner un compte…</option>
                      {accounts.map((a:any)=> (<option key={a.id} value={a.id}>{a.accountNumber} — {a.accountName}</option>))}
                    </select>
                  </td>
                  <td className="py-2 text-right"><input type="number" step="0.01" value={l.debit||''} onChange={e=> updateLine(idx, { debit: e.target.value, credit: '' })} className="w-full rounded-md border border-app-border px-2 py-1 text-sm text-right" /></td>
                  <td className="py-2 text-right"><input type="number" step="0.01" value={l.credit||''} onChange={e=> updateLine(idx, { credit: e.target.value, debit: '' })} className="w-full rounded-md border border-app-border px-2 py-1 text-sm text-right" /></td>
                  <td className="py-2"><input value={l.label||''} onChange={e=> updateLine(idx, { label: e.target.value })} className="w-full rounded-md border border-app-border px-2 py-1 text-sm" placeholder="Libellé ligne" /></td>
                  <td className="py-2 text-right"><button onClick={()=> removeLine(idx)} className="text-rose-700 hover:underline">Suppr</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-3">
                  <button onClick={addLine} className="rounded-md bg-white text-slate-700 border border-app-border text-xs px-2 py-1 hover:bg-slate-50">+ Ajouter ligne</button>
                </td>
                <td className="pt-3 text-right">{totals.debit.toLocaleString('fr-FR')}</td>
                <td className="pt-3 text-right">{totals.credit.toLocaleString('fr-FR')}</td>
                <td className="pt-3" colSpan={2}>
                  {!totals.balanced && <span className="text-xs text-rose-600">Déséquilibré</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4">
          <button onClick={handleCreateEntry} disabled={!totals.balanced} className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E] disabled:opacity-50">Créer l'écriture</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 text-sm font-medium">Écritures récentes</div>
        {loading ? (<div className="text-sm text-slate-500">Chargement…</div>) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-app-border">
                <th className="pb-2 w-32">N° écriture</th>
                <th className="pb-2 w-32">Date</th>
                <th className="pb-2 w-32">Journal</th>
                <th className="pb-2">Référence</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 w-24">Statut</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e:any)=> (
                <tr key={e.id} className="border-b border-app-border">
                  <td className="py-2 font-mono">{e.entryNumber}</td>
                  <td className="py-2">{new Date(e.entryDate).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2 capitalize">{e.journalType}</td>
                  <td className="py-2">{e.reference||'—'}</td>
                  <td className="py-2">{e.description||'—'}</td>
                  <td className="py-2">{e.status||'draft'}</td>
                </tr>
              ))}
              {entries.length===0 && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500">Aucune écriture</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
