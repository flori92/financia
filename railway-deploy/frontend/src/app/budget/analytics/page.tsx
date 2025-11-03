"use client";

import { Layers, Building2, Users, Package, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const AXES = [
  { id: "centre", label: "Centre de coût", icon: Building2 },
  { id: "projet", label: "Projet", icon: Package },
  { id: "activite", label: "Activité", icon: Layers },
  { id: "client", label: "Client", icon: Users },
];

const CENTRE_DATA = [
  { name: "Production", charges: 125000, produits: 180000, resultat: 55000, color: "#0D9488" },
  { name: "Commercial", charges: 85000, produits: 150000, resultat: 65000, color: "#06B6D4" },
  { name: "Administration", charges: 65000, produits: 0, resultat: -65000, color: "#8B5CF6" },
  { name: "Support", charges: 45000, produits: 20000, resultat: -25000, color: "#F59E0B" },
];

const PROJET_DATA = [
  { projet: "Projet A", budget: 150000, realise: 142000, marge: 35000, taux: 94.7 },
  { projet: "Projet B", budget: 120000, realise: 128000, marge: 28000, taux: 106.7 },
  { projet: "Projet C", budget: 90000, realise: 85000, marge: 22000, taux: 94.4 },
];

const ACTIVITE_REPARTITION = [
  { name: "Ventes", value: 45, color: "#0D9488" },
  { name: "Services", value: 30, color: "#06B6D4" },
  { name: "Conseil", value: 15, color: "#8B5CF6" },
  { name: "Formation", value: 10, color: "#F59E0B" },
];

export default function BudgetAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comptabilité analytique</h1>
        <p className="text-gray-600 mt-1">Analyse multi-axes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {AXES.map((axe) => {
          const Icon = axe.icon;
          return (
            <div key={axe.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                  <Icon className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div className="font-medium">{axe.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Analyse par centre de coût</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={CENTRE_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="charges" fill="#EF4444" name="Charges" />
            <Bar dataKey="produits" fill="#10B981" name="Produits" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Répartition par activité</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ACTIVITE_REPARTITION}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ACTIVITE_REPARTITION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Résultat par centre</h2>
          <div className="space-y-3">
            {CENTRE_DATA.map((centre, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: centre.color }}></div>
                  <span className="font-medium">{centre.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {safeToLocaleString(centre.charges)} FCFA
                  </span>
                  <span className={`font-semibold ${centre.resultat > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {centre.resultat > 0 ? '+' : ''}{safeToLocaleString(centre.resultat)} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Suivi par projet</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Réalisé</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Marge</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taux</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {PROJET_DATA.map((projet, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{projet.projet}</td>
                  <td className="px-4 py-3 text-right">{safeToLocaleString(projet.budget)} FCFA</td>
                  <td className="px-4 py-3 text-right font-medium">{safeToLocaleString(projet.realise)} FCFA</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{safeToLocaleString(projet.marge)} FCFA</td>
                  <td className="px-4 py-3 text-right">{projet.taux.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    {projet.taux > 100 ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <TrendingUp className="w-4 h-4" />
                        Dépassement
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <TrendingDown className="w-4 h-4" />
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
