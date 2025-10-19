"use client";

import { Send } from "lucide-react";

export default function PurchasePaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paiements fournisseurs</h1>
        <p className="text-gray-600 mt-1">Gestion des règlements</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucun paiement enregistré</p>
      </div>
    </div>
  );
}
