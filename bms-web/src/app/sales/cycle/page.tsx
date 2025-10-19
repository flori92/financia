"use client";

import { ShoppingCart } from "lucide-react";

export default function SalesCyclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cycle de vente</h1>
        <p className="text-gray-600 mt-1">Devis → Commandes → Livraisons → Factures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["Devis", "Commandes", "Livraisons", "Factures"].map((stage, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-6 text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-[#0D9488]" />
            <h3 className="font-semibold">{stage}</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        ))}
      </div>
    </div>
  );
}
