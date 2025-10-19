"use client";
import { Search, Bell, HelpCircle, Plus } from "lucide-react";

export function ModernTopbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Recherche universelle (Ctrl+K)"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500">
              ⌘K
            </kbd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Bell className="text-gray-600 w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all">
            <HelpCircle className="text-gray-600 w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white transition-all text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Nouvelle écriture
          </button>
        </div>
      </div>
    </header>
  );
}
