"use client";
import { useState } from "react";
import { Plus, Search, Filter, Download, Send, Eye, Edit } from "lucide-react";

export default function InvoicesPage() {
  const [invoices] = useState([
    { 
      id: "FAC-2025-001", 
      client: "ABC Corp", 
      date: "2025-01-15", 
      dueDate: "2025-02-14", 
      amount: 120000, 
      status: "Payée",
      type: "Facture"
    },
    { 
      id: "FAC-2025-002", 
      client: "XYZ SARL", 
      date: "2025-01-16", 
      dueDate: "2025-02-15", 
      amount: 85000, 
      status: "En attente",
      type: "Facture"
    },
    { 
      id: "DEV-2025-003", 
      client: "Tech Solutions", 
      date: "2025-01-17", 
      dueDate: "2025-01-31", 
      amount: 150000, 
      status: "Brouillon",
      type: "Devis"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payée': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-orange-100 text-orange-800';
      case 'Brouillon': return 'bg-gray-100 text-gray-800';
      case 'Retard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Facturation & Ventes</h1>
          <p className="text-gray-600">Gestion complète du cycle de vente</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Download className="w-4 h-4" />
            Export Factur-X
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* KPIs Facturation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">CA du mois</div>
          <div className="text-2xl font-semibold text-[#0D9488]">355 000 FCFA</div>
          <div className="text-xs text-green-600">+12% vs mois dernier</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Factures impayées</div>
          <div className="text-2xl font-semibold text-orange-600">85 000 FCFA</div>
          <div className="text-xs text-gray-600">1 facture</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">DSO moyen</div>
          <div className="text-2xl font-semibold text-blue-600">28 jours</div>
          <div className="text-xs text-green-600">-2j vs objectif</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Taux transformation</div>
          <div className="text-2xl font-semibold text-purple-600">75%</div>
          <div className="text-xs text-gray-600">Devis → Factures</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">N° Document</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Échéance</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{invoice.id}</td>
                  <td className="py-3 px-4">{invoice.client}</td>
                  <td className="py-3 px-4 text-sm">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {new Intl.NumberFormat('fr-FR').format(invoice.amount)} FCFA
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
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