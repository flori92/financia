"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Wallet, ShoppingCart, ShoppingBag, Target,
  TrendingUp, Percent, BarChart3, Plug, Settings, ChevronDown, Pin,
  PenTool, FileText, Calculator, Link2, Lock, Building2, Landmark,
  GitCompare, ArrowRightLeft, Package, CreditCard, BellRing,
  Users, Send, PieChart, Activity, LineChart, Layers, CheckCircle,
  ScanSearch, Sparkles, GitBranch, Receipt, FilePlus2, FileCheck,
  ShieldCheck, CalendarClock, FileBarChart, Gauge, Monitor, Database,
  AlertTriangle, UserCog, Shield, LogOut, ListTree, ScrollText, Scan
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type BadgeColor =
  | "teal"
  | "blue"
  | "purple"
  | "emerald"
  | "orange"
  | "red"
  | "indigo"
  | "pink"
  | "sky"
  | "amber";

type SidebarSubItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: BadgeColor;
};

type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  submenu?: SidebarSubItem[];
};

const badgeColorClasses: Record<BadgeColor, string> = {
  teal: "bg-teal-500/20 text-teal-100 border border-teal-500/40",
  blue: "bg-blue-500/20 text-blue-100 border border-blue-500/40",
  purple: "bg-purple-500/20 text-purple-100 border border-purple-500/40",
  emerald: "bg-emerald-500/20 text-emerald-100 border border-emerald-500/40",
  orange: "bg-orange-500/20 text-orange-100 border border-orange-500/40",
  red: "bg-red-500 text-white",
  indigo: "bg-indigo-500/20 text-indigo-100 border border-indigo-500/40",
  pink: "bg-pink-500/20 text-pink-100 border border-pink-500/40",
  sky: "bg-sky-500/20 text-sky-100 border border-sky-500/40",
  amber: "bg-amber-400/20 text-amber-900 border border-amber-400/40"
};

const menuItems: SidebarItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard" },
  {
    id: "compta",
    label: "Comptabilité",
    icon: BookOpen,
    submenu: [
      { label: "Plan comptable", href: "/accountant/chart-of-accounts", icon: ListTree },
      { label: "Saisie comptable", href: "/accountant/journal", icon: PenTool, badge: "OCR+IA", badgeColor: "teal" },
      { label: "Journal comptable", href: "/accountant/journal", icon: BookOpen },
      { label: "Grand livre", href: "/accountant/general-ledger", icon: FileText },
      { label: "Balance générale", href: "/accountant/trial-balance", icon: Calculator },
      { label: "Lettrage & Pointage", href: "/accountant/bank", icon: Link2, badge: "Auto", badgeColor: "blue" },
      { label: "Clôtures", href: "/accountant/close", icon: Lock },
      { label: "Immobilisations", href: "/accountant/assets", icon: Building2 }
    ]
  },
  {
    id: "tresorerie",
    label: "Trésorerie",
    icon: Wallet,
    submenu: [
      { label: "Multi-banques", href: "/treasury", icon: Landmark },
      { label: "Rapprochement bancaire", href: "/accountant/bank", icon: GitCompare, badge: "API", badgeColor: "purple" },
      { label: "Prévisionnel trésorerie", href: "/treasury/forecast", icon: TrendingUp },
      { label: "Opérations", href: "/treasury/operations", icon: ArrowRightLeft, badge: "SEPA", badgeColor: "emerald" },
      { label: "Cash Management", href: "/treasury", icon: Wallet }
    ]
  },
  {
    id: "facturation",
    label: "Facturation & Ventes",
    icon: ShoppingCart,
    submenu: [
      { label: "Cycle de vente", href: "/sales/cycle", icon: ShoppingCart },
      { label: "Facturation", href: "/invoices", icon: ScrollText, badge: "e-invoicing", badgeColor: "orange" },
      { label: "Catalogue produits", href: "/inventory", icon: Package },
      { label: "Encaissements", href: "/invoices/payments", icon: CreditCard },
      { label: "Relances clients", href: "/invoices/reminders", icon: BellRing, badge: "4", badgeColor: "red" },
      { label: "Analyse ventes", href: "/sales/analytics", icon: BarChart3 }
    ]
  },
  {
    id: "achats",
    label: "Achats & Fournisseurs",
    icon: ShoppingBag,
    submenu: [
      { label: "Cycle d'achat", href: "/purchases", icon: ShoppingBag },
      { label: "Gestion fournisseurs", href: "/purchases/suppliers", icon: Users },
      { label: "Paiements", href: "/purchases/payments", icon: Send },
      { label: "Analyse achats", href: "/purchases/analytics", icon: PieChart }
    ]
  },
  {
    id: "budget",
    label: "Budget & Contrôle",
    icon: Target,
    submenu: [
      { label: "Budgets prévisionnels", href: "/budget", icon: Target },
      { label: "Suivi budgétaire", href: "/budget/tracking", icon: Activity },
      { label: "Contrôle de gestion", href: "/budget/control", icon: LineChart },
      { label: "Comptabilité analytique", href: "/budget/analytics", icon: Layers, badge: "Multi-axes", badgeColor: "indigo" }
    ]
  },
  {
    id: "chiffre-affaires",
    label: "Chiffre d'Affaires",
    icon: TrendingUp,
    submenu: [
      { label: "Reconnaissance CA", href: "/accountant/profit-loss", icon: CheckCircle },
      { label: "Analyse multidimensionnelle", href: "/accountant/profit-loss", icon: ScanSearch },
      { label: "Prévisions CA", href: "/accountant/profit-loss", icon: Sparkles, badge: "ML", badgeColor: "pink" },
      { label: "Cohérence CA-Trésorerie", href: "/accountant/profit-loss", icon: GitBranch }
    ]
  },
  {
    id: "fiscalite",
    label: "Fiscalité",
    icon: Percent,
    submenu: [
      { label: "TVA", href: "/accountant/tax/vat", icon: Percent, badge: "CA3", badgeColor: "amber" },
      { label: "IS / IR", href: "/tax", icon: Receipt },
      { label: "Taxes annexes", href: "/tax/other", icon: FilePlus2 },
      { label: "Déclarations", href: "/tax/declarations", icon: FileCheck, badge: "Télé", badgeColor: "sky" },
      { label: "Conformité & FEC", href: "/accountant/validation", icon: ShieldCheck },
      { label: "Calendrier fiscal", href: "/tax/calendar", icon: CalendarClock }
    ]
  },
  {
    id: "reporting",
    label: "Reporting & BI",
    icon: BarChart3,
    submenu: [
      { label: "États financiers", href: "/accountant/balance-sheet", icon: FileBarChart },
      { label: "Ratios financiers", href: "/accountant", icon: Gauge },
      { label: "Dashboards personnalisés", href: "/dashboard", icon: Monitor },
      { label: "BI avancée", href: "/dashboard/bi", icon: Database, badge: "OLAP", badgeColor: "purple" },
      { label: "Alertes intelligentes", href: "/dashboard/alerts", icon: AlertTriangle }
    ]
  },
  {
    id: "ai",
    label: "Intelligence Artificielle",
    icon: Sparkles,
    submenu: [
      { label: "OCR Documents", href: "/ai/ocr", icon: Scan, badge: "LIVE", badgeColor: "emerald" },
      // { label: "Assistant virtuel", href: "/ai/chat", icon: Activity, badge: "Bêta", badgeColor: "purple" },
      // { label: "Prédictions", href: "/ai/predictions", icon: TrendingUp }
    ]
  },
  { id: "integrations", label: "Intégrations", icon: Plug, href: "/settings/integrations" },
  {
    id: "systeme",
    label: "Système",
    icon: Settings,
    submenu: [
      { label: "Paramètres", href: "/settings", icon: Settings },
      { label: "Utilisateurs & droits", href: "/settings/users", icon: UserCog },
      { label: "Audit & traçabilité", href: "/settings/audit", icon: Shield }
    ]
  }
];

