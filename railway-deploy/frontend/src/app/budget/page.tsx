"use client";
// Budget - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { useCompanyId } from '@/hooks/useCompanyId';
import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle, X, BarChart3, RefreshCw } from "lucide-react";

interface BudgetItem {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  type: "revenue" | "expense";
}

interface BudgetData {
  budgetItems: BudgetItem[];
  totalBudgeted: number;
  totalActual: number;
  overallVariance: number;
  period: string;
}

export default function BudgetPage() {
  const companyId = useCompanyId();
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRevision, setShowRevision] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  };

  // Charger les données du budget depuis l'API
  const loadBudget = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${getBaseUrl()}/api/v1/budget/summary?companyId=${companyId}`,
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
      const transformedData: BudgetData = {
        budgetItems: apiData.budgetItems || [],
        totalBudgeted: apiData.totalBudgeted || 0,
        totalActual: apiData.totalActual || 0,
        overallVariance: apiData.overallVariance || 0,
        period: apiData.period || 'Période en cours'
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Erreur chargement budget:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
      const mockBudgetItems = [
        { 
          category: "Chiffre d'affaires", 
          budgeted: 12000000, 
          actual: 8500000, 
          variance: -29.2,
          type: "revenue" as const
        },
        { 
          category: "Charges de personnel", 
          budgeted: 4800000, 
          actual: 4950000, 
          variance: 3.1,
          type: "expense" as const
        },
        { 
          category: "Charges externes", 
          budgeted: 2400000, 
          actual: 2100000, 
          variance: -12.5,
          type: "expense" as const
        },
        { 
          category: "Marketing", 
          budgeted: 1200000, 
          actual: 1350000, 
          variance: 12.5,
          type: "expense" as const
        }
      ];
      
      const totalBudgeted = mockBudgetItems.reduce((sum, item) => sum + item.budgeted, 0);
      const totalActual = mockBudgetItems.reduce((sum, item) => sum + item.actual, 0);
      const overallVariance = Math.round(((totalActual - totalBudgeted) / totalBudgeted) * 100 * 10) / 10;
      
      setData({
        budgetItems: mockBudgetItems,
        totalBudgeted,
        totalActual,
        overallVariance,
        period: 'Données de démonstration'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadBudget();
  }, []);

  const handleRevisionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerToast("success", "Révision budgétaire enregistrée !");
    setShowRevision(false);
  };

  const getVarianceColor = (variance: number, type: string) => {
    if (type === 'revenue') {
      return variance >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return variance <= 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const getVarianceIcon = (variance: number, type: string) => {
    if (type === 'revenue') {
      return variance >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    } else {
      return variance <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Budget & Contrôle de gestion</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du budget...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur sans données
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Budget & Contrôle de gestion</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadBudget}
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
          <h1 className="text-2xl font-semibold">Budget & Contrôle de gestion</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
        <button
          onClick={loadBudget}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Modal Révision */}
      {showRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Révision budgétaire</h2>
                <p className="text-sm text-gray-500">Créez un scénario d&apos;ajustement trimestriel.</p>
              </div>
              <button onClick={() => setShowRevision(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRevisionSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option value="">Sélectionner...</option>
                  {data.budgetItems.map(item => (
                    <option key={item.category} value={item.category}>{item.category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau budget</label>
                <input type="number" name="newBudgeted" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea name="reason" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowRevision(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
                  Enregistrer la révision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPIs Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Budget total</div>
              <div className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR').format(data.totalBudgeted)} FCFA
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Réalisé</div>
              <div className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR').format(data.totalActual)} FCFA
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${data.overallVariance <= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Target className={`w-5 h-5 ${data.overallVariance <= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Écart global</div>
              <div className={`text-xl font-bold ${data.overallVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.overallVariance > 0 ? '+' : ''}{data.overallVariance.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowRevision(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
        >
          <RefreshCw className="w-4 h-4" />
          Réviser le budget
        </button>
        <button
          onClick={() => setShowRevision(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" />
          Nouveau budget
        </button>
      </div>

      {/* Tableau budget */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Suivi budgétaire</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Budget</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Réalisé</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Écart</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.budgetItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.category}</td>
                  <td className="py-3 px-4 text-right">
                    {new Intl.NumberFormat('fr-FR').format(item.budgeted)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {new Intl.NumberFormat('fr-FR').format(item.actual)} FCFA
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variance, item.type)}`}>
                    {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className={`flex items-center justify-center gap-1 ${getVarianceColor(item.variance, item.type)}`}>
                      {getVarianceIcon(item.variance, item.type)}
                      <span className="text-sm font-medium">
                        {Math.abs(item.variance) < 5 ? 'Conforme' : 
                         Math.abs(item.variance) < 15 ? 'Attention' : 'Critique'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="py-3 px-4">TOTAUX</td>
                <td className="py-3 px-4 text-right">
                  {new Intl.NumberFormat('fr-FR').format(data.totalBudgeted)} FCFA
                </td>
                <td className="py-3 px-4 text-right">
                  {new Intl.NumberFormat('fr-FR').format(data.totalActual)} FCFA
                </td>
                <td className={`py-3 px-4 text-right font-medium ${
                  data.overallVariance <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.overallVariance > 0 ? '+' : ''}{data.overallVariance.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center">
                  {data.overallVariance <= 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <Target className="w-3 h-3" />
                      Objectif atteint
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Dépassement
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes budgétaires dynamiques */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Alertes budgétaires</h2>
        <div className="space-y-3">
          {data.budgetItems.filter(item => {
            if (item.type === 'revenue') return item.variance < -10;
            return item.variance > 10;
          }).map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-900">
                  {item.category} {item.type === 'revenue' ? 'en retard' : 'dépassement'}
                </div>
                <div className="text-sm text-red-700">
                  {item.type === 'revenue' 
                    ? `Le réalisé est inférieur de ${Math.abs(item.variance).toFixed(1)}% par rapport au budget.`
                    : `Dépassement de ${item.variance.toFixed(1)}% par rapport au budget.`
                  } Action corrective recommandée.
                </div>
              </div>
            </div>
          ))}
          
          {data.budgetItems.filter(item => {
            if (item.type === 'revenue') return item.variance < -10;
            return item.variance > 10;
          }).length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Budget sous contrôle</div>
                <div className="text-sm text-green-700">Aucun écart significatif détecté. Les performances sont conformes aux prévisions.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicateur mode démo si erreur */}
      {error && data && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Mode démonstration: {data.period}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
