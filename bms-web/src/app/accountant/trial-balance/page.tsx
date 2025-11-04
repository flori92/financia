"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Download, Printer, Calendar, Loader2, AlertCircle } from "lucide-react";

interface TrialBalanceItem {
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

interface TrialBalanceData {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  asOfDate: string;
  companyName: string;
}

export default function TrialBalancePage() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadTrialBalance();
  }, [selectedDate]);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const loadTrialBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      const data = await apiGet("/api/v1/accounting/trial-balance", {
        companyId,
        asOfDate: selectedDate,
      });

      setTrialBalance(data);
    } catch (err: any) {
      console.error("Erreur chargement balance:", err);
      setError(
        err.message || "Erreur lors du chargement de la balance générale"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const companyId = getCompanyId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
      const response = await fetch(
        `${apiUrl}/api/v1/accounting/export/trial-balance?companyId=${companyId}&asOfDate=${selectedDate}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/csv',
            'Authorization': `Bearer ${localStorage.getItem('bms_token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-generale-${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      triggerToast("success", "Export CSV téléchargé avec succès !");
    } catch (error) {
      triggerToast("error", "Erreur lors de l'export.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Erreur</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadTrialBalance}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!trialBalance) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Balance Générale
          </h1>
          <p className="text-gray-600">
            {trialBalance.companyName || "Société"} - Au{" "}
            {new Date(selectedDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Balance Status */}
      {trialBalance.isBalanced ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            ✓
          </div>
          <div>
            <h4 className="font-semibold text-green-900">Balance équilibrée</h4>
            <p className="text-sm text-green-700">
              Total Débit = Total Crédit ({new Intl.NumberFormat("fr-FR").format(trialBalance.totalDebit)} FCFA)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900">Attention : Balance déséquilibrée</h4>
            <p className="text-sm text-red-700">
              Total Débit ({new Intl.NumberFormat("fr-FR").format(trialBalance.totalDebit)} FCFA) ≠
              Total Crédit ({new Intl.NumberFormat("fr-FR").format(trialBalance.totalCredit)} FCFA)
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Compte
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Libellé
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Débit
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Crédit
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Solde
                </th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-sm text-gray-700">
                    {item.accountNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-900">{item.accountName}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {item.debit > 0
                      ? new Intl.NumberFormat("fr-FR").format(item.debit) + " FCFA"
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {item.credit > 0
                      ? new Intl.NumberFormat("fr-FR").format(item.credit) + " FCFA"
                      : "-"}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      item.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.balance >= 0 ? "+" : ""}
                    {new Intl.NumberFormat("fr-FR").format(item.balance)} FCFA
                  </td>
                </tr>
              ))}
              <tr className="border-t-4 border-gray-300 bg-gray-50 font-bold text-lg">
                <td className="py-4 px-4" colSpan={2}>
                  TOTAUX
                </td>
                <td className="py-4 px-4 text-right text-green-700">
                  {new Intl.NumberFormat("fr-FR").format(trialBalance.totalDebit)}{" "}
                  FCFA
                </td>
                <td className="py-4 px-4 text-right text-red-700">
                  {new Intl.NumberFormat("fr-FR").format(trialBalance.totalCredit)}{" "}
                  FCFA
                </td>
                <td className="py-4 px-4 text-right">
                  {trialBalance.isBalanced ? (
                    <span className="text-green-600 flex items-center justify-end gap-2">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </span>
                      Équilibrée
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center justify-end gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Déséquilibrée
                    </span>
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
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
