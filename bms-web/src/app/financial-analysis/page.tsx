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
        {tab === 'balance' && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Bilan Financier
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Le bilan comptable complet (Actif / Passif) est disponible dans l'espace comptable.
            </p>
            <a 
              href="/accountant/balance-sheet"
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-primary text-white rounded-lg hover:bg-app-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Accéder au Bilan Comptable
            </a>
          </div>
        )}
        {tab === 'ratios' && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Ratios Financiers
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Les ratios financiers (liquidité, solvabilité) sont disponibles dans le Dashboard Comptable.
            </p>
            <a 
              href="/accountant"
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-primary text-white rounded-lg hover:bg-app-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Accéder au Dashboard Comptable
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
