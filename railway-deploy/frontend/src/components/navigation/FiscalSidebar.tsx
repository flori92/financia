// Sidebar pour Administration Fiscale (vue limitée)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Calculator, 
  TrendingUp, 
  Settings,
  Shield,
  Eye
} from "lucide-react";

const navigation = [
  { 
    name: "Espace Fiscal", 
    href: "/tax-admin", 
    icon: FileText,
    description: "Vue principale"
  },
  { 
    name: "Comptabilité", 
    href: "/accountant", 
    icon: Calculator,
    description: "Rapports fiscaux",
    restricted: true
  },
  { 
    name: "Trésorerie", 
    href: "/treasury", 
    icon: TrendingUp,
    description: "Flux fiscaux",
    restricted: true
  },
  { 
    name: "Paramètres", 
    href: "/settings", 
    icon: Settings,
    description: "Limité"
  },
];

export function FiscalSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BMS Fiscal</h1>
            <p className="text-xs text-gray-500">Administration Fiscale</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 text-purple-700">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Accès consultation</span>
        </div>
        <p className="text-xs text-purple-600 mt-1">
          Vue limitée aux déclarations fiscales
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-4 h-4" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.restricted && (
                    <Eye className="w-3 h-3 opacity-60" />
                  )}
                </div>
                <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-app-border">
        <div className="text-xs text-gray-500 text-center">
          <p>Administration Fiscale</p>
          <p>Accès limité</p>
        </div>
      </div>
    </div>
  );
}
