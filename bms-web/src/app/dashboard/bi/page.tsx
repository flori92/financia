"use client";

import { Database } from "lucide-react";

export default function BIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">BI avancée</h1>
        <p className="text-gray-600 mt-1">Analyse OLAP et cubes de données</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Module BI disponible prochainement</p>
      </div>
    </div>
  );
}
