"use client";

import { PieChart } from "lucide-react";

export default function PurchasesAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse des achats</h1>
        <p className="text-gray-600 mt-1">Statistiques fournisseurs et achats</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Analyses disponibles prochainement</p>
      </div>
    </div>
  );
}
