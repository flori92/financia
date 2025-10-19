"use client";

import { Building2, Plus, Search } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Immobilisations</h1>
          <p className="text-gray-600 mt-1">Gestion des actifs et amortissements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
          <Plus className="w-4 h-4" />
          Nouvelle immobilisation
        </button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une immobilisation..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="text-center py-12 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucune immobilisation enregistrée</p>
        </div>
      </div>
    </div>
  );
}
