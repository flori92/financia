// Sidebar pour Banque (vue limitée)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Calculator, 
  TrendingUp, 
  Settings,
  Eye
} from "lucide-react";

const navigation = [
  { 
    name: "Espace Bancaire", 
    href: "/bank-partner", 
    icon: Building2,
    description: "Vue principale"
  },
  { 
    name: "Comptabilité", 
    href: "/accountant", 
    icon: Calculator,
    description: "Soldes seulement",
    restricted: true
  },
  { 
    name: "Trésorerie", 
    href: "/treasury", 
    icon: TrendingUp,
    description: "Flux seulement",
    restricted: true
  },
  { 
    name: "Paramètres", 
    href: "/settings", 
    icon: Settings,
    description: "Limité"
  },
];

export function BankSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BMS Bank</h1>
            <p className="text-xs text-gray-500">Espace Partenaire</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Accès consultation</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Vue limitée aux opérations bancaires
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
                  ? "bg-blue-600 text-white"
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
          <p>Partenaire Bancaire</p>
          <p>Accès limité</p>
        </div>
      </div>
    </div>
  );
}
