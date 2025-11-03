"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { getCompanyId, getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

type Company = {
  id: string;
  name: string;
  siret?: string;
  nif?: string;
};

interface CompanySelectorProps {
  onCompanyChange?: (companyId: string) => void;
}

export function CompanySelector({ onCompanyChange }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const currentCompanyId = getCompanyId();
    if (companies.length > 0 && currentCompanyId) {
      const company = companies.find(c => c.id === currentCompanyId);
      if (company) {
        setSelectedCompany(company);
      }
    }
  }, [companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBaseUrl()}/api/v1/companies`);
      if (response.ok) {
        const data = await response.json();
        
        // Ajouter une entreprise de démo si aucune n'existe
        const companiesWithDemo = Array.isArray(data) && data.length > 0 
          ? data 
          : [
              {
                id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
                name: 'BMS Demo Company',
                siret: '12345678901234',
                nif: 'BJ1234567890123'
              }
            ];
        
        setCompanies(companiesWithDemo);
      }
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
      // Entreprise de démo par défaut en cas d'erreur
      setCompanies([{
        id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
        name: 'BMS Demo Company',
        siret: '12345678901234',
        nif: 'BJ1234567890123'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsOpen(false);
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('companyId', company.id);
      window.localStorage.setItem('companyName', company.name);
      
      // Déclencher un événement pour notifier le changement
      window.dispatchEvent(new CustomEvent('bms-company-changed', { 
        detail: { companyId: company.id, companyName: company.name } 
      }));
    }
    
    if (onCompanyChange) {
      onCompanyChange(company.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-0 max-w-xs"
      >
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-900 truncate">
          {selectedCompany?.name || 'Sélectionner une entreprise'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                Entreprises disponibles
              </div>
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                >
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {company.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {company.siret && `SIRET: ${company.siret}`}
                      {company.siret && company.nif && ' • '}
                      {company.nif && `NIF: ${company.nif}`}
                    </div>
                  </div>
                  {selectedCompany?.id === company.id && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
              
              {companies.length === 0 && (
                <div className="text-center py-8">
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune entreprise trouvée</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ajoutez votre première entreprise dans les paramètres
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Rediriger vers la page de gestion des entreprises
                  window.location.href = '/settings/companies';
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Gérer les entreprises
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
