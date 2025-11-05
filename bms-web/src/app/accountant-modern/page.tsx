"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { ModernSidebar } from "@/components/layout/ModernSidebar";
import { ModernTopbar } from "@/components/layout/ModernTopbar";
import {
  Wallet, TrendingUp, Activity, Percent, Calendar, Building,
  Clock, Target, ArrowDownLeft, ArrowUpRight, AlertCircle,
  CalendarClock, TrendingDown, FileCheck, Mail, Link2, FileScan
} from "lucide-react";

export default function AccountantModernPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/accounting/dashboard/metrics")
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <ModernSidebar />
      <div className="flex-1 ml-[72px] transition-all duration-300">
        <ModernTopbar />
        
        <main className="p-8 space-y-8">
          <div className="bg-[#0D9488] rounded-xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight mb-2">Tableau de bord ERP</h1>
                <p className="text-white/80 text-lg mb-6">Vue consolidée de votre activité comptable, trésorerie et fiscale</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Exercice 2024</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Building className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Toutes les entités</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Données synchronisées</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">Dernière clôture</div>
                <div className="text-2xl font-semibold">31/12/2023</div>
                <div className="text-xs text-white/60 mt-1">Clôture annuelle validée</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="text-[#0D9488] w-[22px] h-[22px]" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span>
                  <TrendingUp className="text-green-600 w-4 h-4" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1 font-medium">Trésorerie nette</div>
              <div className="text-3xl font-semibold tracking-tight mb-2">245 890 €</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                <span>28 jours de couverture</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-blue-600 w-[22px] h-[22px]" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+8.2%</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1 font-medium">CA 2024 (YTD)</div>
              <div className="text-3xl font-semibold tracking-tight mb-2">523 420 €</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Target className="w-3 h-3" strokeWidth={1.5} />
                <span>Budget: 480 000 € (109%)</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="text-green-600 w-[22px] h-[22px]" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+15.3%</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1 font-medium">Résultat net</div>
              <div className="text-3xl font-semibold tracking-tight mb-2">87 340 €</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Percent className="w-3 h-3" strokeWidth={1.5} />
                <span>Marge nette: 16.7%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Percent className="text-orange-600 w-[22px] h-[22px]" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">À payer</span>
              </div>
              <div className="text-sm text-gray-500 mb-1 font-medium">TVA due (CA3)</div>
              <div className="text-3xl font-semibold tracking-tight mb-2">42 890 €</div>
              <div className="flex items-center gap-2 text-xs text-orange-600">
                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                <span>Échéance: 15/02/2024</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "BFR", value: "68 450 €", change: "+5% vs M-1" },
              { label: "DSO", value: "42 jours", change: "-3j vs M-1", positive: true },
              { label: "DPO", value: "38 jours", change: "Stable" },
              { label: "ROE", value: "18.4%", change: "+2.1%", positive: true },
              { label: "Ratio liquidité", value: "1.85", change: "Excellent", positive: true },
              { label: "Taux endettement", value: "34%", change: "Optimal" }
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#0D9488] transition-all">
                <div className="text-xs text-gray-500 mb-1 font-medium">{kpi.label}</div>
                <div className="text-xl font-semibold mb-1">{kpi.value}</div>
                <div className={`text-xs ${kpi.positive ? "text-green-600" : "text-gray-500"}`}>{kpi.change}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Alertes</h3>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">3 urgent</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-all">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5 w-4 h-4" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-red-900">Facture en retard</div>
                    <div className="text-xs text-red-700 mt-0.5">SARL Martin - 5 200€ (12j)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100 cursor-pointer hover:bg-orange-100 transition-all">
                  <CalendarClock className="text-orange-600 flex-shrink-0 mt-0.5 w-4 h-4" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-orange-900">Déclaration TVA</div>
                    <div className="text-xs text-orange-700 mt-0.5">CA3 à télétransmettre (J-7)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-6">Transactions récentes</h2>
              <div className="space-y-3">
                {[
                  { type: "in", label: "Paiement client - ABC Corp", desc: "Facture #INV-2024-001", amount: "+12 500 €", time: "Aujourd'hui 14:32" },
                  { type: "out", label: "Loyer bureau - Janvier 2024", desc: "Prélèvement automatique", amount: "-3 200 €", time: "Hier 09:00" }
                ].map((tx, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-[#0D9488] transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg ${tx.type === "in" ? "bg-green-50" : "bg-red-50"} flex items-center justify-center`}>
                      {tx.type === "in" ? <ArrowDownLeft className="text-green-600 w-[18px] h-[18px]" /> : <ArrowUpRight className="text-red-600 w-[18px] h-[18px]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{tx.label}</div>
                      <div className="text-xs text-gray-500">{tx.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${tx.type === "in" ? "text-green-600" : "text-red-600"}`}>{tx.amount}</div>
                      <div className="text-xs text-gray-500">{tx.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
