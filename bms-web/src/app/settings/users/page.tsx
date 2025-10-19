"use client";

import { UserCog, Plus } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs & droits</h1>
          <p className="text-gray-600 mt-1">Gestion des accès et permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <UserCog className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Gestion des utilisateurs disponible prochainement</p>
      </div>
    </div>
  );
}
