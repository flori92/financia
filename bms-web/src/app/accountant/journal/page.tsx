"use client";
import { useState } from "react";
import { Plus, Search, Filter, Download, Upload, Camera } from "lucide-react";

export default function JournalPage() {
  const [entries] = useState([
    { 
      id: "JV001", 
      date: "2025-01-15", 
      reference: "FAC-2025-001", 
      description: "Vente client ABC Corp", 
      debit: 120000, 
      credit: 0,
      account: "411000",
      status: "Validé"
    },
    { 
      id: "JV002", 
      date: "2025-01-15", 
      reference: "FAC-2025-001", 
      description: "TVA collectée", 
      debit: 0, 
      credit: 20000,
      account: "445710",
      status: "Validé"
    },
    { 
      id: "JV003", 
      date: "2025-01-16", 
      reference: "ACH-2025-005", 
      description: "Achat fournitures bureau", 
      debit: 50000, 
      credit: 0,
      account: "606000",
      status: "Brouillon"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journal comptable</h1>
          <p className="text-gray-600">Saisie et consultation des écritures comptables</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Camera className="w-4 h-4" />
            OCR Facture
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
            <Plus className="w-4 h-4" />
            Nouvelle écriture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total débits</div>
          <div className="text-2xl font-semibold text-green-600">170 000 FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total crédits</div>
          <div className="text-2xl font-semibold text-red-600">20 000 FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Écritures validées</div>
          <div className="text-2xl font-semibold text-blue-600">2</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">En brouillon</div>
          <div className="text-2xl font-semibold text-orange-600">1</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une écriture..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">N° Écriture</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Référence</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Débit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Crédit</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{entry.id}</td>
                  <td className="py-3 px-4 text-sm">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-sm">{entry.reference}</td>
                  <td className="py-3 px-4">{entry.description}</td>
                  <td className="py-3 px-4 font-mono text-sm">{entry.account}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {entry.debit > 0 ? new Intl.NumberFormat('fr-FR').format(entry.debit) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    {entry.credit > 0 ? new Intl.NumberFormat('fr-FR').format(entry.credit) + ' FCFA' : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      entry.status === 'Validé' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}