"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiGet, getCompanyId } from "@/lib/api";

export function Topbar() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);

  useEffect(() => {
    apiGet('/api/v1/companies')
      .then((list: any[]) => {
        setCompanies(list || []);
        const current = getCompanyId() || (list && list[0]?.id);
        setCompanyId(current);
      })
      .catch(() => {});
  }, []);

  function onChangeCompany(val: string) {
    const v = val || undefined;
    setCompanyId(v);
    if (typeof window !== 'undefined' && v) {
      window.localStorage.setItem('companyId', v);
      try { window.dispatchEvent(new Event('bms-company-changed')); } catch {}
    }
  }

  async function devLogin() {
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'comptable@cabinet.bj', password: 'password123' })
      });
      const data = await res.json();
      if (!res.ok) { console.error(data); return; }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('bms_token', data.access_token);
        try { window.dispatchEvent(new Event('bms-company-changed')); } catch {}
        location.reload();
      }
    } catch (e) { console.error(e); }
  }
  return (
    <header className="h-14 bg-app-topbar text-white flex items-center px-4 gap-3">
      <button className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/20" aria-label="Menu">
        ☰
      </button>
      <div className="flex-1 max-w-[720px] mx-auto hidden md:flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
          <input
            className="w-full rounded-md bg-white/10 pl-10 pr-3 py-2 text-sm placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Rechercher..."
            aria-label="Rechercher"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-white/80 text-sm">Société</span>
          <select
            className="rounded-md bg-white/10 text-white text-sm px-2 py-1 border border-white/20 focus:outline-none"
            value={companyId || ''}
            onChange={(e) => onChangeCompany(e.target.value)}
          >
            {companies.map((c: any) => (
              <option key={c.id} value={c.id} className="text-black">{c.name}</option>
            ))}
          </select>
        </div>
        <button onClick={devLogin} className="hidden md:inline-flex rounded-md bg-white/10 text-white text-sm px-3 py-2 hover:bg-white/20">Se connecter (dev)</button>
        <button className="hidden md:inline-flex rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Nouvelle transaction</button>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Notifications">🔔</button>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Profil">👤</button>
      </div>
    </header>
  );
}
