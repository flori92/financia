"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Calendar, Download, Loader2, AlertCircle } from "lucide-react";

interface BalanceSheetItem {
  accountNumber: string;
  accountName: string;
  amount: number;
  syscohadaClass: number;
}

interface BalanceSheetData {
  assets: {
    immobilisations: BalanceSheetItem[];
    actifCirculant: BalanceSheetItem[];
    tresorerie: BalanceSheetItem[];
    totalActif: number;
  };
  liabilities: {
    capitauxPropres: BalanceSheetItem[];
    dettesLongTerme: BalanceSheetItem[];
    dettesCourtTerme: BalanceSheetItem[];
    totalPassif: number;
  };
  asOfDate: string;
  companyName: string;
}

export default function BalanceSheetPage() {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadBalanceSheet();
  }, [selectedDate]);

  const loadBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      const data = await apiGet("/api/v1/accounting/reports/balance-sheet", {
        companyId,
        asOfDate: selectedDate,
      });

      setBalanceSheet(data);
    } catch (err: any) {
      console.error("Erreur chargement bilan:", err);
      setError(
        err.message || "Erreur lors du chargement du bilan comptable"
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
        `${apiUrl}/api/v1/accounting/reports/balance-sheet?companyId=${companyId}&asOfDate=${selectedDate}&format=csv`,
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
      a.download = `bilan-${selectedDate}.csv`;
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
            onClick={loadBalanceSheet}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!balanceSheet) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800">Aucune donnée disponible</p>
      </div>
    );
  }

  const renderSection = (title: string, items: BalanceSheetItem[], total?: number) => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
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
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat("fr-FR").format(item.amount)} FCFA
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500 italic py-2">Aucune donnée</p>
      )}
      {total !== undefined && (
        <div className="flex justify-between py-3 font-semibold text-gray-900 border-t-2 border-gray-300 mt-2">
          <span>Total {title}</span>
          <span>{new Intl.NumberFormat("fr-FR").format(total)} FCFA</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bilan Comptable OHADA
          </h1>
          <p className="text-gray-600">
            {balanceSheet.companyName || "Société"} - Au{" "}
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
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIF */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-3">
            ACTIF
          </h2>

          {renderSection(
            "Immobilisations (Classe 2)",
            balanceSheet.assets.immobilisations
          )}
          {renderSection(
            "Actif Circulant (Classe 3-4)",
            balanceSheet.assets.actifCirculant
          )}
          {renderSection(
            "Trésorerie (Classe 5)",
            balanceSheet.assets.tresorerie
          )}

          <div className="flex justify-between py-4 font-bold text-lg text-gray-900 border-t-4 border-[#0D9488] mt-4">
            <span>TOTAL ACTIF</span>
            <span className="text-[#0D9488]">
              {new Intl.NumberFormat("fr-FR").format(
                balanceSheet.assets.totalActif
              )}{" "}
              FCFA
            </span>
          </div>
        </div>

        {/* PASSIF */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-3">
            PASSIF
          </h2>

          {renderSection(
            "Capitaux Propres (Classe 1)",
            balanceSheet.liabilities.capitauxPropres
          )}
          {renderSection(
            "Dettes à Long Terme",
            balanceSheet.liabilities.dettesLongTerme
          )}
          {renderSection(
            "Dettes à Court Terme (Classe 4)",
            balanceSheet.liabilities.dettesCourtTerme
          )}

          <div className="flex justify-between py-4 font-bold text-lg text-gray-900 border-t-4 border-[#0D9488] mt-4">
            <span>TOTAL PASSIF</span>
            <span className="text-[#0D9488]">
              {new Intl.NumberFormat("fr-FR").format(
                balanceSheet.liabilities.totalPassif
              )}{" "}
              FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Vérification équilibre */}
      {balanceSheet.assets.totalActif !== balanceSheet.liabilities.totalPassif && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h4 className="font-semibold text-yellow-900">
              Attention : Bilan déséquilibré
            </h4>
            <p className="text-sm text-yellow-800">
              Total Actif ({new Intl.NumberFormat("fr-FR").format(balanceSheet.assets.totalActif)} FCFA)
              ≠ Total Passif ({new Intl.NumberFormat("fr-FR").format(balanceSheet.liabilities.totalPassif)} FCFA)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
