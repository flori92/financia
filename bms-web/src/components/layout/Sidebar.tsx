"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Wallet, ArrowLeftRight, Users, LineChart, Landmark, GraduationCap, FileCheck, Settings, Building2, Receipt, Lock, Clock, UserCheck, Menu, X, Factory, ShoppingCart, Briefcase, FolderKanban } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

const ENTREPRENEUR_NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/crm/contacts", label: "CRM", icon: Users },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/purchases", label: "Achats", icon: ShoppingCart },
  { href: "/manufacturing", label: "Production", icon: Factory },
  { href: "/inventory", label: "Stock", icon: Building2 },
  { href: "/hr", label: "RH", icon: Briefcase },
  { href: "/projects", label: "Projets", icon: FolderKanban },
  { href: "/budget", label: "Budget", icon: LineChart },
  { href: "/treasury", label: "Trésorerie", icon: Wallet },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const ACCOUNTANT_NAV = [
  { href: "/accountant", label: "Dashboard Comptable", icon: LayoutDashboard },
  { href: "/accountant/validation", label: "Centre de Validation", icon: FileCheck },
  { href: "/accountant/chart-of-accounts", label: "Plan Comptable SYSCOHADA", icon: Landmark },
  { href: "/accountant/journal", label: "Journal des Écritures", icon: FileText },
  { href: "/accountant/general-ledger", label: "Grand Livre", icon: LayoutDashboard },
  { href: "/accountant/aged-balance", label: "Balance Âgée", icon: Clock },
  { href: "/accountant/trial-balance", label: "Balance de Vérification", icon: LineChart },
  { href: "/accountant/profit-loss", label: "Compte de Résultat", icon: LineChart },
  { href: "/accountant/balance-sheet", label: "Bilan", icon: LineChart },
  { href: "/accountant/bank", label: "Rapprochement Bancaire", icon: Building2 },
  { href: "/accountant/tax/vat", label: "Déclaration TVA", icon: Receipt },
  { href: "/accountant/close", label: "Clôture de Période", icon: Lock },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Utilisateur");
  const [userRole, setUserRole] = useState("Entrepreneur");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = window.localStorage.getItem('user_email') || '';
      const role = window.localStorage.getItem('user_role') || 'entrepreneur';
      setUserName(email.split('@')[0] || 'Utilisateur');
      setUserRole(role === 'accountant' ? 'Comptable' : 'Entrepreneur');
    }
  }, []);

  // Détecter si on est sur une route comptable
  const isAccountantRoute = pathname?.startsWith('/accountant');
  const NAV = isAccountantRoute ? ACCOUNTANT_NAV : ENTREPRENEUR_NAV;
  const displayRole = isAccountantRoute ? 'Comptable' : userRole;
  return (
    <aside 
      className={clsx(
        "fixed left-0 top-0 h-full bg-app-sidebar text-white transition-all duration-300 ease-in-out z-50",
        isExpanded || isLocked ? "w-64" : "w-20"
      )}
      onMouseEnter={() => !isLocked && setIsExpanded(true)}
      onMouseLeave={() => !isLocked && setIsExpanded(false)}
    >
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/5">
        {isExpanded || isLocked ? (
          <div>
            <div className="text-xl font-bold tracking-tight">BMS</div>
            <div className="text-xs text-white/60">Solution Comptable</div>
          </div>
        ) : (
          <div className="text-xl font-bold tracking-tight">BMS</div>
        )}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
          title={isLocked ? "Déverrouiller" : "Verrouiller ouvert"}
        >
          {isLocked ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <nav className="mt-3 px-2 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                active ? "bg-white/5 text-white" : "text-white/80 hover:bg-app-sidebarHover hover:text-white",
                !(isExpanded || isLocked) && "justify-center"
              )}
              title={!(isExpanded || isLocked) ? item.label : undefined}
            >
              <span className={clsx("h-5 w-5 flex-shrink-0", active ? "text-app-accent" : "text-white/70 group-hover:text-white")}> 
                <Icon className="h-5 w-5" />
              </span>
              <span className={clsx(
                "whitespace-nowrap transition-all duration-200",
                isExpanded || isLocked ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-3">
        <div className={clsx("flex items-center gap-3 text-sm", !(isExpanded || isLocked) && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className={clsx(
            "transition-all duration-200",
            isExpanded || isLocked ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
          )}>
            <div className="font-medium leading-tight whitespace-nowrap">{userName}</div>
            <div className="text-white/70 text-xs whitespace-nowrap">{displayRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
