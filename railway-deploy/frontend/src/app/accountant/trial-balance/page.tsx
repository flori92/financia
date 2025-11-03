"use client";
// Balance générale - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { Download, Printer, Calendar, RefreshCw, AlertCircle } from "lucide-react";

interface TrialBalanceItem {
  account: string;
  name: string;
  debit: number;
  credit: number;
}

interface TrialBalanceData {
  accounts: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  period: string;
}

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  // Charger les données de la balance depuis l'API
  const loadTrialBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7"; // TODO: depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/trial-balance?companyId=${companyId}&date=${selectedDate}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
      // Transformer les données API au format attendu
      const transformedData: TrialBalanceData = {
        accounts: apiData.accounts || [],
        totalDebit: apiData.totalDebit || 0,
        totalCredit: apiData.totalCredit || 0,
        isBalanced: apiData.isBalanced || false,
        period: apiData.period || `Balance au ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Erreur chargement balance générale:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
      const mockAccounts = [
        { account: "101000", name: "Capital social", debit: 0, credit: 100000 },
        { account: "411000", name: "Clients", debit: 85000, credit: 0 },
        { account: "401000", name: "Fournisseurs", debit: 0, credit: 25000 },
        { account: "701000", name: "Ventes", debit: 0, credit: 150000 },
        { account: "607000", name: "Achats", debit: 80000, credit: 0 },
        { account: "512000", name: "Banque", debit: 110000, credit: 0 }
      ];
      
      const totalDebit = mockAccounts.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = mockAccounts.reduce((sum, item) => sum + item.credit, 0);
      
      setData({
        accounts: mockAccounts,
        totalDebit,
        totalCredit,
        isBalanced: totalDebit === totalCredit,
        period: 'Données de démonstration'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand la date change
  useEffect(() => {
    loadTrialBalance();
  }, [selectedDate]);

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

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Balance générale</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la balance générale...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Balance générale</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadTrialBalance}
                className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Balance générale</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
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
          <h2 className="text-lg font-semibold">Balance au {new Date(selectedDate).toLocaleDateString('fr-FR')}</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input 
              type="date" 
              className="border border-gray-300 rounded-lg px-3 py-2" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={loadTrialBalance}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
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
              {data.accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aucune transaction trouvée pour cette période
                  </td>
                </tr>
              ) : (
                data.accounts.map((item, idx) => (
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
                ))
              )}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-3 px-4" colSpan={2}>TOTAUX</td>
                <td className="py-3 px-4 text-right text-green-600">
                  {new Intl.NumberFormat('fr-FR').format(data.totalDebit)} FCFA
                </td>
                <td className="py-3 px-4 text-right text-red-600">
                  {new Intl.NumberFormat('fr-FR').format(data.totalCredit)} FCFA
                </td>
                <td className="py-3 px-4 text-right">
                  {data.isBalanced ? (
                    <span className="text-green-600">✓ Équilibrée</span>
                  ) : (
                    <span className="text-red-600">✗ Déséquilibrée</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicateur mode démo si erreur */}
      {error && data && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Mode démonstration: {data.period}
            </p>
          </div>
        </div>
      )}

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