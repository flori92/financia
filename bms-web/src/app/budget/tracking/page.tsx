"use client";

import { Activity } from "lucide-react";

export default function BudgetTrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suivi budgétaire</h1>
        <p className="text-gray-600 mt-1">Réalisé vs Budget</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Suivi budgétaire disponible prochainement</p>
      </div>
    </div>
  );
}
