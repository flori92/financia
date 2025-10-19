"use client";

import { BellRing } from "lucide-react";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relances clients</h1>
        <p className="text-gray-600 mt-1">Gestion automatique des relances</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <BellRing className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Aucune relance en attente</p>
      </div>
    </div>
  );
}
