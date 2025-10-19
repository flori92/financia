"use client";
import { useState } from "react";
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function BankReconciliationPage() {
  const [transactions] = useState([
    { 
      id: "1", 
      date: "2025-01-15", 
      description: "Virement client ABC Corp", 
      bankAmount: 120000, 
      bookAmount: 120000, 
      status: "reconciled" 
    },
    { 
      id: "2", 
      date: "2025-01-16", 
      description: "Paiement fournisseur XYZ", 
      bankAmount: -50000, 
      bookAmount: null, 
      status: "pending" 
    },
    { 
      id: "3", 
      date: "2025-01-17", 
      description: "Frais bancaires", 
      bankAmount: -1500, 
      bookAmount: null, 
      status: "pending" 
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rapprochement bancaire</h1>
          <p className="text-gray-600">Lettrage automatique et rapprochement intelligent</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <RefreshCw className="w-4 h-4" />
            Synchroniser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
            <CheckCircle className="w-4 h-4" />
            Lettrage auto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Solde bancaire</div>
          <div className="text-2xl font-semibold text-[#0D9488]">15 068 500 FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Solde comptable</div>
          <div className="text-2xl font-semibold text-blue-600">15 120 000 FCFA</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Écart à justifier</div>
          <div className="text-2xl font-semibold text-orange-600">51 500 FCFA</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Opérations à rapprocher</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant banque</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant comptable</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(transaction.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4">{transaction.description}</td>
                  <td className={`py-3 px-4 text-right font-medium ${transaction.bankAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.bankAmount >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(transaction.bankAmount)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {transaction.bookAmount ? 
                      `${transaction.bookAmount >= 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR').format(transaction.bookAmount)} FCFA` : 
                      '-'
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    {transaction.status === 'reconciled' ? (
                      <span className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Rapproché
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {transaction.status === 'pending' && (
                      <button className="text-[#0D9488] hover:text-[#0B7C74] text-sm font-medium">
                        Rapprocher
                      </button>
                    )}
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