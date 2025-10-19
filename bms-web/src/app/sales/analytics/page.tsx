"use client";

import { BarChart3 } from "lucide-react";

export default function SalesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse des ventes</h1>
        <p className="text-gray-600 mt-1">Statistiques et rapports de vente</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Analyses disponibles prochainement</p>
      </div>
    </div>
  );
}
