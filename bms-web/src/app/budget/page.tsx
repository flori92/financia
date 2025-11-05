"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle, X, BarChart3, Map, Loader2, AlertCircle } from "lucide-react";

interface BudgetLine {
  id: string;
  accountNumber: string;
  accountName: string;
  month: number;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
}

interface Budget {
  id: string;
  name: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  consumedAmount: number;
  status: string;
  version: number;
  lines: BudgetLine[];
}

interface BudgetSummary {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  type: 'revenue' | 'expense';
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRevision, setShowRevision] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form refs
  const revisionYearRef = useRef<HTMLInputElement>(null);
  const revisionScenarioRef = useRef<HTMLInputElement>(null);
  const revisionRateRef = useRef<HTMLInputElement>(null);
  const newBudgetYearRef = useRef<HTMLInputElement>(null);
  const newBudgetNameRef = useRef<HTMLInputElement>(null);
  const newBudgetDescRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      const budgetsData = await apiGet("/api/v1/budget", { companyId });
      setBudgets(budgetsData);

      // Set current year's budget as active
      const currentYear = new Date().getFullYear();
      const activeBudget = budgetsData.find((b: Budget) => b.fiscalYear === currentYear && b.status !== 'archived') || budgetsData[0];

      if (activeBudget) {
        setCurrentBudget(activeBudget);
        calculateSummary(activeBudget);
      }
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      setError(err.message || "Erreur lors du chargement des budgets");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (budget: Budget) => {
    // Aggregate budget lines by account type
    const summary: Record<string, { budgeted: number; actual: number; type: 'revenue' | 'expense' }> = {};

    budget.lines?.forEach(line => {
      const accountCode = line.accountNumber.substring(0, 1);
      let category = line.accountName;
      let type: 'revenue' | 'expense' = accountCode === '7' ? 'revenue' : 'expense';

      if (!summary[category]) {
        summary[category] = { budgeted: 0, actual: 0, type };
      }

      summary[category].budgeted += Number(line.plannedAmount);
      summary[category].actual += Number(line.actualAmount);
    });

    const summaryArray: BudgetSummary[] = Object.entries(summary).map(([category, data]) => ({
      category,
      budgeted: data.budgeted,
      actual: data.actual,
      variance: data.budgeted > 0 ? ((data.actual - data.budgeted) / data.budgeted) * 100 : 0,
      type: data.type,
    }));

    setBudgetSummary(summaryArray);
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRevisionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      const companyId = getCompanyId();

      const data = {
        companyId,
        year: parseInt(revisionYearRef.current?.value || new Date().getFullYear().toString()),
        scenario: revisionScenarioRef.current?.value || 'révision',
        adjustmentRate: parseFloat(revisionRateRef.current?.value || '0'),
      };

      await apiPost("/api/v1/budget/revisions", data);

      triggerToast("success", "Scénario de révision créé!");
      setShowRevision(false);
      await loadBudgets();
    } catch (error: any) {
      triggerToast("error", error.message || "Erreur lors de la création de la révision");
    } finally {
      setSaving(false);
    }
  };

  const handleNewBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      const companyId = getCompanyId();

      const data = {
        companyId,
        year: parseInt(newBudgetYearRef.current?.value || new Date().getFullYear().toString()),
        name: newBudgetNameRef.current?.value || 'Nouveau budget',
        description: newBudgetDescRef.current?.value || '',
      };

      await apiPost("/api/v1/budget/new", data);

      triggerToast("success", "Nouveau budget créé!");
      setShowNewBudget(false);
      await loadBudgets();
    } catch (error: any) {
      triggerToast("error", error.message || "Erreur lors de la création du budget");
    } finally {
      setSaving(false);
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

  const calculateKPIs = () => {
    const revenue = budgetSummary.find(s => s.type === 'revenue');
    const expenses = budgetSummary.filter(s => s.type === 'expense');

    const totalExpenseBudget = expenses.reduce((sum, e) => sum + e.budgeted, 0);
    const totalExpenseActual = expenses.reduce((sum, e) => sum + e.actual, 0);

    const revenueRealization = revenue?.budgeted ? (revenue.actual / revenue.budgeted) * 100 : 0;
    const expenseControl = totalExpenseBudget ? (totalExpenseActual / totalExpenseBudget) * 100 : 0;
    const projectedResult = (revenue?.actual || 0) - totalExpenseActual;

    return { revenueRealization, expenseControl, projectedResult };
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
            onClick={loadBudgets}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Budget & Contrôle de gestion</h1>
          <p className="text-gray-600">
            {currentBudget ? `${currentBudget.name} - ${currentBudget.fiscalYear}` : 'Suivi budgétaire et analyse des écarts'}
          </p>
        </div>

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

      {/* Modals */}
      {showRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Révision budgétaire</h2>
                <p className="text-sm text-gray-500">Créez un scénario d'ajustement</p>
              </div>
              <button onClick={() => setShowRevision(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRevisionSubmit} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Année</label>
                  <input ref={revisionYearRef} type="number" className="mt-1 w-full rounded-lg border px-3 py-2" required defaultValue={new Date().getFullYear()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scénario</label>
                  <input ref={revisionScenarioRef} className="mt-1 w-full rounded-lg border px-3 py-2" required defaultValue="Révision T2 2025" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Taux d'ajustement (%)</label>
                <input ref={revisionRateRef} type="number" step="0.1" className="mt-1 w-full rounded-lg border px-3 py-2" required defaultValue={0} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowRevision(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7C74] disabled:opacity-50">
                  {saving ? 'Création...' : 'Créer la révision'}
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
                <p className="text-sm text-gray-500">Définissez la structure du prochain exercice</p>
              </div>
              <button onClick={() => setShowNewBudget(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleNewBudgetSubmit} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exercice</label>
                  <input ref={newBudgetYearRef} type="number" className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue={new Date().getFullYear() + 1} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du budget</label>
                  <input ref={newBudgetNameRef} className="mt-1 w-full rounded-lg border px-3 py-2" required defaultValue={`Budget ${new Date().getFullYear() + 1}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea ref={newBudgetDescRef} className="mt-1 w-full rounded-lg border px-3 py-2" rows={3} placeholder="Description optionnelle" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewBudget(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7C74] disabled:opacity-50">
                  {saving ? 'Création...' : 'Créer le budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Réalisation CA</div>
          <div className="text-2xl font-semibold text-orange-600">{kpis.revenueRealization.toFixed(1)}%</div>
          <div className={`text-xs ${kpis.revenueRealization >= 100 ? 'text-green-600' : 'text-red-600'}`}>
            {kpis.revenueRealization >= 100 ? 'Objectif atteint' : 'En cours'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Maîtrise charges</div>
          <div className="text-2xl font-semibold text-green-600">{kpis.expenseControl.toFixed(1)}%</div>
          <div className={`text-xs ${kpis.expenseControl <= 100 ? 'text-green-600' : 'text-red-600'}`}>
            {kpis.expenseControl <= 100 ? 'Conforme' : 'Dépassement'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Résultat prévisionnel</div>
          <div className={`text-2xl font-semibold ${kpis.projectedResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {new Intl.NumberFormat('fr-FR').format(kpis.projectedResult)} FCFA
          </div>
        </div>
      </div>

      {/* Suivi budgétaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Suivi budgétaire{currentBudget ? ` - ${currentBudget.fiscalYear}` : ''}
        </h2>
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
              {budgetSummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Aucune donnée budgétaire. Créez votre premier budget.
                  </td>
                </tr>
              ) : (
                budgetSummary.map((item, idx) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
