"use client";
import { getBaseUrl } from "@/lib/api";
import { useState } from "react";
import { Download, Printer, Calendar } from "lucide-react";

export default function TrialBalancePage() {
  const [balanceData] = useState([
    { account: "101000", name: "Capital social", debit: 0, credit: 100000 },
    { account: "411000", name: "Clients", debit: 85000, credit: 0 },
    { account: "401000", name: "Fournisseurs", debit: 0, credit: 25000 },
    { account: "701000", name: "Ventes", debit: 0, credit: 150000 },
    { account: "607000", name: "Achats", debit: 80000, credit: 0 },
    { account: "512000", name: "Banque", debit: 110000, credit: 0 }
  ]);

  const totalDebit = balanceData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = balanceData.reduce((sum, item) => sum + item.credit, 0);

  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const handleExportExcel = async () => {
    try {
      const companyId = "default-company"; // TODO: récupérer depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/export/trial-balance?companyId=${companyId}`,
        { method: 'GET' }
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-verification-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      triggerToast("success", "Export CSV téléchargé avec succès !");
    } catch (error) {
      triggerToast("info", "Erreur lors de l'export. Vérifiez que le backend est démarré.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Balance générale</h1>
          <p className="text-gray-600">Balance des comptes au 31/01/2025</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => triggerToast("info", "Impression PDF disponible prochainement.")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Balance au 31 janvier 2025</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" className="border border-gray-300 rounded-lg px-3 py-2" defaultValue="2025-01-31" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Libellé</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Débit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Crédit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{item.account}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {item.debit > 0 ? new Intl.NumberFormat('fr-FR').format(item.debit) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {item.credit > 0 ? new Intl.NumberFormat('fr-FR').format(item.credit) + ' FCFA' : '-'}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    (item.debit - item.credit) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {new Intl.NumberFormat('fr-FR').format(Math.abs(item.debit - item.credit))} FCFA
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-3 px-4" colSpan={2}>TOTAUX</td>
                <td className="py-3 px-4 text-right text-green-600">
                  {new Intl.NumberFormat('fr-FR').format(totalDebit)} FCFA
                </td>
                <td className="py-3 px-4 text-right text-red-600">
                  {new Intl.NumberFormat('fr-FR').format(totalCredit)} FCFA
                </td>
                <td className="py-3 px-4 text-right">
                  {totalDebit === totalCredit ? (
                    <span className="text-green-600">✓ Équilibrée</span>
                  ) : (
                    <span className="text-red-600">⚠ Déséquilibrée</span>
                  )}
                </td>
              </tr>
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