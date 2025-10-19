"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Wallet, ShoppingCart, ShoppingBag, Target,
  TrendingUp, Percent, BarChart3, Plug, Settings, ChevronDown, Pin,
  PenTool, FileText, Calculator, Link2, Lock, Building2, Landmark,
  GitCompare, ArrowRightLeft, FileInvoice, Package, CreditCard, BellRing,
  Users, Send, PieChart, Activity, LineChart, Layers, CheckCircle,
  ScanSearch, CrystalBall, GitBranch, Receipt, FilePlus2, FileCheck,
  ShieldCheck, CalendarClock, FileBarChart, Gauge, Monitor, Database,
  AlertTriangle, UserCog, Shield, LogOut, ListTree
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard" },
  {
    id: "compta", label: "Comptabilité", icon: BookOpen, submenu: [
      { label: "Plan comptable", icon: ListTree, href: "/accountant/chart-of-accounts" },
      { label: "Saisie comptable", icon: PenTool, href: "/accountant/journal", badge: "OCR+IA" },
      { label: "Journal comptable", icon: BookOpen, href: "/accountant/journal" },
      { label: "Grand livre", icon: FileText, href: "/accountant/general-ledger" },
      { label: "Balance générale", icon: Calculator, href: "/accountant/trial-balance" },
      { label: "Lettrage & Pointage", icon: Link2, href: "/accountant/bank", badge: "Auto" },
      { label: "Clôtures", icon: Lock, href: "/accountant/close" },
      { label: "Immobilisations", icon: Building2, href: "/accountant/assets" }
    ]
  },
  {
    id: "tresorerie", label: "Trésorerie", icon: Wallet, submenu: [
      { label: "Multi-banques", icon: Landmark, href: "/treasury" },
      { label: "Rapprochement bancaire", icon: GitCompare, href: "/accountant/bank", badge: "API" },
      { label: "Prévisionnel trésorerie", icon: TrendingUp, href: "/treasury" },
      { label: "Opérations", icon: ArrowRightLeft, href: "/treasury", badge: "SEPA" },
      { label: "Cash Management", icon: Wallet, href: "/treasury" }
    ]
  },
  {
    id: "facturation", label: "Facturation & Ventes", icon: ShoppingCart, submenu: [
      { label: "Cycle de vente", icon: ShoppingCart, href: "/invoices" },
      { label: "Facturation", icon: FileInvoice, href: "/invoices", badge: "e-invoicing" },
      { label: "Catalogue produits", icon: Package, href: "/inventory" },
      { label: "Encaissements", icon: CreditCard, href: "/invoices" },
      { label: "Relances clients", icon: BellRing, href: "/invoices", badge: "4", badgeColor: "red" },
      { label: "Analyse ventes", icon: BarChart3, href: "/invoices" }
    ]
  },
  {
    id: "achats", label: "Achats & Fournisseurs", icon: ShoppingBag, submenu: [
      { label: "Cycle d'achat", icon: ShoppingBag, href: "/purchases" },
      { label: "Gestion fournisseurs", icon: Users, href: "/purchases/suppliers" },
      { label: "Paiements", icon: Send, href: "/purchases" },
      { label: "Analyse achats", icon: PieChart, href: "/purchases" }
    ]
  },
  {
    id: "budget", label: "Budget & Contrôle", icon: Target, submenu: [
      { label: "Budgets prévisionnels", icon: Target, href: "/budget" },
      { label: "Suivi budgétaire", icon: Activity, href: "/budget" },
      { label: "Contrôle de gestion", icon: LineChart, href: "/budget" },
      { label: "Comptabilité analytique", icon: Layers, href: "/budget", badge: "Multi-axes" }
    ]
  },
  {
    id: "ca", label: "Chiffre d'Affaires", icon: TrendingUp, submenu: [
      { label: "Reconnaissance CA", icon: CheckCircle, href: "/accountant/profit-loss" },
      { label: "Analyse multidimensionnelle", icon: ScanSearch, href: "/accountant/profit-loss" },
      { label: "Prévisions CA", icon: CrystalBall, href: "/accountant/profit-loss", badge: "ML" },
      { label: "Cohérence CA-Trésorerie", icon: GitBranch, href: "/accountant/profit-loss" }
    ]
  },
  {
    id: "fiscal", label: "Fiscalité", icon: Percent, submenu: [
      { label: "TVA", icon: Percent, href: "/accountant/tax/vat", badge: "CA3" },
      { label: "IS / IR", icon: Receipt, href: "/tax" },
      { label: "Taxes annexes", icon: FilePlus2, href: "/tax" },
      { label: "Déclarations", icon: FileCheck, href: "/tax", badge: "Télé" },
      { label: "Conformité & FEC", icon: ShieldCheck, href: "/accountant/validation" },
      { label: "Calendrier fiscal", icon: CalendarClock, href: "/tax" }
    ]
  },
  {
    id: "reporting", label: "Reporting & BI", icon: BarChart3, submenu: [
      { label: "États financiers", icon: FileBarChart, href: "/accountant/balance-sheet" },
      { label: "Ratios financiers", icon: Gauge, href: "/accountant" },
      { label: "Dashboards personnalisés", icon: Monitor, href: "/dashboard" },
      { label: "BI avancée", icon: Database, href: "/dashboard", badge: "OLAP" },
      { label: "Alertes intelligentes", icon: AlertTriangle, href: "/dashboard" }
    ]
  },
  { id: "integrations", label: "Intégrations", icon: Plug, href: "/settings" },
  {
    id: "systeme", label: "Système", icon: Settings, submenu: [
      { label: "Paramètres", icon: Settings, href: "/settings" },
      { label: "Utilisateurs & droits", icon: UserCog, href: "/settings" },
      { label: "Audit & traçabilité", icon: Shield, href: "/settings" }
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
      className={`fixed left-0 top-0 h-full bg-[#0F3D3A] text-white flex flex-col z-50 overflow-y-auto transition-all duration-300 ${
        isLocked ? "w-72" : "w-[72px] hover:w-72"
      }`}
      onMouseEnter={() => !isLocked && setOpenMenus(["compta"])}
    >
      <div className="p-6 border-b border-white/10 sticky top-0 bg-[#0F3D3A] z-10 flex items-center justify-between min-h-[88px]">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold tracking-tighter">B</div>
          <div className={`transition-opacity duration-300 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <div className="text-2xl font-bold tracking-tighter">MS ERP</div>
            <div className="text-xs text-white/60 mt-1 tracking-wide">Solution Comptable Intégrée</div>
          </div>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-1.5 rounded hover:bg-white/10 transition-all ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <Pin className={`w-4 h-4 transition-transform ${isLocked ? "rotate-45" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.submenu ? (
              <>
                <div
                  className="flex items-center justify-between px-3 cursor-pointer hover:bg-white/5 rounded-lg py-2 transition-all"
                  onClick={() => toggleMenu(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                    <span className={`text-sm font-semibold transition-opacity duration-300 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                      openMenus.includes(item.id) ? "rotate-180" : ""
                    } ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </div>
                <div
                  className={`pl-3 overflow-hidden transition-all duration-300 ${
                    openMenus.includes(item.id) ? "max-h-[1000px]" : "max-h-0"
                  }`}
                >
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
                      <div className={`flex items-center justify-between flex-1 transition-opacity duration-300 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <span className="text-sm font-medium">{subItem.label}</span>
                        {subItem.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            subItem.badgeColor === "red" ? "bg-red-500" : "bg-[#0D9488]"
                          }`}>
                            {subItem.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-[#0D9488] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                <span className={`text-sm font-medium transition-opacity duration-300 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  {item.label}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#0F3D3A]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-[#0D9488] flex items-center justify-center text-sm font-semibold flex-shrink-0">
            JD
          </div>
          <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <div className="text-sm font-medium truncate">Jean Dupont</div>
            <div className="text-xs text-white/60">Expert-comptable</div>
          </div>
          <LogOut className={`w-[18px] h-[18px] text-white/60 hover:text-white cursor-pointer transition-all flex-shrink-0 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} strokeWidth={1.5} />
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-xs transition-opacity duration-300 ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <ShieldCheck className="text-green-400 w-[14px] h-[14px] flex-shrink-0" strokeWidth={1.5} />
          <span className="text-white/80">ISO 27001 • RGPD • SOC 2</span>
        </div>
      </div>
    </div>
  );
}
