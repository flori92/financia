"use client";

import { Layers } from "lucide-react";

export default function BudgetAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comptabilité analytique</h1>
        <p className="text-gray-600 mt-1">Analyse multi-axes</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <Layers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Comptabilité analytique disponible prochainement</p>
      </div>
    </div>
  );
}
