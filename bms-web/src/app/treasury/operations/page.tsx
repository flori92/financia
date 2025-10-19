"use client";

import { ArrowRightLeft } from "lucide-react";

export default function TreasuryOperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Opérations de trésorerie</h1>
        <p className="text-gray-600 mt-1">Virements et paiements SEPA</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <ArrowRightLeft className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucune opération enregistrée</p>
      </div>
    </div>
  );
}
