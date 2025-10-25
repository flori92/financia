"use client";

import Link from "next/link";
import { AlertTriangle, BellRing, SlidersHorizontal } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes intelligentes</h1>
        <p className="text-gray-600 mt-1">Notifications et seuils personnalisés</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-semibold text-gray-700">Aucune alerte configurée</p>
        <p className="mt-2 text-sm text-gray-500">
          Définissez vos seuils de trésorerie et indicateurs financiers pour être prévenu automatiquement des situations critiques.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Configurer mes seuils
          </Link>
          <div className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500">
            <BellRing className="h-4 w-4" />
            Documentation en cours de rédaction
          </div>
        </div>
      </div>
    </div>
  );
}
