"use client";
// Bilan comptable - MODE DYNAMIQUE avec API backend
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Scale } from "lucide-react";


import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
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

function BalanceSheetPageContent() {
  const companyId = useCompanyId();
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  // Charger les données du bilan depuis l'API
  const loadBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = companyId;
      if (!companyId) {
        throw new Error('Aucune société sélectionnée');
      }
      
      const apiData = await apiGet('/api/v1/accounting/balance-sheet', { companyId });
      
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
      triggerToast("success", "Bilan chargé avec succès");
    } catch (err: any) {
      console.error('Erreur chargement bilan:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      triggerToast("error", errorMessage);
      
      // Gérer spécifiquement l'erreur 404 (endpoint non disponible)
      if (err?.message?.includes('404') || err?.status === 404) {
        triggerToast("info", "Endpoint bilan en cours de déploiement. Affichage des données de démonstration.");
      }
      
      // En cas d'erreur, afficher des données de démonstration
      const mockData: BalanceSheetData = {
        assets: [
          { name: "Disponibilités", amount: 1500000, type: "asset" },
          { name: "Créances clients", amount: 2500000, type: "asset" },
          { name: "Stocks", amount: 800000, type: "asset" },
          { name: "Immobilisations", amount: 5000000, type: "asset" }
        ],
        liabilities: [
          { name: "Dettes fournisseurs", amount: 1200000, type: "liability" },
          { name: "Dettes fiscales", amount: 600000, type: "liability" },
          { name: "Capitaux propres", amount: 8000000, type: "equity" }
        ],
        totalAssets: 9800000,
        totalLiabilities: 9800000,
        isBalanced: true,
        period: 'Données de démonstration'
      };
      
      setData(mockData);
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

      {/* Toast notifications */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : 
            toast.type === "error" ? "bg-rose-600 text-white" : 
            "bg-blue-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function BalanceSheetPage() {
  return (
    <ProtectedPage>
      <BalanceSheetPageContent />
    </ProtectedPage>
  );
}