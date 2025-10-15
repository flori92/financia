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
  const [active, setActive] = useState("clients");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Créances & Dettes</h1>
        <div className="flex gap-2">
          <input className="rounded-md border border-app-border px-3 py-2 text-sm" placeholder="Rechercher..." />
        </div>
      </div>

      <Tabs tabs={[{ id: 'clients', label: 'Clients' }, { id: 'suppliers', label: 'Fournisseurs' }]} defaultId="clients" onChange={setActive} />

      <div className="card p-4">
        {active === 'clients' ? (
          <SimpleTable columns={clientCols as any} data={clients} />
        ) : (
          <SimpleTable columns={supplierCols as any} data={suppliers} />
        )}
      </div>
    </div>
  );
}
