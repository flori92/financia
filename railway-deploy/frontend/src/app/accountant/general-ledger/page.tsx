"use client";
import { useState } from "react";
import { Search, Filter, Download, Calendar } from "lucide-react";

export default function GeneralLedgerPage() {
  const [ledgerEntries] = useState([
    { date: "2025-01-15", account: "411000", description: "Vente client ABC", debit: 120000, credit: 0, balance: 120000 },
    { date: "2025-01-16", account: "411000", description: "Paiement client ABC", debit: 0, credit: 120000, balance: 0 },
    { date: "2025-01-17", account: "411000", description: "Vente client XYZ", debit: 85000, credit: 0, balance: 85000 }
  ]);
  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Grand livre</h1>
          <p className="text-gray-600">Consultation détaillée des mouvements par compte</p>
        </div>
        <button
          onClick={() => triggerToast("success", "Export PDF/Excel disponible prochainement.")}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
        >
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un compte..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" className="border border-gray-300 rounded-lg px-3 py-2" />
            <span className="text-gray-500">à</span>
            <input type="date" className="border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Débit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Crédit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 font-mono text-sm">{entry.account}</td>
                  <td className="py-3 px-4">{entry.description}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {entry.debit > 0 ? new Intl.NumberFormat('fr-FR').format(entry.debit) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    {entry.credit > 0 ? new Intl.NumberFormat('fr-FR').format(entry.credit) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(entry.balance)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}