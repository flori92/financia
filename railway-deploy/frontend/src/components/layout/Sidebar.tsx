"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Wallet, ArrowLeftRight, Users, LineChart, Landmark, GraduationCap, FileCheck, Settings, Building2, Receipt, Lock, Clock, UserCheck, Menu, X, Factory, ShoppingCart, Briefcase, FolderKanban, Repeat, Brain, BarChart3, TrendingUp, ArrowRightLeft, ChevronDown, ChevronRight, Send, ArrowUpDown, GripVertical, DollarSign, Calendar, CreditCard } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState, useRef } from "react";

const DEFAULT_ENTREPRENEUR_NAV = [
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
  { href: "/entrepreneur/direct-debits", label: "Prélèvements", icon: Repeat },
  { href: "/settings/notifications", label: "Notifications", icon: Send },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const DEFAULT_ACCOUNTANT_NAV = [
  { href: "/accountant", label: "Dashboard Comptable", icon: LayoutDashboard },
  { href: "/accountant/validation", label: "Centre de Validation", icon: FileCheck },
  { href: "/accountant/reminders", label: "Relances Clients", icon: Send },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/crm/contacts", label: "Contacts CRM", icon: Users },
  { href: "/crm/opportunities", label: "Opportunités", icon: TrendingUp },
  { href: "/hr", label: "Ressources Humaines", icon: Briefcase },
  { href: "/hr/employees", label: "Employés", icon: Users },
  { href: "/hr/payroll", label: "Paie", icon: DollarSign },
  { href: "/hr/leaves", label: "Congés & Absences", icon: Calendar },
  { href: "/hr/timesheets", label: "CRA & Temps", icon: Clock },
  { href: "/hr/expenses", label: "Notes de Frais", icon: FileText },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/invoices/payments", label: "Encaissements", icon: CreditCard },
  { href: "/purchases", label: "Achats", icon: ShoppingCart },
  { href: "/purchases/suppliers", label: "Fournisseurs", icon: Users },
  { href: "/treasury", label: "Trésorerie", icon: Wallet },
  { href: "/inventory", label: "Stock", icon: Building2 },
  { href: "/projects", label: "Projets", icon: FolderKanban },
  { href: "/budget", label: "Budget", icon: LineChart },
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
  { href: "/accountant/transactions", label: "Transactions", icon: ArrowUpDown },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

const REVENUE_ANALYSIS_NAV = [
  { href: "/accountant/revenue-recognition", label: "Reconnaissance CA", icon: TrendingUp },
  { href: "/accountant/multi-dimensional-analysis", label: "Analyse Multidimensionnelle", icon: BarChart3 },
  { href: "/accountant/ml-forecast", label: "Prévision CA ML", icon: Brain },
  { href: "/accountant/cash-flow-coherence", label: "Cohérence CA Trésorerie", icon: ArrowRightLeft },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Utilisateur");
  const [userRole, setUserRole] = useState("Entrepreneur");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [revenueMenuOpen, setRevenueMenuOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [entrepreneurNav, setEntrepreneurNav] = useState(DEFAULT_ENTREPRENEUR_NAV);
  const [accountantNav, setAccountantNav] = useState(DEFAULT_ACCOUNTANT_NAV);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = window.localStorage.getItem('user_email') || '';
      const role = window.localStorage.getItem('user_role') || 'entrepreneur';
      const name = email.split('@')[0] || 'Utilisateur';
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      setUserRole(role.charAt(0).toUpperCase() + role.slice(1));
      
      // Charger l'ordre personnalisé depuis localStorage
      const savedEntrepreneurOrder = window.localStorage.getItem('entrepreneur_nav_order');
      const savedAccountantOrder = window.localStorage.getItem('accountant_nav_order');
      
      if (savedEntrepreneurOrder) {
        try {
          const order = JSON.parse(savedEntrepreneurOrder);
          setEntrepreneurNav(order);
        } catch (e) {
          console.error('Erreur chargement ordre navigation entrepreneur:', e);
        }
      }
      
      if (savedAccountantOrder) {
        try {
          const order = JSON.parse(savedAccountantOrder);
          setAccountantNav(order);
        } catch (e) {
          console.error('Erreur chargement ordre navigation comptable:', e);
        }
      }
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, item: any, index: number, navType: 'entrepreneur' | 'accountant') => {
    if (!isReordering) return;
    
    dragItem.current = { item, index, navType };
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number, navType: 'entrepreneur' | 'accountant') => {
    if (!isReordering) return;
    
    e.preventDefault();
    dragOverItem.current = { index, navType };
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isReordering) return;
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isReordering || !dragItem.current || !dragOverItem.current) return;
    
    e.preventDefault();
    
    const { item: draggedItemData, index: draggedIndex, navType } = dragItem.current;
    const { index: dropIndex } = dragOverItem.current;
    
    if (draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const currentNav = navType === 'entrepreneur' ? [...entrepreneurNav] : [...accountantNav];
    const draggedNav = currentNav.splice(draggedIndex, 1)[0];
    currentNav.splice(dropIndex, 0, draggedNav);

    if (navType === 'entrepreneur') {
      setEntrepreneurNav(currentNav);
      window.localStorage.setItem('entrepreneur_nav_order', JSON.stringify(currentNav));
    } else {
      setAccountantNav(currentNav);
      window.localStorage.setItem('accountant_nav_order', JSON.stringify(currentNav));
    }

    setDragOverIndex(null);
    setDraggedItem(null);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    setDraggedItem(null);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const resetOrder = (navType: 'entrepreneur' | 'accountant') => {
    if (navType === 'entrepreneur') {
      setEntrepreneurNav(DEFAULT_ENTREPRENEUR_NAV);
      window.localStorage.removeItem('entrepreneur_nav_order');
    } else {
      setAccountantNav(DEFAULT_ACCOUNTANT_NAV);
      window.localStorage.removeItem('accountant_nav_order');
    }
  };

  const displayRole = userRole === "Entrepreneur" ? "Entrepreneur" : "Expert-Comptable";
  const currentNav = displayRole === "Entrepreneur" ? entrepreneurNav : accountantNav;

  return (
    <aside className={clsx(
      "fixed left-0 top-0 z-40 h-screen bg-app-sidebar border-r border-app-sidebarBorder transition-all duration-300 ease-in-out",
      isExpanded || isLocked ? "w-64" : "w-20"
    )}>
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/5">
        <div className={clsx("flex items-center gap-3", !(isExpanded || isLocked) && "justify-center")}>
          <div className="h-8 w-8 rounded-lg bg-app-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">BMS</span>
          </div>
          <div className={clsx(
            "transition-all duration-200",
            isExpanded || isLocked ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"
          )}>
            <div className="text-white font-semibold">BMS</div>
            <div className="text-white/70 text-xs">{displayRole}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReordering(!isReordering)}
            className={clsx(
              "p-2 rounded-lg transition-all",
              isReordering ? "bg-app-accent text-white" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title={isReordering ? "Terminer la réorganisation" : "Réorganiser le menu"}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={clsx(
              "p-2 rounded-lg transition-all",
              isLocked ? "bg-app-accent text-white" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title={isLocked ? "Déverrouiller" : "Verrouiller"}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {currentNav.length > 0 && (
          <div className="space-y-1">
            {currentNav.map((item, index) => {
              const active = pathname === item.href;
              const isDragging = draggedItem?.href === item.href;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={item.href}
                  draggable={isReordering}
                  onDragStart={(e) => handleDragStart(e, item, index, displayRole === "Entrepreneur" ? 'entrepreneur' : 'accountant')}
                  onDragEnter={(e) => handleDragEnter(e, index, displayRole === "Entrepreneur" ? 'entrepreneur' : 'accountant')}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className={clsx(
                    "relative transition-all duration-200",
                    isReordering && "cursor-move",
                    isDragging && "opacity-50",
                    isDragOver && "border-t-2 border-t-app-accent"
                  )}
                >
                  <Link
                    href={item.href}
                    className={clsx(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                      active ? "bg-white/5 text-white" : "text-white/60 hover:bg-app-sidebarHover hover:text-white/80",
                      isReordering && "pr-10"
                    )}
                  >
                    {isReordering && (
                      <GripVertical className="h-3 w-3 text-white/40 absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <span className={clsx("h-4 w-4 flex-shrink-0", active ? "text-app-accent" : "text-white/50 group-hover:text-white/70")}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="whitespace-nowrap text-xs">
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {displayRole === "Expert-Comptable" && REVENUE_ANALYSIS_NAV.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setRevenueMenuOpen(!revenueMenuOpen)}
              className="w-full group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-app-sidebarHover hover:text-white/80 transition-all"
            >
              <BarChart3 className="h-4 w-4 text-white/50 group-hover:text-white/70" />
              <span className="whitespace-nowrap text-xs flex-1 text-left">Analyse Revenus</span>
              {revenueMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {revenueMenuOpen && (
              <div className="mt-1 ml-4 space-y-1">
                {REVENUE_ANALYSIS_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                        active ? "bg-white/5 text-white" : "text-white/60 hover:bg-app-sidebarHover hover:text-white/80"
                      )}
                    >
                      <span className={clsx("h-4 w-4 flex-shrink-0", active ? "text-app-accent" : "text-white/50 group-hover:text-white/70")}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="whitespace-nowrap text-xs">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isReordering && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => resetOrder(displayRole === "Entrepreneur" ? 'entrepreneur' : 'accountant')}
              className="w-full group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-app-sidebarHover hover:text-white/80 transition-all"
            >
              <Repeat className="h-4 w-4 text-white/50 group-hover:text-white/70" />
              <span className="whitespace-nowrap text-xs flex-1 text-left">Réinitialiser l'ordre</span>
            </button>
          </div>
        )}
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
