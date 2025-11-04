"use client";
// Balance générale - MODE DYNAMIQUE avec API backend
import { apiGet, getCompanyId } from "@/lib/api";
import { ProfessionalExporter } from "@/lib/export-utils";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { Download, Printer, Calendar, RefreshCw, AlertCircle } from "lucide-react";

interface TrialBalanceItem {
  account: string;
  name: string;
  debit: number;
  credit: number;
  accountNumber: string;
  accountName: string;
  balance: number;
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

  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  // Charger les données de la balance depuis l'API
  const loadTrialBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const apiData = await apiGet('/api/v1/accounting/trial-balance', { companyId, date: selectedDate });
      
      // Transformer les données API au format attendu
      const transformedData: TrialBalanceData = {
        accounts: apiData.accounts || [],
        totalDebit: apiData.totalDebit || 0,
        totalCredit: apiData.totalCredit || 0,
        isBalanced: apiData.isBalanced || false,
        period: apiData.period || `Balance au ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
      };
      
      setData(transformedData);
      triggerToast("success", "Balance générale chargée avec succès");
    } catch (err: any) {
      console.error('Erreur chargement balance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      triggerToast("error", errorMessage);
      
      // Gérer spécifiquement l'erreur 404 (endpoint non disponible)
      if (err?.message?.includes('404') || err?.status === 404) {
        triggerToast("info", "Endpoint balance générale en cours de déploiement. Affichage des données de démonstration.");
      }
      
      // En cas d'erreur, afficher des données de démonstration
      const mockAccounts = [
        { account: "101000", name: "Capital", debit: 0, credit: 10000000, accountNumber: "101000", accountName: "Capital", balance: -10000000 },
        { account: "401000", name: "Fournisseurs", debit: 0, credit: 2000000, accountNumber: "401000", accountName: "Fournisseurs", balance: -2000000 },
        { account: "411000", name: "Clients", debit: 3000000, credit: 0, accountNumber: "411000", accountName: "Clients", balance: 3000000 },
        { account: "512000", name: "Banque", debit: 8000000, credit: 0, accountNumber: "512000", accountName: "Banque", balance: 8000000 },
        { account: "607000", name: "Achats marchandises", debit: 5000000, credit: 0, accountNumber: "607000", accountName: "Achats marchandises", balance: 5000000 },
        { account: "707000", name: "Ventes marchandises", debit: 0, credit: 8000000, accountNumber: "707000", accountName: "Ventes marchandises", balance: -8000000 }
      ];
      
      const totalDebit = mockAccounts.reduce((sum: number, account: any) => sum + account.debit, 0);
      const totalCredit = mockAccounts.reduce((sum: number, account: any) => sum + account.credit, 0);
      
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

  // Imprimer en PDF
  const handlePrintPDF = () => {
    if (!data || data.accounts.length === 0) {
      triggerToast("error", "Aucune donnée à imprimer");
      return;
    }

    try {
      // Créer le contenu HTML pour l'impression
      const printContent = `
        <html>
          <head>
            <title>Balance Générale - ${data.period}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; color: #1f2937; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .text-right { text-align: right; }
              .total { font-weight: bold; background-color: #f9fafb; }
            </style>
          </head>
          <body>
            <h1>Balance Générale</h1>
            <p>Période: ${data.period}</p>
            <table>
              <thead>
                <tr>
                  <th>Compte</th>
                  <th>Libellé</th>
                  <th class="text-right">Débit</th>
                  <th class="text-right">Crédit</th>
                  <th class="text-right">Solde</th>
                </tr>
              </thead>
              <tbody>
                ${data.accounts.map(account => `
                  <tr>
                    <td>${account.accountNumber}</td>
                    <td>${account.accountName}</td>
                    <td class="text-right">${account.debit.toLocaleString('fr-FR')} FCFA</td>
                    <td class="text-right">${account.credit.toLocaleString('fr-FR')} FCFA</td>
                    <td class="text-right">${account.balance.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                `).join('')}
                <tr class="total">
                  <td colspan="2">TOTAL</td>
                  <td class="text-right">${data.totalDebit.toLocaleString('fr-FR')} FCFA</td>
                  <td class="text-right">${data.totalCredit.toLocaleString('fr-FR')} FCFA</td>
                  <td class="text-right">${(data.totalDebit - data.totalCredit).toLocaleString('fr-FR')} FCFA</td>
                </tr>
              </tbody>
            </table>
            <p style="margin-top: 30px; text-align: center; color: #6b7280;">
              Généré le ${new Date().toLocaleDateString('fr-FR')} par BMS
            </p>
          </body>
        </html>
      `;

      // Ouvrir dans une nouvelle fenêtre et imprimer
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }

      triggerToast("success", "Impression PDF lancée");
    } catch (error) {
      console.error('Erreur impression:', error);
      triggerToast("error", "Erreur lors de l'impression");
    }
  };

  // Charger au montage et quand la date change
  useEffect(() => {
    loadTrialBalance();
  }, [selectedDate]);

  const handleExportExcel = async () => {
    try {
      if (!data || data.accounts.length === 0) {
        triggerToast("error", "Aucune donnée à exporter");
        return;
      }

      // Données structurées pour l'export professionnel
      const exportData = {
        title: 'Balance de Vérification',
        headers: ['Compte', 'Libellé', 'Débit', 'Crédit'],
        rows: [
          ...data.accounts.map((item: any) => [
            item.accountNumber,
            item.name,
            item.debit ? item.debit.toLocaleString('fr-FR') + ' FCFA' : '',
            item.credit ? item.credit.toLocaleString('fr-FR') + ' FCFA' : ''
          ]),
          ['', '', '', ''],
          ['', 'TOTAUX', '', ''],
          ['', 'Total Débit', data.totalDebit.toLocaleString('fr-FR') + ' FCFA', ''],
          ['', 'Total Crédit', '', data.totalCredit.toLocaleString('fr-FR') + ' FCFA'],
          ['', 'Solde', (data.totalDebit - data.totalCredit).toLocaleString('fr-FR') + ' FCFA', '']
        ],
        metadata: {
          date: selectedDate,
          company: 'BMS Business Management System',
          period: `Balance au ${selectedDate}`,
          author: 'Service Comptabilité'
        }
      };

      // Choix du format d'export
      const formatChoice = confirm('Choisir le format d\'export:\n\nOK = Excel (formaté avec styles)\nAnnuler = PDF (professionnel imprimable)');
      
      if (formatChoice) {
        // Export Excel avec styles professionnels
        ProfessionalExporter.exportExcel(exportData, 'balance-verification');
        triggerToast("success", "Balance exportée en Excel avec styles professionnels !");
      } else {
        // Export PDF pour impression
        ProfessionalExporter.exportPDF(exportData, 'balance-verification');
        triggerToast("success", "Balance exportée en PDF pour impression !");
      }
    } catch (error) {
      triggerToast("info", "Erreur lors de l'export. Veuillez réessayer.");
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
            onClick={handlePrintPDF}
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