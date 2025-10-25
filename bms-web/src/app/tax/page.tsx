"use client";

import Link from "next/link";

export default function TaxPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fiscalité</h1>
        <Link
          href="/tax/declarations"
          className="rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]"
        >
          Nouvelle déclaration
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Calendrier fiscal</div>
              <div className="text-sm text-slate-500">Toutes</div>
            </div>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between rounded-md border border-app-border p-3">
                <div>
                  <div className="font-medium">Impôt sur les Sociétés (mensuel)</div>
                  <div className="text-sm text-slate-500">Date limite: 15 avril 2025</div>
                </div>
                <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Déclarer</button>
              </li>
              <li className="flex items-center justify-between rounded-md border border-app-border p-3">
                <div>
                  <div className="font-medium">Déclaration de TVA (mensuel)</div>
                  <div className="text-sm text-slate-500">Date limite: 15 avril 2025</div>
                </div>
                <button className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Calculer</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-3">
          <div className="card p-4">
            <div className="font-medium">Obligations fiscales</div>
            <div className="mt-2 text-sm text-slate-600">Paramètres, taux et périodicité.</div>
          </div>
          <div className="card p-4">
            <div className="font-medium">Ressources utiles</div>
            <ul className="mt-2 text-sm text-app-primary space-y-1">
              <li>
                <a
                  href="https://e-services.impots.bj/login-facile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Téléservices DGI (e-services)
                </a>
              </li>
              <li>
                <a
                  href="https://sygmef.impots.bj/emcf/Vsfe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Portail SIGMEF - Déclaration fiscale
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
