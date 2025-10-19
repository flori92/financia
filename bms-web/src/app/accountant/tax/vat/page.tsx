"use client";
import { useState } from "react";
import { Download, Upload, Send, Calculator, FileText } from "lucide-react";

export default function VATPage() {
  const [vatData] = useState({
    period: "2025-01",
    collectee: 125000,
    deductible: 45000,
    netVat: 80000,
    status: "À télétransmettre"
  });

  const [vatDetails] = useState([
    { account: "445710", description: "TVA collectée 20%", base: 625000, rate: 20, amount: 125000 },
    { account: "445620", description: "TVA déductible achats", base: 225000, rate: 20, amount: -45000 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">TVA - Déclaration CA3</h1>
          <p className="text-gray-600">Gestion complète de la TVA et télétransmission</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Calculator className="w-4 h-4" />
            Recalculer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
            <Send className="w-4 h-4" />
            Télétransmettre
          </button>
        </div>
      </div>

      {/* Résumé TVA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">TVA collectée</div>
          <div className="text-2xl font-semibold text-green-600">
            {new Intl.NumberFormat('fr-FR').format(vatData.collectee)} FCFA
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">TVA déductible</div>
          <div className="text-2xl font-semibold text-blue-600">
            {new Intl.NumberFormat('fr-FR').format(vatData.deductible)} FCFA
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">TVA nette à payer</div>
          <div className="text-2xl font-semibold text-orange-600">
            {new Intl.NumberFormat('fr-FR').format(vatData.netVat)} FCFA
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Échéance</div>
          <div className="text-lg font-semibold">15/02/2025</div>
          <div className="text-xs text-red-600">Dans 15 jours</div>
        </div>
      </div>

      {/* Détail TVA */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Détail de la déclaration CA3</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Base HT</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Taux</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant TVA</th>
              </tr>
            </thead>
            <tbody>
              {vatDetails.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm">{item.account}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">
                    {new Intl.NumberFormat('fr-FR').format(item.base)} FCFA
                  </td>
                  <td className="py-3 px-4 text-center">{item.rate}%</td>
                  <td className={`py-3 px-4 text-right font-medium ${item.amount > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {item.amount > 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Actions disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <FileText className="w-8 h-8 text-[#0D9488]" />
            <div className="text-left">
              <div className="font-medium">Générer CA3</div>
              <div className="text-sm text-gray-600">Export PDF de la déclaration</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Upload className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Import DEB/DES</div>
              <div className="text-sm text-gray-600">Échanges intracommunautaires</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="w-8 h-8 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Export FEC</div>
              <div className="text-sm text-gray-600">Fichier des écritures comptables</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}