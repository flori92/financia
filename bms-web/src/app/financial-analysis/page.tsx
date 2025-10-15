"use client";
import { Tabs } from "@/components/ui/Tabs";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

const data = [
  { name: "Jan", recettes: 320000, depenses: 210000, benefice: 110000 },
  { name: "Fév", recettes: 280000, depenses: 190000, benefice: 90000 },
  { name: "Mar", recettes: 450000, depenses: 240000, benefice: 210000 },
];

export default function FinancialAnalysisPage() {
  const [tab, setTab] = useState("cashflow");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rapports Financiers</h1>
        <div className="text-sm text-slate-500">Année 2025</div>
      </div>

      <Tabs tabs={[{ id: 'cashflow', label: 'Flux de trésorerie' }, { id: 'profit', label: 'Analyse de rentabilité' }, { id: 'balance', label: 'Bilan financier' }, { id: 'ratios', label: 'Ratios financiers' }]} defaultId="cashflow" onChange={setTab} />

      <div className="card p-4">
        {tab === 'cashflow' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="recettes" fill="#16A34A" name="Recettes" radius={[4,4,0,0]} />
                <Bar dataKey="depenses" fill="#DC2626" name="Dépenses" radius={[4,4,0,0]} />
                <Bar dataKey="benefice" fill="#2563EB" name="Bénéfice" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {tab === 'profit' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="benefice" stroke="#2563EB" strokeWidth={2} />
                <Line type="monotone" dataKey="recettes" stroke="#16A34A" strokeWidth={2} />
                <Line type="monotone" dataKey="depenses" stroke="#DC2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {tab === 'balance' && <div className="text-sm text-slate-600">Bilan financier (à connecter au backend).</div>}
        {tab === 'ratios' && <div className="text-sm text-slate-600">Ratios financiers (marges, rotation, liquidité).</div>}
      </div>
    </div>
  );
}
