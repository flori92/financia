"use client";

import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const BUDGET_DATA = [
  { categorie: "Ventes", budget: 500000, realise: 485000, ecart: -15000, taux: 97 },
  { categorie: "Achats", budget: 200000, realise: 215000, ecart: 15000, taux: 107.5 },
  { categorie: "Salaires", budget: 150000, realise: 150000, ecart: 0, taux: 100 },
  { categorie: "Loyer", budget: 50000, realise: 50000, ecart: 0, taux: 100 },
  { categorie: "Marketing", budget: 30000, realise: 28500, ecart: -1500, taux: 95 },
  { categorie: "Autres charges", budget: 20000, realise: 22000, ecart: 2000, taux: 110 },
];

const MONTHLY_COMPARISON = [
  { mois: "Jan", budget: 450000, realise: 442000 },
  { mois: "Fév", budget: 480000, realise: 495000 },
  { mois: "Mar", budget: 500000, realise: 485000 },
];

const ALERTS = [
  { categorie: "Achats", message: "Dépassement de 7.5% du budget", severity: "warning" },
  { categorie: "Autres charges", message: "Dépassement de 10% du budget", severity: "warning" },
  { categorie: "Ventes", message: "Objectif non atteint (-3%)", severity: "info" },
];

export default function BudgetTrackingPage() {
  const totalBudget = BUDGET_DATA.reduce((sum, item) => sum + item.budget, 0);
  const totalRealise = BUDGET_DATA.reduce((sum, item) => sum + item.realise, 0);
  const totalEcart = totalRealise - totalBudget;
  const tauxGlobal = ((totalRealise / totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suivi budgétaire</h1>
        <p className="text-gray-600 mt-1">Réalisé vs Budget</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Budget total</div>
          <div className="text-2xl font-bold">{totalBudget.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Réalisé</div>
          <div className="text-2xl font-bold">{totalRealise.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Écart</div>
          <div className={`text-2xl font-bold ${totalEcart > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalEcart > 0 ? '+' : ''}{totalEcart.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Taux de réalisation</div>
          <div className="text-2xl font-bold">{tauxGlobal}%</div>
        </div>
      </div>

      {ALERTS.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900">Alertes budgétaires</span>
          </div>
          <div className="space-y-2">
            {ALERTS.map((alert, idx) => (
              <div key={idx} className="text-sm text-yellow-800">
                <span className="font-medium">{alert.categorie}:</span> {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Comparaison Budget vs Réalisé</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={MONTHLY_COMPARISON}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budget" fill="#94A3B8" name="Budget" />
            <Bar dataKey="realise" fill="#0D9488" name="Réalisé" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Détail par catégorie</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Réalisé</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Écart</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taux</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {BUDGET_DATA.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.categorie}</td>
                  <td className="px-4 py-3 text-right">{(item.budget || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3 text-right font-medium">{(item.realise || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    item.ecart > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.ecart > 0 ? '+' : ''}{(item.ecart || 0).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-4 py-3 text-right">{item.taux}%</td>
                  <td className="px-4 py-3 text-center">
                    {item.taux > 105 ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <TrendingUp className="w-4 h-4" />
                        Dépassement
                      </span>
                    ) : item.taux < 95 ? (
                      <span className="inline-flex items-center gap-1 text-yellow-600">
                        <TrendingDown className="w-4 h-4" />
                        Sous-réalisé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Activity className="w-4 h-4" />
                        Conforme
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
