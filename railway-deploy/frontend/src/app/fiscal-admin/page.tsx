"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Download,
  Eye,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";

interface TaxOptimization {
  strategy: string;
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
  implementation: string[];
}

interface AuditRisk {
  category: string;
  riskScore: number;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
}

function FiscalAdminDashboard() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [taxOptimizations, setTaxOptimizations] = useState<TaxOptimization[]>([]);
  const [auditRisks, setAuditRisks] = useState<AuditRisk[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    if (companyId) {
      loadFiscalData();
    }
  }, [companyId]);

  const loadFiscalData = async () => {
    setLoading(true);
    try {
      // Simulation des données ML/IA
      const optimizations: TaxOptimization[] = [
        {
          strategy: "Optimisation TVA par secteur d'activité",
          potentialSavings: 2500000,
          riskLevel: "low",
          implementation: ["Reclassification des dépenses", "Optimisation des taux applicables"]
        },
        {
          strategy: "Déduction des charges professionnelles",
          potentialSavings: 1800000,
          riskLevel: "medium",
          implementation: ["Documentation renforcée", "Justificatifs numérisés"]
        }
      ];

      const risks: AuditRisk[] = [
        {
          category: "TVA collectée",
          riskScore: 15,
          description: "Écart détecté dans les déclarations TVA du Q3",
          recommendation: "Vérifier les factures clients et corriger les déclarations",
          priority: "high"
        },
        {
          category: "Charges déductibles",
          riskScore: 8,
          description: "Certaines dépenses pourraient être requalifiées",
          recommendation: "Revoir la classification des charges et fournir justificatifs",
          priority: "medium"
        }
      ];

      setTaxOptimizations(optimizations);
      setAuditRisks(risks);
      setComplianceScore(87);
    } catch (error) {
      console.error('Erreur chargement données fiscales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTaxDeclaration = async () => {
    // Simulation génération par IA
    console.log('Génération déclaration fiscale assistée par IA...');
  };

  const handleAuditAnalysis = async () => {
    // Simulation analyse audit par ML
    console.log('Lancement analyse audit automatisée...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord fiscal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Administration Fiscale
          </h1>
          <p className="text-gray-600 mt-2">
            Gestion fiscale intelligente avec optimisation IA et conformité OHADA
          </p>
        </div>

        {/* Score de Conformité */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score de Conformité</p>
                <p className="text-2xl font-bold text-green-600">{complianceScore}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${complianceScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Économies Potentielles</p>
                <p className="text-2xl font-bold text-blue-600">
                  {taxOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0).toLocaleString()} FCFA
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Identifiées par l'IA fiscale</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risques Audit</p>
                <p className="text-2xl font-bold text-amber-600">{auditRisks.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">À traiter prioritairement</p>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleGenerateTaxDeclaration}
            className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Générer Déclaration IA</span>
          </button>
          
          <button
            onClick={handleAuditAnalysis}
            className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>Analyse Audit Automatique</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Exporter Rapports</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics Fiscal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Optimisations Fiscales */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Optimisations Fiscales par IA
            </h2>
            <div className="space-y-4">
              {taxOptimizations.map((opt, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{opt.strategy}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Économie potentielle: {opt.potentialSavings.toLocaleString()} FCFA
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          opt.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          opt.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Risque: {opt.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 font-medium">Actions recommandées:</p>
                    <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                      {opt.implementation.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risques d'Audit */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Risques Identifiés par ML
            </h2>
            <div className="space-y-4">
              {auditRisks.map((risk, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{risk.category}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          risk.priority === 'high' ? 'bg-red-100 text-red-800' :
                          risk.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {risk.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Score de risque: {risk.riskScore}/100</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                risk.riskScore > 20 ? 'bg-red-500' :
                                risk.riskScore > 10 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(risk.riskScore * 3, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Recommandation:</strong> {risk.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FiscalAdminPage() {
  return (
    <ProtectedPage requiredRole="ROLE_FISCAL_ADMIN">
      <FiscalAdminDashboard />
    </ProtectedPage>
  );
}
