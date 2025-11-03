"use client";

import { TrendingUp, TrendingDown, Package, Users, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MONTHLY_DATA = [
  { month: "Jan", montant: 45000 },
  { month: "Fév", montant: 52000 },
  { month: "Mar", montant: 48000 },
  { month: "Avr", montant: 61000 },
  { month: "Mai", montant: 55000 },
  { month: "Juin", montant: 67000 },
];

const SUPPLIER_DATA = [
  { name: "Fournisseur A", value: 35, color: "#0D9488" },
  { name: "Fournisseur B", value: 25, color: "#06B6D4" },
  { name: "Fournisseur C", value: 20, color: "#8B5CF6" },
  { name: "Autres", value: 20, color: "#94A3B8" },
];

const TOP_SUPPLIERS = [
  { name: "SARL Import Export", montant: 125000, commandes: 24, evolution: 12 },
  { name: "Distributeur Pro", montant: 98000, commandes: 18, evolution: -5 },
  { name: "Grossiste Central", montant: 87000, commandes: 15, evolution: 8 },
  { name: "Fournisseur Direct", montant: 76000, commandes: 12, evolution: 15 },
];

export default function PurchasesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse des achats</h1>
        <p className="text-gray-600 mt-1">Statistiques fournisseurs et achats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total achats</div>
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-bold">328 000 FCFA</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +12% vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Commandes</div>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">69</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +8% vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Fournisseurs actifs</div>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            = vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Panier moyen</div>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">4 754 FCFA</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +3% vs mois dernier
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Évolution mensuelle des achats</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="montant" fill="#0D9488" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Répartition par fournisseur</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={SUPPLIER_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {SUPPLIER_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Top fournisseurs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Évolution</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {TOP_SUPPLIERS.map((supplier, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-right">{safeToLocaleString(supplier.montant)} FCFA</td>
                  <td className="px-4 py-3 text-right">{supplier.commandes}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 ${supplier.evolution > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {supplier.evolution > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(supplier.evolution)}%
                    </span>
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
