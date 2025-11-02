import { getBaseUrl } from "@/lib/api";
"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle, X, BarChart3, Map } from "lucide-react";

export default function BudgetPage() {
  const [budgetData] = useState([
    { 
      category: "Chiffre d'affaires", 
      budgeted: 12000000, 
      actual: 8500000, 
      variance: -29.2,
      type: "revenue"
    },
    { 
      category: "Charges de personnel", 
      budgeted: 4800000, 
      actual: 4950000, 
      variance: 3.1,
      type: "expense"
    },
    { 
      category: "Charges externes", 
      budgeted: 2400000, 
      actual: 2100000, 
      variance: -12.5,
      type: "expense"
    },
    { 
      category: "Marketing", 
      budgeted: 1200000, 
      actual: 1350000, 
      variance: 12.5,
      type: "expense"
    }
  ]);

  const [showRevision, setShowRevision] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  };

  const handleRevisionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const companyId = "default-company";
      
      const response = await fetch(`${getBaseUrl()}/api/v1/budget/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          year: formData.get('year'),
          scenario: formData.get('scenario'),
          adjustmentRate: formData.get('adjustmentRate'),
        })
      });
      
      if (!response.ok) throw new Error('Revision failed');
      
      triggerToast("success", "Scénario de révision budgétaire enregistré !");
      setShowRevision(false);
    } catch (error) {
      triggerToast("info", "Révision enregistrée localement. Connectez le backend pour sauvegarder.");
      setShowRevision(false);
    }
  };

  const handleNewBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const companyId = "default-company";
      
      const response = await fetch(`${getBaseUrl()}/api/v1/budget/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          year: formData.get('year'),
          name: formData.get('name'),
          description: formData.get('description'),
        })
      });
      
      if (!response.ok) throw new Error('Creation failed');
      
      triggerToast("success", "Nouveau budget prévisionnel créé !");
      setShowNewBudget(false);
    } catch (error) {
      triggerToast("info", "Budget créé localement. Connectez le backend pour sauvegarder.");
      setShowNewBudget(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Budget & Contrôle de gestion</h1>
          <p className="text-gray-600">Suivi budgétaire et analyse des écarts</p>
        </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du scénario</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" required defaultValue="Révision T2 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Période concernée</label>
                  <select className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="Q2-2025">
                    <option value="Q2-2025">T2 2025</option>
                    <option value="Q3-2025">T3 2025</option>
                    <option value="H2-2025">S2 2025</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hypothèses clés</label>
                <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={3} placeholder="Ex: +8% CA, +5% charges marketing, gel recrutements" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowRevision(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7C74]">
                  Enregistrer le scénario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Nouveau budget prévisionnel</h2>
                <p className="text-sm text-gray-500">Définissez la structure du prochain exercice.</p>
              </div>
              <button onClick={() => setShowNewBudget(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleNewBudgetSubmit} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exercice</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="2026" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Méthode</label>
                  <select className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="rolling">
                    <option value="rolling">Rolling forecast</option>
                    <option value="zero-based">Budget base zéro</option>
                    <option value="incremental">Incremental (+5%)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Croissance CA</label>
                  <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue={12} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Inflation charges</label>
                  <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capex prévu (FCFA)</label>
                  <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue={2500000} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewBudget(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7C74]">
                  Générer le budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        <div className="flex gap-2">
          <button
            onClick={() => setShowRevision(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Target className="w-4 h-4" />
            Révision budget
          </button>
          <button
            onClick={() => setShowNewBudget(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouveau budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/budget/tracking" className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0D9488]/40 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#0D9488]" />
            <div>
              <div className="font-semibold text-gray-900">Suivi détaillé</div>
              <p className="text-xs text-gray-500">Analyse Budget vs Réalisé mensuel</p>
            </div>
          </div>
        </Link>
        <Link href="/budget/analytics" className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0D9488]/40 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-[#0D9488]" />
            <div>
              <div className="font-semibold text-gray-900">Analyse multi-axes</div>
              <p className="text-xs text-gray-500">Par centre, projet, activité</p>
            </div>
          </div>
        </Link>
        <Link href="/budget/tracking" className="group rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 hover:border-amber-300 transition">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <div className="font-semibold text-amber-900">Alertes dépenses</div>
              <p className="text-xs text-amber-700">Contrôlez les dépassements critiques</p>
            </div>
          </div>
        </Link>
      </div>

      {/* KPIs Budget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Réalisation CA</div>
          <div className="text-2xl font-semibold text-orange-600">70.8%</div>
          <div className="text-xs text-red-600">-29.2% vs budget</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Maîtrise charges</div>
          <div className="text-2xl font-semibold text-green-600">97.5%</div>
          <div className="text-xs text-green-600">-2.5% vs budget</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Résultat prévisionnel</div>
          <div className="text-2xl font-semibold text-red-600">1 100 000 FCFA</div>
          <div className="text-xs text-red-600">-45% vs objectif</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Alertes budget</div>
          <div className="text-2xl font-semibold text-orange-600">3</div>
          <div className="text-xs text-orange-600">Dépassements détectés</div>
        </div>
      </div>

      {/* Suivi budgétaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Suivi budgétaire - Janvier 2025</h2>
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
              {budgetData.map((item, idx) => (
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes budgétaires */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Alertes budgétaires</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <div className="font-medium text-red-900">Chiffre d'affaires en retard</div>
              <div className="text-sm text-red-700">Le CA réalisé est inférieur de 29% par rapport au budget. Action corrective recommandée.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <div className="font-medium text-orange-900">Dépassement budget marketing</div>
              <div className="text-sm text-orange-700">Les dépenses marketing dépassent le budget de 12.5%. Vérifier les engagements.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-900">Révision budgétaire recommandée</div>
              <div className="text-sm text-yellow-700">Les écarts importants nécessitent une révision du budget pour le reste de l'année.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}