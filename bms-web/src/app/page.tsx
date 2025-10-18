"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { KpiCard } from "@/components/kpi/KpiCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";

function nf(v: number) { return new Intl.NumberFormat("fr-FR").format(v) + " FCFA"; }
function ym(d: string | Date) { const dt = new Date(d); return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,'0'); }

export default function Page() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  useEffect(() => {
    // Petit délai pour s'assurer que localStorage est prêt
    const timer = setTimeout(() => {
      const cid = getCompanyId();
      if (!cid) {
        console.warn('Aucune société sélectionnée, chargement des companies...');
        // Tenter de charger les companies pour initialiser companyId
        apiGet('/api/v1/companies').then((list: any[]) => {
          if (list && list[0]?.id) {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('companyId', list[0].id);
              window.location.reload(); // Recharger pour initialiser correctement
            }
          }
        }).catch(() => {});
        return;
      }
      setLoading(true); setError(null);
      Promise.all([
        apiGet('/api/v1/invoices', { companyId: cid }).catch(() => []),
        apiGet('/api/v1/payments', { companyId: cid }).catch(() => []),
      ]).then(([inv, pay]) => { setInvoices(inv as any[]); setPayments(pay as any[]); })
        .catch((e: unknown) => setError(String(e)))
        .finally(() => setLoading(false));
    }, 100); // 100ms délai
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const h = () => {
      const cid = getCompanyId();
      if (!cid) return;
      setLoading(true); setError(null);
      Promise.all([
        apiGet('/api/v1/invoices', { companyId: cid }).catch(() => []),
        apiGet('/api/v1/payments', { companyId: cid }).catch(() => []),
      ]).then(([inv, pay]) => { setInvoices(inv as any[]); setPayments(pay as any[]); })
        .catch((e: unknown) => setError(String(e)))
        .finally(() => setLoading(false));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bms-company-changed', h);
      return () => window.removeEventListener('bms-company-changed', h);
    }
  }, []);

  const kpis = useMemo(() => {
    const asAmount = (v: any) => parseFloat(String(v||0))||0;
    const customerPayments = payments.filter(p=> (p.partyType||'customer')==='customer');
    const supplierPayments = payments.filter(p=> p.partyType==='supplier');
    const totalPayments = customerPayments.reduce((s, p) => s + asAmount(p.amount), 0);
    const totalExpenses = supplierPayments.reduce((s, p) => s + asAmount(p.amount), 0);
    const unpaid = invoices.filter(i => (i.paymentStatus||i.status) !== 'paid');
    const unpaidTotal = unpaid.reduce((s, i) => s + asAmount(i.outstandingAmount||i.totalAmount), 0);
    const balance = totalPayments - totalExpenses;
    
    // Calcul runway simple
    const now = Date.now();
    const last30 = payments.filter(p=> (now - new Date(p.paymentDate||p.createdAt||now).getTime()) <= 30*24*3600*1000);
    const last30Out = last30.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + asAmount(p.amount), 0);
    const avgDailyOut = last30Out / 30;
    const runway = avgDailyOut > 0 ? Math.floor(balance / avgDailyOut) : 999;
    
    return { totalPayments, totalExpenses, unpaidCount: unpaid.length, unpaidTotal, balance, runway };
  }, [invoices, payments]);

  const chartData = useMemo(() => {
    const byMonth: Record<string,{recettes:number,depenses:number}> = {};
    for (const p of payments) {
      const key = ym(p.paymentDate||p.createdAt||new Date());
      byMonth[key] = byMonth[key]||{recettes:0,depenses:0};
      byMonth[key].recettes += parseFloat(String(p.amount||0))||0;
    }
    return Object.entries(byMonth)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([name,v]) => ({ name, recettes: v.recettes, depenses: v.depenses, benefice: v.recettes - v.depenses }));
  }, [payments]);

  function exportCsv() {
    const invHeader = ['invoiceNumber','invoiceDate','partyName','totalAmount','status','dueDate'];
    const payHeader = ['paymentNumber','paymentDate','amount','currency','paymentMethod','partyType','status'];
    const invLines = invoices.map(i => invHeader.map(h => JSON.stringify(i[h] ?? '')).join(','));
    const payLines = payments.map(p => payHeader.map(h => JSON.stringify(p[h] ?? '')).join(','));
    const csv = [
      '# FACTURES',
      invHeader.join(','),
      ...invLines,
      '',
      '# PAIEMENTS',
      payHeader.join(','),
      ...payLines
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bms-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Export CSV réussi');
  }

  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      if (lines.length < 2) { showError('Fichier CSV vide ou invalide'); return; }
      const header = lines[0].split(',').map(h => h.replace(/"/g,'').trim());
      const cid = getCompanyId();
      if (!cid) { showError('Aucune société sélectionnée'); return; }
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g,'').trim());
        const row: any = {};
        header.forEach((h, idx) => { row[h] = values[idx] || ''; });
        if (row.amount && parseFloat(row.amount) > 0) {
          try {
            await apiPost('/api/v1/payments', {
              amount: parseFloat(row.amount),
              paymentDate: row.paymentDate || new Date().toISOString(),
              paymentMethod: row.paymentMethod || 'cash',
              reference: row.reference || row.paymentNumber || '',
              partyType: row.partyType || 'customer',
              partyId: row.partyId || '',
              companyId: cid,
              createdBy: 'import',
            });
            imported++;
          } catch {}
        }
      }
      showSuccess(`${imported} paiement(s) importé(s)`);
      setShowImport(false);
      // Rafraîchir
      const [inv, pay] = await Promise.all([
        apiGet('/api/v1/invoices', { companyId: cid }).catch(() => []),
        apiGet('/api/v1/payments', { companyId: cid }).catch(() => []),
      ]);
      setInvoices(inv as any[]);
      setPayments(pay as any[]);
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
          <p className="text-sm text-slate-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/transactions')} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">
            Nouvelle transaction
          </button>
          <button onClick={exportCsv} className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">
            Exporter CSV
          </button>
          <button onClick={() => setShowImport(!showImport)} className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">
            Importer CSV
          </button>
        </div>
      </div>

      {kpis.runway < 15 && kpis.runway >= 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-800">
          <div className="font-semibold">Alerte Trésorerie Critique</div>
          <div className="text-sm mt-1">Runway: {kpis.runway} jour(s) restant(s). Accélérez vos relances clients et différez les dépenses non urgentes.</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Encaissements" value={nf(kpis.totalPayments)} hint={"Revenus totaux"} tone="success" />
        <KpiCard title="Dépenses" value={nf(kpis.totalExpenses)} hint={"Sorties totales"} tone="danger" />
        <KpiCard title="Impayés" value={nf(kpis.unpaidTotal)} hint={`${kpis.unpaidCount} facture(s)`} />
        <KpiCard title="Solde" value={nf(kpis.balance)} hint={kpis.runway < 999 ? `Runway: ${kpis.runway}j` : "Situation saine"} />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Flux de trésorerie</h2>
          <div className="text-sm text-slate-500">Aperçu</div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="recettes" fill="#16A34A" name="Recettes" radius={[4,4,0,0]} />
              <Bar dataKey="depenses" fill="#DC2626" name="Dépenses" radius={[4,4,0,0]} />
              <Bar dataKey="benefice" fill="#2563EB" name="Bénéfice" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showImport && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Importer des paiements (CSV)</h3>
            <button onClick={() => setShowImport(false)} className="text-slate-500 hover:text-slate-700">×</button>
          </div>
          <div className="text-sm text-slate-600 mb-3">
            Format attendu : colonnes <code className="bg-slate-100 px-1 rounded">amount, paymentDate, paymentMethod, reference, partyType, partyId</code>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCsv}
            className="text-sm"
          />
        </div>
      )}

      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Chargement…</div>}
    </div>
  );
}
