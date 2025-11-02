"use client";

import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const KPI_DATA = [
  { name: "CA", value: 92, target: 100 },
  { name: "Marge", value: 85, target: 100 },
  { name: "Charges", value: 78, target: 100 },
  { name: "Tréso", value: 95, target: 100 },
  { name: "Clients", value: 88, target: 100 },
];

const PERFORMANCE_DATA = [
  { mois: "Jan", ca: 125000, charges: 95000, marge: 30000 },
  { mois: "Fév", ca: 142000, charges: 105000, marge: 37000 },
  { mois: "Mar", ca: 138000, charges: 102000, marge: 36000 },
  { mois: "Avr", ca: 165000, charges: 118000, marge: 47000 },
  { mois: "Mai", ca: 158000, charges: 115000, marge: 43000 },
  { mois: "Juin", ca: 182000, charges: 128000, marge: 54000 },
];

const RATIOS = [
  { label: "Marge brute", value: 29.7, evolution: 2.3, target: 30, unit: "%" },
  { label: "Taux de charges", value: 70.3, evolution: -1.8, target: 68, unit: "%" },
  { label: "ROI", value: 15.2, evolution: 3.5, target: 18, unit: "%" },
  { label: "BFR (jours)", value: 45, evolution: -5, target: 40, unit: "j" },
];

export default function BudgetControlPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contrôle de gestion</h1>
        <p className="text-gray-600 mt-1">Tableaux de bord et indicateurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">CA mensuel</div>
            <DollarSign className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-bold">182 000 FCFA</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +15% vs mois dernier
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Marge nette</div>
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">29.7%</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4" />
            +2.3 pts
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Charges</div>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">128 000 FCFA</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <TrendingDown className="w-4 h-4" />
            -1.8% vs budget
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Objectifs atteints</div>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">4/5</div>
          <div className="text-sm text-gray-600 mt-1">80% de réussite</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Performance radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={KPI_DATA}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Réalisé" dataKey="value" stroke="#0D9488" fill="#0D9488" fillOpacity={0.6} />
              <Radar name="Cible" dataKey="target" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Évolution CA et Marge</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={PERFORMANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ca" stroke="#0D9488" strokeWidth={2} name="CA" />
              <Line type="monotone" dataKey="marge" stroke="#06B6D4" strokeWidth={2} name="Marge" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Ratios clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {RATIOS.map((ratio, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">{ratio.label}</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold">{ratio.value}</span>
                <span className="text-sm text-gray-500">{ratio.unit}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center gap-1 ${ratio.evolution > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ratio.evolution > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {ratio.evolution > 0 ? '+' : ''}{ratio.evolution}{ratio.unit}
                </span>
                <span className="text-gray-500">Cible: {ratio.target}{ratio.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
