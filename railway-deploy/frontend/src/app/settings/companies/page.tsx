"use client";
import { getBaseUrl } from "@/lib/api";

import { useState, useEffect } from "react";
import { Building2, Plus, Mail, Download, Upload, Search } from "lucide-react";
import { ExportButton } from "@/components/shared/ExportButton";
import { ImportButton } from "@/components/shared/ImportButton";
import { EmailDialog } from "@/components/shared/EmailDialog";

type Company = {
  id: string;
  name: string;
  siret: string;
  nif: string;
  rccm: string;
  status: string;
  sector: string;
  city: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${getBaseUrl()}/api/v1/companies`)
      .then(res => res.json())
      .then(setCompanies);
  }, []);

  const handleAddCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCompany = Object.fromEntries(formData);
    
    fetch(`${getBaseUrl()}/api/v1/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompany)
    })
      .then(res => res.json())
      .then(company => {
        setCompanies([...companies, company]);
        setShowAddForm(false);
      });
  };

  const handleExport = () => {
    const csv = [
      ['Nom', 'SIRET', 'NIF', 'RCCM', 'Secteur', 'Ville'].join(','),
      ...companies.map(c => [c.name, c.siret, c.nif, c.rccm, c.sector, c.city].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'societes.csv';
    a.click();
  };

  const handleImport = (file: File) => {
    alert(`Import de ${file.name} - Fonctionnalité en développement`);
  };

  const handleSendEmail = (data: { to: string; subject: string; message: string }) => {
    alert(`Email envoyé à ${data.to}`);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sociétés clientes</h1>
          <p className="text-gray-600 mt-1">Gestion du portefeuille client</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportButton onImport={handleImport} />
          <ExportButton onExport={handleExport} />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouvelle société
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une société..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Société</th>
                <th className="text-left py-3 px-4">NIF</th>
                <th className="text-left py-3 px-4">RCCM</th>
                <th className="text-left py-3 px-4">Secteur</th>
                <th className="text-left py-3 px-4">Ville</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <tr key={company.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0D9488]/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#0D9488]" />
                      </div>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.siret}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{company.nif}</td>
                  <td className="py-3 px-4 text-sm">{company.rccm}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                      {company.sector}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{company.city}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowEmailDialog(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Envoyer un email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Nouvelle société</h2>
            </div>
            <form onSubmit={handleAddCompany} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input name="name" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SIRET</label>
                  <input name="siret" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">NIF</label>
                  <input name="nif" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">RCCM</label>
                  <input name="rccm" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secteur</label>
                  <input name="sector" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ville</label>
                  <input name="city" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EmailDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={handleSendEmail}
        defaultTo={selectedCompany?.name || ""}
        defaultSubject={`Contact - ${selectedCompany?.name}`}
      />
    </div>
  );
}