export function ModernSidebar() {
  const [isLocked, setIsLocked] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["compta"]);
  const pathname = usePathname();

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev =>
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  return (
    <div
      id="sidebar"
      className={`sidebar fixed left-0 top-0 h-full bg-[#0F3D3A] text-white flex flex-col z-50 overflow-y-auto transition-all duration-300 ease-in-out ${
        isLocked ? "locked w-72" : "w-[72px]"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0F3D3A] z-10 flex items-center justify-between min-h-[80px]">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold flex-shrink-0 sidebar-logo-compact">BMS</div>
          <div className="sidebar-content">
            <div className="text-lg font-bold">BMS</div>
            <div className="text-xs text-white/60">Solution Comptable</div>
          </div>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className="sidebar-content p-1.5 rounded hover:bg-white/10 transition-all"
        >
          <Pin className={`w-4 h-4 transition-transform ${isLocked ? "rotate-45" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.submenu ? (
              <>
                <div
                  className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => toggleMenu(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="sidebar-content text-sm font-medium">
                      {item.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`sidebar-content w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
                      openMenus.includes(item.id) ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`submenu overflow-hidden transition-all duration-300 ${
                    openMenus.includes(item.id) ? "open max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="pl-5 pr-3 py-1 space-y-1">
                    {item.submenu.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={subItem.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          pathname === subItem.href
                            ? "bg-[#0D9488] text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <subItem.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                        <span className="sidebar-content text-sm font-medium flex-1">
                          {subItem.label}
                        </span>
                        {subItem.badge && (
                          <span
                            className={`sidebar-content text-xs px-2 py-0.5 rounded-full font-semibold ${
                              subItem.badgeColor ? badgeColorClasses[subItem.badgeColor] : "bg-white/10 text-white"
                            }`}
                          >
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Link
                href={item.href || "#"}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-[#0D9488] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="sidebar-content text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#0F3D3A]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center text-sm font-semibold flex-shrink-0">
            JD
          </div>
          <div className="sidebar-content flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Jean Dupont</div>
            <div className="text-xs text-white/60">Expert-comptable</div>
          </div>
          <LogOut className="sidebar-content w-4 h-4 text-white/60 hover:text-white cursor-pointer transition-all flex-shrink-0" strokeWidth={1.5} />
        </div>
        <div className="sidebar-content flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-xs">
          <ShieldCheck className="text-green-400 w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-white/80">Certifié ISO 27001</span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 72px;
        }
        
        .sidebar.locked {
          width: 288px;
        }
        
        .sidebar:hover {
          width: 288px;
        }
        
        .sidebar-content {
          opacity: 0;
          transition: opacity 0.3s ease;
          white-space: nowrap;
        }

        .sidebar-logo-compact {
          transition: opacity 0.3s ease;
        }

        .sidebar:hover .sidebar-logo-compact,
        .sidebar.locked .sidebar-logo-compact {
          opacity: 0;
          display: none;
        }
        
        .sidebar:hover .sidebar-content,
        .sidebar.locked .sidebar-content {
          opacity: 1;
        }
        
        .submenu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .submenu.open {
          max-height: 500px;
        }
      `}</style>
    </div>
  );
}