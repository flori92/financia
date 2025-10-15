"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Wallet, ArrowLeftRight, Users, LineChart, Landmark, GraduationCap } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/invoices", label: "Factures Clients", icon: FileText },
  { href: "/treasury", label: "Trésorerie", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/receivables-payables", label: "Créances & Dettes", icon: Users },
  { href: "/financial-analysis", label: "Analyse Financière", icon: LineChart },
  { href: "/tax", label: "Fiscalité", icon: Landmark },
  { href: "/learning", label: "Formation", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar bg-app-sidebar text-white">
      <div className="h-14 flex items-center px-5 border-b border-white/5">
        <div className="text-xl font-bold tracking-tight">BMS</div>
        <div className="ml-1 text-app-accent" aria-hidden>▾</div>
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
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                active ? "bg-white/5 text-white" : "text-white/80 hover:bg-app-sidebarHover hover:text-white"
              )}
            >
              <span className={clsx("h-4 w-4", active ? "text-app-accent" : "text-white/70 group-hover:text-white")}> 
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">👤</div>
          <div>
            <div className="font-medium leading-tight">Vanessa CODO</div>
            <div className="text-white/70 text-xs">Entrepreneur</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
