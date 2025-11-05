"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Calendar, Download, Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface IncomeStatementItem {
  accountNumber: string;
  accountName: string;
  amount: number;
  syscohadaClass: number;
}

interface IncomeStatementData {
  revenue: {
    ventesProduitsServices: IncomeStatementItem[];
    autresProduits: IncomeStatementItem[];
    produitsFinanciers: IncomeStatementItem[];
    totalRevenue: number;
  };
  expenses: {
    achatsConsommes: IncomeStatementItem[];
    chargesPersonnel: IncomeStatementItem[];
    chargesExternes: IncomeStatementItem[];
    autresCharges: IncomeStatementItem[];
    chargesFinancieres: IncomeStatementItem[];
    totalExpenses: number;
  };
  netIncome: number;
  startDate: string;
  endDate: string;
  companyName: string;
}

export default function ProfitLossPage() {
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadIncomeStatement();
  }, [startDate, endDate]);

  const loadIncomeStatement = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      const data = await apiGet("/api/v1/accounting/reports/income-statement", {
        companyId,
        startDate,
        endDate,
      });

      setIncomeStatement(data);
    } catch (err: any) {
      console.error("Erreur chargement compte de résultat:", err);
      setError(
        err.message || "Erreur lors du chargement du compte de résultat"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const companyId = getCompanyId();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(
        `${apiUrl}/api/v1/accounting/reports/income-statement?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}&format=csv`,
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
      a.download = `compte-resultat-${startDate}-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur export:", error);
    }
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
            onClick={loadIncomeStatement}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!incomeStatement) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800">Aucune donnée disponible</p>
      </div>
    );
  }

  // Vérification de la structure des données avant utilisation
  const revenue = incomeStatement.revenue || { totalRevenue: 0, ventesProduitsServices: [], autresProduits: [], produitsFinanciers: [] };
  const expenses = incomeStatement.expenses || { totalExpenses: 0, achatsConsommes: [], chargesPersonnel: [], chargesExternes: [], autresCharges: [], chargesFinancieres: [] };
  const netIncome = incomeStatement.netIncome || 0;

  const renderSection = (
    title: string,
    items: IncomeStatementItem[],
    color: "green" | "red" = "green"
  ) => (
    <div className="mb-6">
      <h3 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${color === "green" ? "text-green-700" : "text-red-700"}`}>
        {title}
      </h3>
      {items && items.length > 0 ? (
        items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between py-2 border-b border-gray-100 hover:bg-gray-50"
          >
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 font-mono">
                {item.accountNumber}
              </span>
              <span className="text-gray-900">{item.accountName}</span>
            </div>
            <span className={`font-medium ${color === "green" ? "text-green-600" : "text-red-600"}`}>
              {new Intl.NumberFormat("fr-FR").format(item.amount)} FCFA
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500 italic py-2">Aucune donnée</p>
      )}
    </div>
  );

  const margin = revenue.totalRevenue > 0
    ? ((netIncome / revenue.totalRevenue) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Compte de Résultat OHADA
          </h1>
          <p className="text-gray-600">
            {incomeStatement.companyName || "Société"} - Du{" "}
            {new Date(startDate).toLocaleDateString("fr-FR")} au{" "}
            {new Date(endDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <span className="flex items-center text-gray-500">au</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Produits</p>
              <p className="text-2xl font-bold text-green-900">
                {new Intl.NumberFormat("fr-FR").format(revenue.totalRevenue)} FCFA
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Total Charges</p>
              <p className="text-2xl font-bold text-red-900">
                {new Intl.NumberFormat("fr-FR").format(expenses.totalExpenses)} FCFA
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className={`bg-gradient-to-br ${netIncome >= 0 ? "from-blue-50 to-blue-100 border-blue-200" : "from-orange-50 to-orange-100 border-orange-200"} rounded-xl p-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${netIncome >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                Résultat Net ({margin}%)
              </p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-blue-900" : "text-orange-900"}`}>
                {netIncome >= 0 ? "+" : ""}
                {new Intl.NumberFormat("fr-FR").format(netIncome)} FCFA
              </p>
            </div>
            {netIncome >= 0 ? (
              <TrendingUp className="w-8 h-8 text-blue-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-orange-600" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PRODUITS */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-green-700 border-b pb-3">
              PRODUITS (Classe 7)
            </h2>

            {renderSection(
              "Ventes de Produits et Services",
              revenue.ventesProduitsServices,
              "green"
            )}
            {renderSection(
              "Autres Produits d'Exploitation",
              revenue.autresProduits,
              "green"
            )}
            {renderSection(
              "Produits Financiers",
              revenue.produitsFinanciers,
              "green"
            )}

            <div className="flex justify-between py-4 font-bold text-lg text-green-700 border-t-4 border-green-500 mt-4">
              <span>TOTAL PRODUITS</span>
              <span>
                {new Intl.NumberFormat("fr-FR").format(
                  revenue.totalRevenue
                )}{" "}
                FCFA
              </span>
            </div>
          </div>

          {/* CHARGES */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-red-700 border-b pb-3">
              CHARGES (Classe 6)
            </h2>

            {renderSection(
              "Achats Consommés",
              expenses.achatsConsommes,
              "red"
            )}
            {renderSection(
              "Charges de Personnel",
              expenses.chargesPersonnel,
              "red"
            )}
            {renderSection(
              "Charges Externes",
              expenses.chargesExternes,
              "red"
            )}
            {renderSection(
              "Autres Charges d'Exploitation",
              expenses.autresCharges,
              "red"
            )}
            {renderSection(
              "Charges Financières",
              expenses.chargesFinancieres,
              "red"
            )}

            <div className="flex justify-between py-4 font-bold text-lg text-red-700 border-t-4 border-red-500 mt-4">
              <span>TOTAL CHARGES</span>
              <span>
                {new Intl.NumberFormat("fr-FR").format(
                  expenses.totalExpenses
                )}{" "}
                FCFA
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-4 border-gray-300">
          <div
            className={`flex justify-between text-2xl font-bold ${
              netIncome >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>RÉSULTAT NET DE L'EXERCICE</span>
            <span>
              {netIncome >= 0 ? "+" : ""}
              {new Intl.NumberFormat("fr-FR").format(netIncome)} FCFA
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Marge nette : {margin}% du chiffre d'affaires
          </p>
        </div>
      </div>
    </div>
  );
}
