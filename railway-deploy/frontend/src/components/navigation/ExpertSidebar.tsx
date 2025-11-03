// Sidebar pour Expert-Comptable (accès complet)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calculator, 
  TrendingUp, 
  Building2, 
  FileText, 
  Mail, 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  FolderOpen, 
  Cpu, 
  PieChart, 
  Megaphone, 
  Settings,
  DollarSign,
  Receipt,
  CreditCard
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Comptabilité", href: "/accountant", icon: Calculator },
  { name: "Trésorerie", href: "/treasury", icon: TrendingUp },
  { name: "Banque", href: "/accountant/bank", icon: Building2 },
  { name: "Fiscal", href: "/tax", icon: FileText },
  { name: "Communications", href: "/communications", icon: Mail },
  { name: "Stock", href: "/inventory", icon: Package },
  { name: "Factures", href: "/invoices", icon: Receipt },
  { name: "Achats", href: "/purchases", icon: ShoppingCart },
  { name: "Ventes", href: "/sales", icon: DollarSign },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "RH", href: "/hr", icon: UserCheck },
  { name: "Projets", href: "/projects", icon: FolderOpen },
  { name: "Production", href: "/manufacturing", icon: Cpu },
  { name: "Budget", href: "/budget", icon: PieChart },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Mobile Money", href: "/mobile-money", icon: CreditCard },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function ExpertSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BMS Expert</h1>
            <p className="text-xs text-gray-500">Espace Comptable</p>
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
                  ? "bg-app-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-app-border">
        <div className="text-xs text-gray-500 text-center">
          <p>Expert-Comptable</p>
          <p>Accès complet</p>
        </div>
      </div>
    </div>
  );
}
