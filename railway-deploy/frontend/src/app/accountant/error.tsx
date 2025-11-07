"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-900 mb-1">Une erreur est survenue</h2>
            <p className="text-sm text-red-800 mb-3">
              {error?.message || "Impossible de charger cette page comptable."}
            </p>

            <div className="text-sm text-red-800 space-y-1">
              <p>Vérifications rapides :</p>
              <ul className="list-disc list-inside">
                <li>Êtes-vous authentifié ? (token valide)</li>
                <li>Une société est-elle sélectionnée ? (companyId)</li>
                <li>L’API est-elle joignable ? (NEXT_PUBLIC_API_URL)</li>
              </ul>
            </div>

            <button
              onClick={() => reset()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}