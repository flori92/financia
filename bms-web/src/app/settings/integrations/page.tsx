"use client";

import { Plug } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Intégrations</h1>
        <p className="text-gray-600 mt-1">Connectez vos outils et services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["API Bancaire", "OCR Factures", "SEPA", "DGI", "Power BI", "Zapier"].map((integration, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-6">
            <Plug className="w-8 h-8 mb-3 text-[#0D9488]" />
            <h3 className="font-semibold mb-2">{integration}</h3>
            <button className="text-sm text-[#0D9488] hover:underline">Configurer</button>
          </div>
        ))}
      </div>
    </div>
  );
}
