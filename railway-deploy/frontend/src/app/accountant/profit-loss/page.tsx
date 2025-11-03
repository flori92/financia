"use client";
// Compte de résultat - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";

interface ProfitLossItem {
  name: string;
  amount: number;
  type: 'revenue' | 'expense';
}

interface ProfitLossData {
  revenues: ProfitLossItem[];
  expenses: ProfitLossItem[];
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
  period: string;
}

export default function ProfitLossPage() {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du compte de résultat depuis l'API
  const loadProfitLoss = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7"; // TODO: depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/profit-loss?companyId=${companyId}`,
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
      const transformedData: ProfitLossData = {
        revenues: apiData.revenues || [],
        expenses: apiData.expenses || [],
        totalRevenue: apiData.totalRevenue || 0,
        totalExpenses: apiData.totalExpenses || 0,
        netResult: apiData.netResult || 0,
        period: apiData.period || 'Période en cours'
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Erreur chargement compte de résultat:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
      setData({
        revenues: [
          { name: "Ventes de marchandises", amount: 150000, type: 'revenue' },
          { name: "Prestations de services", amount: 80000, type: 'revenue' }
        ],
        expenses: [
          { name: "Achats", amount: 80000, type: 'expense' },
          { name: "Charges de personnel", amount: 45000, type: 'expense' },
          { name: "Charges externes", amount: 25000, type: 'expense' }
        ],
        totalRevenue: 230000,
        totalExpenses: 150000,
        netResult: 80000,
        period: 'Données de démonstration'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadProfitLoss();
  }, []);

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Compte de résultat</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du compte de résultat...</p>
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
          <h1 className="text-2xl font-semibold">Compte de résultat</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadProfitLoss}
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
          <h1 className="text-2xl font-semibold">Compte de résultat</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
        <button
          onClick={loadProfitLoss}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>
      
      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PRODUITS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-green-600">PRODUITS</h2>
            </div>
            {data.revenues.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun produit enregistré</p>
            ) : (
              data.revenues.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <span>{item.name}</span>
                  <span className="font-medium text-green-600">
                    {new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
              <span>TOTAL PRODUITS</span>
              <span className="text-green-600">
                {new Intl.NumberFormat('fr-FR').format(data.totalRevenue)} FCFA
              </span>
            </div>
          </div>

          {/* CHARGES */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-red-600">CHARGES</h2>
            </div>
            {data.expenses.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune charge enregistrée</p>
            ) : (
              data.expenses.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b">
                  <span>{item.name}</span>
                  <span className="font-medium text-red-600">
                    {new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
              <span>TOTAL CHARGES</span>
              <span className="text-red-600">
                {new Intl.NumberFormat('fr-FR').format(data.totalExpenses)} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* RÉSULTAT NET */}
        <div className="mt-8 pt-6 border-t-2">
          <div className={`flex justify-between items-center text-xl font-bold ${
            data.netResult >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className="flex items-center gap-2">
              {data.netResult >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              <span>RÉSULTAT NET</span>
            </div>
            <span>
              {data.netResult >= 0 ? '+' : ''}
              {new Intl.NumberFormat('fr-FR').format(data.netResult)} FCFA
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {data.netResult >= 0 ? 'Bénéfice' : 'Perte'} de la période
          </div>
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
    </div>
  );
}