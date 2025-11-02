"use client";
import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { SimpleTable } from "@/components/table/SimpleTable";

const clientCols = [
  { key: "client", header: "Client" },
  { key: "country", header: "Pays" },
  { key: "balance", header: "Solde" },
  { key: "last", header: "Dernière facture" },
  { key: "due", header: "Échéance" },
  { key: "status", header: "Statut", render: (r: any) => (
    r.status === 'ok' ? <span className="badge-success">À jour</span> : <span className="badge-warning">Échéance proche</span>
  )},
];

const clients = [
  { client: "Global Services", country: "Côte d'Ivoire", balance: "2 100 000 €", last: "28/02/2025", due: "24/04/2025", status: "ok" },
  { client: "Société ABC", country: "Bénin", balance: "200 000 €", last: "15/03/2025", due: "13/04/2025", status: "ok" },
  { client: "Entreprise XYZ", country: "Bénin", balance: "580 000 €", last: "12/03/2025", due: "23/04/2025", status: "warn" },
];

const supplierCols = [
  { key: "supplier", header: "Fournisseur" },
  { key: "country", header: "Pays" },
  { key: "balance", header: "Solde" },
  { key: "last", header: "Dernière facture" },
  { key: "due", header: "Échéance" },
  { key: "status", header: "Statut", render: (r: any) => (
    r.status === 'ok' ? <span className="badge-success">À jour</span> : <span className="badge-warning">Échéance proche</span>
  )},
];

const suppliers = [
  { supplier: "SARL Tech Solutions", country: "Bénin", balance: "450 000 €", last: "05/03/2025", due: "03/04/2025", status: "warn" },
  { supplier: "Entreprise Martin", country: "France", balance: "380 000 €", last: "12/03/2025", due: "10/04/2025", status: "ok" },
];

export default function ReceivablesPayablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Créances & Dettes</h1>
      </div>

      <div className="card p-8">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Balance Âgée des Créances et Dettes
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Le module complet d'analyse des créances clients et dettes fournisseurs par ancienneté est disponible dans l'espace comptable.
          </p>
          <a 
            href="/accountant/aged-balance"
            className="inline-flex items-center gap-2 px-6 py-3 bg-app-primary text-white rounded-lg hover:bg-app-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Accéder à la Balance Âgée
          </a>
          <div className="mt-6 text-xs text-slate-500">
            <p className="font-medium mb-2">Fonctionnalités disponibles :</p>
            <ul className="space-y-1 text-left max-w-md mx-auto">
              <li>• Analyse créances clients par ancienneté (0-30j, 30-60j, 60-90j, &gt;90j)</li>
              <li>• Analyse dettes fournisseurs par ancienneté</li>
              <li>• Détail par tiers avec plus ancienne date</li>
              <li>• Alertes automatiques sur impayés &gt;90 jours</li>
              <li>• Graphiques visuels de répartition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
