"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiGet, getCompanyId } from "@/lib/api";
import {
  LayoutDashboard, BookOpen, Wallet, ShoppingCart, ShoppingBag, Target,
  TrendingUp, Percent, BarChart3, Plug, Settings, ChevronDown, Pin,
  PenTool, FileText, Calculator, Link2, Lock, Building2, Landmark,
  GitCompare, ArrowRightLeft, Package, CreditCard, BellRing,
  Users, Send, PieChart, Activity, LineChart, Layers, CheckCircle,
  ScanSearch, Sparkles, GitBranch, Receipt, FilePlus2, FileCheck,
  ShieldCheck, CalendarClock, FileBarChart, Gauge, Monitor, Database,
  AlertTriangle, UserCog, Shield, LogOut, ListTree, ScrollText, Scan,
  Smartphone
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
  | "amber"
  | "gray";

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
  amber: "bg-amber-400/20 text-amber-900 border border-amber-400/40",
  gray: "bg-gray-500/20 text-gray-300 border border-gray-500/40"
};

const getMenuItems = (remindersCount: number): SidebarItem[] => [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard" },
  {
    id: "compta",
    label: "Comptabilité",
    icon: BookOpen,
    submenu: [
      { label: "Plan comptable", href: "/accountant/chart-of-accounts", icon: ListTree },
      { label: "Journal comptable", href: "/accountant/journal", icon: FileText },
      { label: "Grand livre", href: "/accountant/general-ledger", icon: Calculator },
      { label: "Balance âgée", href: "/accountant/aged-balance", icon: AlertTriangle, badge: "", badgeColor: "amber" },
      { label: "Balance de vérification", href: "/accountant/trial-balance", icon: FileCheck },
      { label: "Compte de résultat", href: "/accountant/profit-loss", icon: TrendingUp },
      { label: "Bilan", href: "/accountant/balance-sheet", icon: PieChart },
      { label: "Clôture période", href: "/accountant/close", icon: Lock },
      { label: "Déclaration TVA", href: "/accountant/tax/vat", icon: Receipt, badge: "DGI", badgeColor: "orange" },
      { label: "Analyse multidim.", href: "/accountant/multi-dimensional-analysis", icon: Database, badge: "ML", badgeColor: "purple" },
      { label: "Prévision CA ML", href: "/accountant/ml-forecast", icon: Sparkles, badge: "AI", badgeColor: "indigo" },
      { label: "Reconnaissance CA", href: "/accountant/revenue-recognition", icon: CheckCircle },
      { label: "Cohérence CA/Tréso", href: "/accountant/cash-flow-coherence", icon: ArrowRightLeft },
      { label: "Centre de validation", href: "/accountant/validation", icon: ShieldCheck },
      { label: "Transactions", href: "/accountant/transactions", icon: Layers }
    ]
  },
  {
    id: "tresorerie",
    label: "Trésorerie & Banque",
    icon: Wallet,
    submenu: [
      { label: "Multi-banques", href: "/treasury", icon: Landmark },
      { label: "Mobile Money", href: "/accountant/mobile-money", icon: Smartphone, badge: "KKia", badgeColor: "emerald" },
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
      { label: "Relances clients", href: "/invoices/reminders", icon: BellRing, badge: remindersCount.toString() || "0", ...(remindersCount > 0 ? { badgeColor: "red" as const } : { badgeColor: "gray" as const }) },
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
      { label: "Analyse ventes", href: "/sales/analytics", icon: BarChart3 },
      { label: "Prévisions", href: "/accountant/ml-forecast", icon: Sparkles, badge: "ML", badgeColor: "purple" }
    ]
  },
  {
    id: "operations",
    label: "Opérations",
    icon: Gauge,
    submenu: [
      { label: "Production", href: "/manufacturing", icon: Monitor },
      { label: "Ordres de production", href: "/manufacturing/production-orders", icon: FileBarChart },
      { label: "Nomenclatures", href: "/manufacturing/bom", icon: Database },
      { label: "MRP", href: "/manufacturing/mrp", icon: GitBranch },
      { label: "Projets", href: "/projects", icon: Layers },
      { label: "RH", href: "/hr", icon: Users },
      { label: "Stock", href: "/inventory", icon: Package }
    ]
  },
  {
    id: "reporting",
    label: "Reporting & Analytics",
    icon: BarChart3,
    submenu: [
      { label: "BI & Tableaux de bord", href: "/dashboard/bi", icon: BarChart3, badge: "PowerBI", badgeColor: "purple" },
      { label: "Analyse financière", href: "/financial-analysis", icon: TrendingUp },
      { label: "Audit & conformité", href: "/settings/audit", icon: Shield },
      { label: "Export & Éditions", href: "/accountant", icon: FileText, badge: "PDF/Excel", badgeColor: "blue" }
    ]
  },
  {
    id: "communication",
    label: "Communication",
    icon: Send,
    submenu: [
      { label: "Emails", href: "/communications/emails", icon: Send, badge: "SMTP", badgeColor: "blue" },
      { label: "SMS", href: "/communications/sms", icon: Smartphone, badge: "SMS", badgeColor: "emerald" },
      { label: "WhatsApp", href: "/communications/whatsapp", icon: Smartphone, badge: "API", badgeColor: "emerald" },
      { label: "Templates", href: "/communications/templates", icon: FileText, badge: "", badgeColor: "orange" }
    ]
  },
  {
    id: "crm",
    label: "CRM & Ventes",
    icon: Users,
    submenu: [
      { label: "Contacts", href: "/crm/contacts", icon: Users },
      { label: "Opportunités", href: "/crm/opportunities", icon: Target },
      { label: "Dashboard CRM", href: "/crm", icon: BarChart3 }
    ]
  },
  {
    id: "administration",
    label: "Administration",
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
  const [remindersCount, setRemindersCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Récupérer le nombre de relances depuis l'API
    const fetchRemindersCount = async () => {
      try {
        const companyId = getCompanyId();
        const data = await apiGet('/api/v1/accounting/aged-balance', { companyId, type: 'receivables' });
        const items = Array.isArray(data) ? data : data?.items;
        if (Array.isArray(items)) {
          // Compter les relances (montants > 0)
          const count = items.filter((item: any) =>
            (item.total || 0) > 0 || (item.over90 || 0) > 0
          ).length;
          setRemindersCount(count);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de relances:', error);
      }
    };

    fetchRemindersCount();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchRemindersCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        {getMenuItems(remindersCount).map((item) => (
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