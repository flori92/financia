"use client";

import { FilePlus2 } from "lucide-react";

export default function OtherTaxesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Taxes annexes</h1>
        <p className="text-gray-600 mt-1">CFE, CVAE, taxe d'apprentissage...</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <FilePlus2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucune taxe annexe enregistrée</p>
      </div>
    </div>
  );
}
