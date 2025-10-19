"use client";

import { TrendingUp } from "lucide-react";

export default function TreasuryForecastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prévisionnel de trésorerie</h1>
        <p className="text-gray-600 mt-1">Projections et scénarios</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Prévisionnel disponible prochainement</p>
      </div>
    </div>
  );
}
