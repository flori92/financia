"use client";

import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTHLY_SALES = [
  { month: "Jan", ventes: 125000, objectif: 120000 },
  { month: "Fév", ventes: 142000, objectif: 130000 },
  { month: "Mar", ventes: 138000, objectif: 135000 },
  { month: "Avr", ventes: 165000, objectif: 140000 },
  { month: "Mai", ventes: 158000, objectif: 150000 },
  { month: "Juin", ventes: 182000, objectif: 160000 },
];

const PRODUCT_SALES = [
  { produit: "Produit A", ventes: 45000 },
  { produit: "Produit B", ventes: 38000 },
  { produit: "Produit C", ventes: 32000 },
  { produit: "Produit D", ventes: 28000 },
  { produit: "Produit E", ventes: 22000 },
];

const TOP_CLIENTS = [
  { name: "Client Premium A", ca: 85000, commandes: 12, evolution: 18 },
  { name: "Entreprise B", ca: 72000, commandes: 9, evolution: 12 },
  { name: "Société C", ca: 65000, commandes: 8, evolution: -3 },
  { name: "Client D", ca: 58000, commandes: 7, evolution: 25 },
];

export default function SalesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse des ventes</h1>
        <p className="text-gray-600 mt-1">Statistiques et rapports de vente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">CA total</div>
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-bold">910 000 FCFA</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +15% vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Commandes</div>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">156</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +8% vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Clients actifs</div>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">48</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +12% vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Panier moyen</div>
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">5 833 FCFA</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +6% vs mois dernier
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Évolution CA vs Objectifs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MONTHLY_SALES}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventes" stroke="#0D9488" strokeWidth={2} name="Ventes" />
              <Line type="monotone" dataKey="objectif" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" name="Objectif" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Top produits</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={PRODUCT_SALES} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="produit" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="ventes" fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Top clients</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Évolution</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {TOP_CLIENTS.map((client, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-right">{client.ca.toLocaleString()} FCFA</td>
                  <td className="px-4 py-3 text-right">{client.commandes}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 ${client.evolution > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {client.evolution > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(client.evolution)}%
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
