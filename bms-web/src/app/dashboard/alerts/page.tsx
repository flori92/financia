"use client";

import { AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes intelligentes</h1>
        <p className="text-gray-600 mt-1">Notifications et seuils personnalisés</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucune alerte configurée</p>
      </div>
    </div>
  );
}
