"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";

const CLASSES_INFO = {
  1: { name: "Ressources durables", color: "bg-blue-100 text-blue-800" },
  2: { name: "Actif immobilisé", color: "bg-green-100 text-green-800" },
  3: { name: "Stocks", color: "bg-yellow-100 text-yellow-800" },
  4: { name: "Tiers", color: "bg-purple-100 text-purple-800" },
  5: { name: "Trésorerie", color: "bg-cyan-100 text-cyan-800" },
  6: { name: "Charges", color: "bg-rose-100 text-rose-800" },
  7: { name: "Produits", color: "bg-emerald-100 text-emerald-800" },
  8: { name: "Autres charges et produits", color: "bg-orange-100 text-orange-800" },
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const list = await apiGet('/api/v1/accounting/accounts', { companyId: cid }) as any[];
      setAccounts(list || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filteredAccounts = accounts.filter((acc: any) => {
    const matchClass = filterClass === 'all' || acc.syscohadaClass === filterClass;
    const matchSearch = !search || 
      acc.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
      acc.accountName.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const groupedByClass: Record<number, any[]> = filteredAccounts.reduce((acc: Record<number, any[]>, account: any) => {
    const cls: number = account.syscohadaClass;
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(account);
    return acc;
  }, {} as Record<number, any[]>);

  async function handleSeed() {
    const cid = getCompanyId();
    if (!cid) return;
    try {
      await apiPost('/api/v1/accounting/seed-syscohada', {}, { companyId: cid });
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plan Comptable SYSCOHADA</h1>
          <p className="text-sm text-slate-600 mt-1">Système Comptable OHADA - 8 Classes</p>
        </div>
        <div className="text-sm">
          <span className="font-medium text-slate-700">{filteredAccounts.length}</span>
          <span className="text-slate-500"> compte(s)</span>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      {accounts.length === 0 && !loading && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Aucun compte trouvé pour cette société</div>
              <div className="text-xs text-slate-500">Initialisez le plan comptable SYSCOHADA (55+ comptes de base)</div>
            </div>
            <button onClick={handleSeed} className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Initialiser le plan SYSCOHADA</button>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par numéro ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="rounded-md border border-app-border px-3 py-2 text-sm"
            >
              <option value="all">Toutes les classes</option>
              {Object.entries(CLASSES_INFO).map(([cls, info]) => (
                <option key={cls} value={cls}>Classe {cls} - {info.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500 py-8 text-center">Chargement du plan comptable...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">📊</div>
            <div className="text-sm text-slate-600">
              {search || filterClass !== 'all' ? 'Aucun compte trouvé avec ces filtres' : 'Aucun compte dans le plan comptable'}
            </div>
            {accounts.length === 0 && (
              <div className="text-xs text-slate-500 mt-2">
                Le plan comptable SYSCOHADA doit être initialisé pour cette société
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByClass as Record<string, any[]>).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([cls, accs]) => {
              const classInfo = CLASSES_INFO[parseInt(cls) as keyof typeof CLASSES_INFO];
              return (
                <div key={cls}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${classInfo?.color || 'bg-slate-100 text-slate-800'}`}>
                      Classe {cls}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{classInfo?.name || `Classe ${cls}`}</span>
                    <span className="text-xs text-slate-500">({accs.length})</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-app-border">
                        <th className="pb-2 w-32">Numéro</th>
                        <th className="pb-2">Libellé</th>
                        <th className="pb-2 w-32">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(accs as any[]).map((acc: any) => (
                        <tr key={acc.id} className="border-b border-app-border hover:bg-slate-50">
                          <td className="py-2 font-mono font-medium text-slate-900">{acc.accountNumber}</td>
                          <td className="py-2 text-slate-700">{acc.accountName}</td>
                          <td className="py-2">
                            <span className="text-xs text-slate-600 capitalize">{acc.accountType}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">📚 Classes SYSCOHADA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {Object.entries(CLASSES_INFO).map(([cls, info]) => (
            <div key={cls} className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded px-2 py-0.5 font-medium ${info.color}`}>
                {cls}
              </span>
              <span className="text-slate-600">{info.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
