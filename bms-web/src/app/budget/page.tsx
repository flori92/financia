"use client";
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";

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
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Target className="w-4 h-4" />
            Révision budget
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
            <Plus className="w-4 h-4" />
            Nouveau budget
          </button>
        </div>
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