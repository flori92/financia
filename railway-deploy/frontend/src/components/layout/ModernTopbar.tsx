"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, HelpCircle, Plus, Loader2 } from "lucide-react";
import { apiGet, getCompanyId } from "@/lib/api";
import { CompanySelector } from "../shared/CompanySelector";

type AlertItem = {
  message: string;
  level?: string;
};

export function ModernTopbar() {
  const router = useRouter();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const helpRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function toggleNotifications(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setShowHelpMenu(false);
    const willOpen = !showNotifMenu;
    setShowNotifMenu(willOpen);
    if (!willOpen) {
      return;
    }
    setLoadingAlerts(true);
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setAlerts([]);
        return;
      }
      const response = await apiGet("/api/v1/treasury/alerts", { companyId });
      setAlerts(response?.alerts ?? []);
    } catch (error) {
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }

  function toggleHelp(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setShowNotifMenu(false);
    setShowHelpMenu(prev => !prev);
  }

  function goToNewEntry() {
    router.push("/accountant/journal");
  }

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
          <CompanySelector 
            onCompanyChange={(companyId) => {
              // Recharger la page actuelle pour mettre à jour les données
              window.location.reload();
            }} 
          />
        </div>
        <div className="flex items-center gap-3">
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
              aria-haspopup="true"
              aria-expanded={showNotifMenu}
            >
              <Bell className="text-gray-600 w-5 h-5" strokeWidth={1.5} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  <p className="text-xs text-gray-500">Dernières alertes trésorerie</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loadingAlerts ? (
                    <div className="flex items-center justify-center py-6 text-gray-500 text-sm gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Chargement...
                    </div>
                  ) : alerts.length ? (
                    alerts.map((alert, index) => (
                      <div
                        key={`${alert.message}-${index}`}
                        className={`px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 ${
                          alert.level === "critical"
                            ? "bg-red-50 text-red-700"
                            : alert.level === "warning"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {alert.message}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">Aucune alerte disponible</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div ref={helpRef} className="relative">
            <button
              type="button"
              onClick={toggleHelp}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
              aria-haspopup="true"
              aria-expanded={showHelpMenu}
            >
              <HelpCircle className="text-gray-600 w-5 h-5" strokeWidth={1.5} />
            </button>
            {showHelpMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Centre d'aide</p>
                  <p className="text-xs text-gray-500">Guides et support</p>
                </div>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => router.push("/help/documentation")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Documentation
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/help/support")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Contacter le support
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/help/shortcuts")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Raccourcis clavier
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={goToNewEntry}
            className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white transition-all text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Nouvelle écriture
          </button>
        </div>
      </div>
    </header>
  );
}
