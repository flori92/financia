// Sidebar pour Entrepreneur (vue simplifiée)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calculator, 
  TrendingUp, 
  Mail, 
  Package, 
  Receipt, 
  ShoppingCart, 
  Users, 
  FolderOpen, 
  PieChart, 
  Megaphone, 
  Settings,
  DollarSign
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/entrepreneur", icon: LayoutDashboard },
  { name: "Comptabilité", href: "/accountant", icon: Calculator, note: "Vue simplifiée" },
  { name: "Trésorerie", href: "/treasury", icon: TrendingUp, note: "KPIs" },
  { name: "Communications", href: "/communications", icon: Mail },
  { name: "Stock", href: "/inventory", icon: Package, note: "Consultation" },
  { name: "Factures", href: "/invoices", icon: Receipt },
  { name: "Achats", href: "/purchases", icon: ShoppingCart, note: "Demandes" },
  { name: "Ventes", href: "/sales", icon: DollarSign, note: "Devis/Commandes" },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Projets", href: "/projects", icon: FolderOpen, note: "Consultation" },
  { name: "Budget", href: "/budget", icon: PieChart, note: "Consultation" },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Paramètres", href: "/settings", icon: Settings, note: "Limité" },
];

export function EntrepreneurSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BMS Business</h1>
            <p className="text-xs text-gray-500">Espace Entrepreneur</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-4 h-4" />
              <div className="flex-1 flex items-center justify-between">
                <span>{item.name}</span>
                {item.note && (
                  <span className="text-xs opacity-75">{item.note}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-app-border">
        <div className="text-xs text-gray-500 text-center">
          <p>Entrepreneur</p>
          <p>Vue opérationnelle</p>
        </div>
      </div>
    </div>
  );
}
