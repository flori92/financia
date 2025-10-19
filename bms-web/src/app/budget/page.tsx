"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export default function BudgetPage() {
  const [period, setPeriod] = useState("2025");
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/budget")
      .then(setBudgetData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!budgetData) return <div>Aucune donnée</div>;

  const categories = budgetData.categories || [];

  const nf = (v: number) => Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: 0 });
  const pct = (actual: number, budget: number) => budget ? ((actual / budget) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budget Prévisionnel</h1>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border border-app-border px-3 py-2"
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-700">Budget Total</div>
          </div>
          <div className="text-2xl font-bold text-blue-900">{nf(budgetData.totalBudgeted)} FCFA</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <div className="text-sm text-orange-700">Réalisé</div>
          </div>
          <div className="text-2xl font-bold text-orange-900">{nf(budgetData.totalActual)} FCFA</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <div className="text-sm text-emerald-700">Écart</div>
          </div>
          <div className="text-2xl font-bold text-emerald-900">{nf(budgetData.totalBudgeted - budgetData.totalActual)} FCFA</div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Réalisé vs Budget par Catégorie</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-app-border">
              <th className="pb-3">Catégorie</th>
              <th className="pb-3 text-right">Budget</th>
              <th className="pb-3 text-right">Réalisé</th>
              <th className="pb-3 text-right">Écart</th>
              <th className="pb-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: any, idx: number) => {
              const variance = cat.actual - cat.budgeted;
              const percentage = pct(cat.actual, cat.budgeted);
              return (
                <tr key={idx} className="border-b border-app-border">
                  <td className="py-3 font-medium">{cat.name}</td>
                  <td className="py-3 text-right">{nf(cat.budgeted)} FCFA</td>
                  <td className="py-3 text-right">{nf(cat.actual)} FCFA</td>
                  <td className={`py-3 text-right font-medium ${variance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {variance < 0 ? '-' : '+'}{nf(variance)} FCFA
                  </td>
                  <td className="py-3 text-right">{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
