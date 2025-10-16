"use client";
import { useEffect, useState } from "react";
import { Search, LogOut, User, Bell } from "lucide-react";
import { apiGet, getCompanyId } from "@/lib/api";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/api/v1/companies')
      .then((list: any[]) => {
        setCompanies(list || []);
        const current = getCompanyId() || (list && list[0]?.id);
        setCompanyId(current);
      })
      .catch(() => {});
    
    if (typeof window !== 'undefined') {
      setUserEmail(window.localStorage.getItem('user_email') || 'Utilisateur');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowProfileMenu(false);
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileMenu]);

  async function toggleNotifications() {
    try {
      if (showNotifMenu) { setShowNotifMenu(false); return; }
      const cid = getCompanyId();
      if (!cid) { setShowNotifMenu(!showNotifMenu); return; }
      const res = await apiGet('/api/v1/treasury/alerts', { companyId: cid });
      setAlerts(res?.alerts || []);
      setShowNotifMenu(true);
    } catch { setAlerts([]); setShowNotifMenu(true); }
  }

  function onChangeCompany(val: string) {
    const v = val || undefined;
    setCompanyId(v);
    if (typeof window !== 'undefined' && v) {
      window.localStorage.setItem('companyId', v);
      try { window.dispatchEvent(new Event('bms-company-changed')); } catch {}
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('bms_token');
      window.localStorage.removeItem('user_email');
      router.push('/login');
    }
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
        <button onClick={()=> router.push('/transactions')} className="hidden md:inline-flex rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Nouvelle transaction</button>
        <div className="relative">
          <button
            onClick={(e)=>{ e.stopPropagation(); toggleNotifications(); }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 text-sm font-medium text-slate-700 border-b border-slate-200">Notifications</div>
              {alerts.length ? alerts.map((a:any, i:number)=> (
                <div key={i} className={`px-4 py-2 text-sm ${a.level==='critical' ? 'text-red-700' : a.level==='warning' ? 'text-amber-700' : 'text-green-700'}`}>{a.message}</div>
              )) : (
                <div className="px-4 py-3 text-sm text-slate-600">Aucune alerte</div>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu(!showProfileMenu);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5" 
            aria-label="Profil"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:inline text-sm">{userEmail.split('@')[0]}</span>
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-700">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
