"use client";

import { FileCheck } from "lucide-react";

export default function TaxDeclarationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Déclarations fiscales</h1>
        <p className="text-gray-600 mt-1">Télédéclarations et suivi</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucune déclaration en attente</p>
      </div>
    </div>
  );
}
