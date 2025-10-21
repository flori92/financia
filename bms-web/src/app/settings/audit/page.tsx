"use client";

import { Shield, User, FileText, Settings, DollarSign, Package, Clock } from "lucide-react";

const AUDIT_LOGS = [
  { id: 1, user: "comptable@cabinet.bj", action: "Création écriture", module: "Comptabilité", details: "Journal GEN-2025-001", date: "2025-01-20 14:30", icon: FileText, color: "text-blue-600" },
  { id: 2, user: "admin@bms.bj", action: "Modification utilisateur", module: "Paramètres", details: "Rôle modifié", date: "2025-01-20 13:15", icon: User, color: "text-purple-600" },
  { id: 3, user: "entrepreneur@test.bj", action: "Création facture", module: "Ventes", details: "Facture INV-2025-042", date: "2025-01-20 11:45", icon: DollarSign, color: "text-green-600" },
  { id: 4, user: "comptable@cabinet.bj", action: "Validation écriture", module: "Comptabilité", details: "Journal GEN-2025-001", date: "2025-01-20 10:20", icon: Shield, color: "text-teal-600" },
  { id: 5, user: "admin@bms.bj", action: "Modification paramètres", module: "Système", details: "Configuration TVA", date: "2025-01-20 09:00", icon: Settings, color: "text-gray-600" },
  { id: 6, user: "entrepreneur@test.bj", action: "Mouvement stock", module: "Stock", details: "Entrée marchandise", date: "2025-01-19 16:30", icon: Package, color: "text-orange-600" },
  { id: 7, user: "comptable@cabinet.bj", action: "Export données", module: "Comptabilité", details: "Balance générale", date: "2025-01-19 15:10", icon: FileText, color: "text-blue-600" },
  { id: 8, user: "taxadmin@dgi.bj", action: "Consultation rapport", module: "Fiscal", details: "Déclaration TVA", date: "2025-01-19 14:00", icon: Shield, color: "text-red-600" },
];

const MODULES = ["Tous", "Comptabilité", "Ventes", "Achats", "Stock", "Paramètres", "Système", "Fiscal"];

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit & traçabilité</h1>
        <p className="text-gray-600 mt-1">Historique des actions et logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Actions aujourd'hui</div>
          <div className="text-2xl font-bold">24</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Utilisateurs actifs</div>
          <div className="text-2xl font-bold">8</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Modifications</div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Exports</div>
          <div className="text-2xl font-bold">3</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <select className="px-3 py-2 border rounded-lg">
            {MODULES.map(m => <option key={m}>{m}</option>)}
          </select>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg"
            defaultValue="2025-01-20"
          />
          <input
            type="text"
            placeholder="Rechercher..."
            className="flex-1 px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="space-y-3">
          {AUDIT_LOGS.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-lg bg-gray-50 ${log.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{log.action}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {log.date}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{log.user}</span> - {log.module}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{log.details}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
