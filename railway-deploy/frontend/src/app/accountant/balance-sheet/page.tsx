"use client";
// Bilan comptable - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Scale } from "lucide-react";

interface BalanceSheetItem {
  name: string;
  amount: number;
  type: 'asset' | 'liability' | 'equity';
}

interface BalanceSheetData {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  isBalanced: boolean;
  period: string;
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du bilan depuis l'API
  const loadBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7"; // TODO: depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/balance-sheet?companyId=${companyId}`,
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
      const transformedData: BalanceSheetData = {
        assets: apiData.assets || [],
        liabilities: apiData.liabilities || [],
        totalAssets: apiData.totalAssets || 0,
        totalLiabilities: apiData.totalLiabilities || 0,
        isBalanced: apiData.isBalanced || false,
        period: apiData.period || 'Période en cours'
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Erreur chargement bilan comptable:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
      const mockAssets = [
        { name: "Immobilisations", amount: 500000, type: 'asset' as const },
        { name: "Stocks", amount: 150000, type: 'asset' as const },
        { name: "Créances clients", amount: 85000, type: 'asset' as const },
        { name: "Trésorerie", amount: 110000, type: 'asset' as const }
      ];
      
      const mockLiabilities = [
        { name: "Capital", amount: 100000, type: 'equity' as const },
        { name: "Résultat", amount: 70000, type: 'equity' as const },
        { name: "Dettes fournisseurs", amount: 25000, type: 'liability' as const },
        { name: "Emprunts", amount: 650000, type: 'liability' as const }
      ];
      
      const totalAssets = mockAssets.reduce((sum, item) => sum + item.amount, 0);
      const totalLiabilities = mockLiabilities.reduce((sum, item) => sum + item.amount, 0);
      
      setData({
        assets: mockAssets,
        liabilities: mockLiabilities,
        totalAssets,
        totalLiabilities,
        isBalanced: totalAssets === totalLiabilities,
        period: 'Données de démonstration'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadBalanceSheet();
  }, []);

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Bilan comptable</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du bilan comptable...</p>
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
          <h1 className="text-2xl font-semibold">Bilan comptable</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadBalanceSheet}
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
          <h1 className="text-2xl font-semibold">Bilan comptable</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
        <button
          onClick={loadBalanceSheet}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIF */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-600">ACTIF</h2>
          </div>
          {data.assets.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun actif enregistré</p>
          ) : (
            data.assets.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <span className="font-medium text-blue-600">
                  {new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA
                </span>
              </div>
            ))
          )}
          <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
            <span>TOTAL ACTIF</span>
            <span className="text-blue-600">
              {new Intl.NumberFormat('fr-FR').format(data.totalAssets)} FCFA
            </span>
          </div>
        </div>

        {/* PASSIF */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-orange-600">PASSIF</h2>
          </div>
          {data.liabilities.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun passif enregistré</p>
          ) : (
            data.liabilities.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <span className={`font-medium ${
                  item.type === 'equity' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA
                </span>
              </div>
            ))
          )}
          <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
            <span>TOTAL PASSIF</span>
            <span className="text-orange-600">
              {new Intl.NumberFormat('fr-FR').format(data.totalLiabilities)} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* ÉQUILIBRE BILAN */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold">Équilibre du bilan</h3>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            data.isBalanced 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-rose-100 text-rose-800'
          }`}>
            {data.isBalanced ? '✓ BILAN ÉQUILIBRÉ' : '✗ BILAN DÉSÉQUILIBRÉ'}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Actif</div>
            <div className="text-lg font-bold text-blue-600">
              {new Intl.NumberFormat('fr-FR').format(data.totalAssets)} FCFA
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600">Passif</div>
            <div className="text-lg font-bold text-orange-600">
              {new Intl.NumberFormat('fr-FR').format(data.totalLiabilities)} FCFA
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Écart</div>
            <div className={`text-lg font-bold ${
              data.totalAssets - data.totalLiabilities === 0 
                ? 'text-emerald-600' 
                : 'text-rose-600'
            }`}>
              {new Intl.NumberFormat('fr-FR').format(Math.abs(data.totalAssets - data.totalLiabilities))} FCFA
            </div>
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