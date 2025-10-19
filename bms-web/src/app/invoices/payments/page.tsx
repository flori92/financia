"use client";

import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Encaissements</h1>
        <p className="text-gray-600 mt-1">Suivi des paiements clients</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucun encaissement enregistré</p>
      </div>
    </div>
  );
}
