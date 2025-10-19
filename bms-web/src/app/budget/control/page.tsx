"use client";

import { LineChart } from "lucide-react";

export default function BudgetControlPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contrôle de gestion</h1>
        <p className="text-gray-600 mt-1">Tableaux de bord et indicateurs</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Contrôle de gestion disponible prochainement</p>
      </div>
    </div>
  );
}
