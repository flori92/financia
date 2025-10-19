"use client";

import { Shield } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit & traçabilité</h1>
        <p className="text-gray-600 mt-1">Historique des actions et logs</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Audit trail disponible prochainement</p>
      </div>
    </div>
  );
}
