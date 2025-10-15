"use client";
import { Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-14 bg-app-topbar text-white flex items-center px-4 gap-3">
      <button className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/20" aria-label="Menu">
        ☰
      </button>
      <div className="flex-1 max-w-[720px] mx-auto hidden md:flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-white/60" />
          <input
            className="w-full rounded-md bg-white/10 pl-10 pr-3 py-2 text-sm placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30"
            placeholder="Rechercher..."
            aria-label="Rechercher"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="hidden md:inline-flex rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Nouvelle transaction</button>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Notifications">🔔</button>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Profil">👤</button>
      </div>
    </header>
  );
}
