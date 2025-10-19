"use client";
import { useState } from "react";
import { Plus, Search, Filter, Download, Upload } from "lucide-react";

export default function ChartOfAccountsPage() {
  const [accounts] = useState([
    { code: "101000", name: "Capital social", type: "Capitaux propres", balance: 100000 },
    { code: "411000", name: "Clients", type: "Actif circulant", balance: 45000 },
    { code: "401000", name: "Fournisseurs", type: "Dettes", balance: -25000 },
    { code: "701000", name: "Ventes de marchandises", type: "Produits", balance: -150000 },
    { code: "607000", name: "Achats de marchandises", type: "Charges", balance: 80000 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plan comptable</h1>
          <p className="text-gray-600">Gestion du plan comptable multi-dimensionnel</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
            <Plus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un compte..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Libellé</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{account.code}</td>
                  <td className="py-3 px-4">{account.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{account.type}</td>
                  <td className={`py-3 px-4 text-right font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('fr-FR').format(Math.abs(account.balance))} FCFA
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-[#0D9488] hover:text-[#0B7C74] text-sm font-medium">
                      Modifier
                    </button>
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