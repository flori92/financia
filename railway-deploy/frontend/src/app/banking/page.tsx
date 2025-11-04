"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Building, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Users,
  DollarSign,
  FileText,
  Eye,
  Activity
} from "lucide-react";

interface CreditAnalysis {
  clientId: string;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  amount: number;
  term: number;
  recommendation: string;
  factors: {
    positive: string[];
    negative: string[];
  };
}

interface RiskAssessment {
  category: string;
  score: number;
  factors: string[];
  mitigation: string[];
  lastUpdated: string;
}

function BankingDashboard() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [creditAnalyses, setCreditAnalyses] = useState<CreditAnalysis[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);

  useEffect(() => {
    if (companyId) {
      loadBankingData();
    }
  }, [companyId]);

  const loadBankingData = async () => {
    setLoading(true);
    try {
      // Simulation des données ML/IA pour banques
      const analysisData: CreditAnalysis[] = [
        {
          clientId: "ENT-001",
          creditScore: 750,
          riskLevel: "low",
          amount: 50000000,
          term: 36,
          recommendation: "APPROUVER - Excellent profil de crédit",
          factors: {
            positive: [
              "Historique de paiement impeccable",
              "Ratio d'endettement optimal",
              "Cash-flow stable et croissant"
            ],
            negative: [
              "Sector légèrement volatile"
            ]
          }
        },
        {
          clientId: "ENT-002",
          creditScore: 620,
          riskLevel: "medium",
          amount: 25000000,
          term: 24,
          recommendation: "APPROUVER AVEC CONDITIONS - Garanties requises",
          factors: {
            positive: [
              "Bon historique récent",
              "Marché en croissance"
            ],
            negative: [
              "Ratio d'endettement élevé",
              "Variabilité des revenus"
            ]
          }
        }
      ];

      const riskData: RiskAssessment[] = [
        {
          category: "Risque de Crédit",
          score: 35,
          factors: [
            "Concentration sectorielle modérée",
            "Qualité des garanties acceptable",
            "Historique de remboursement bon"
          ],
          mitigation: [
            "Diversification du portefeuille",
            "Suivi régulier des covenants",
            "Assurance-crédit pour gros risques"
          ],
          lastUpdated: "2025-11-04"
        },
        {
          category: "Risque Opérationnel",
          score: 22,
          factors: [
            "Systèmes robustes",
            "Personnel qualifié",
            "Procédures bien documentées"
          ],
          mitigation: [
            "Tests d'intrusion réguliers",
            "Formation continue",
            "Plans de continuité activés"
          ],
          lastUpdated: "2025-11-04"
        }
      ];

      setCreditAnalyses(analysisData);
      setRiskAssessments(riskData);
    } catch (error) {
      console.error('Erreur chargement données bancaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditScoring = async () => {
    console.log('Lancement scoring crédit par ML...');
  };

  const handleRiskAnalysis = async () => {
    console.log('Analyse approfondie des risques...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord bancaire...</p>
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
            <Building className="w-8 h-8 text-blue-600" />
            Banques et Institutions Financières
          </h1>
          <p className="text-gray-600 mt-2">
            Analyse de crédit intelligente et gestion des risques par IA
          </p>
        </div>

        {/* KPI Bancaires */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portefeuille Crédit</p>
                <p className="text-2xl font-bold text-green-600">75M FCFA</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Taux de défaut: 1.2%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score Moyen</p>
                <p className="text-2xl font-bold text-blue-600">685</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Basé sur l'analyse ML</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risques Surveillés</p>
                <p className="text-2xl font-bold text-purple-600">{riskAssessments.length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Monitoring en temps réel</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dossiers en Cours</p>
                <p className="text-2xl font-bold text-amber-600">{creditAnalyses.length}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Analyse automatique</p>
          </div>
        </div>

        {/* Actions Bancaires */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleCreditScoring}
            className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span>Scoring Crédit IA</span>
          </button>
          
          <button
            onClick={handleRiskAnalysis}
            className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>Analyse Risques</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics Portefeuille</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Rapports Réglementaires</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analyses de Crédit */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Analyses de Crédit par ML
            </h2>
            <div className="space-y-4">
              {creditAnalyses.map((analysis, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{analysis.clientId}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Risque: {analysis.riskLevel}
                        </span>
                        <span className="text-sm text-gray-600">
                          Score: {analysis.creditScore}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {(analysis.amount / 1000000).toFixed(0)}M
                      </p>
                      <p className="text-sm text-gray-600">{analysis.term} mois</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Score de crédit</span>
                      <span className="text-sm font-medium">{analysis.creditScore}/850</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          analysis.creditScore > 700 ? 'bg-green-500' :
                          analysis.creditScore > 600 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(analysis.creditScore / 850) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      {analysis.recommendation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">✅ Facteurs positifs:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {analysis.factors.positive.map((factor, i) => (
                          <li key={i}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">⚠️ Points d'attention:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {analysis.factors.negative.map((factor, i) => (
                          <li key={i}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évaluations de Risque */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Évaluations de Risque par IA
            </h2>
            <div className="space-y-4">
              {riskAssessments.map((risk, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{risk.category}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Score:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              risk.score > 50 ? 'bg-red-500' :
                              risk.score > 25 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${risk.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{risk.score}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Facteurs de risque:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {risk.factors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Mesures d'atténuation:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {risk.mitigation.map((measure, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Dernière mise à jour: {risk.lastUpdated}
                    </p>
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

export default function BankingPage() {
  return (
    <ProtectedPage requiredRole="ROLE_BANKING_INSTITUTION">
      <BankingDashboard />
    </ProtectedPage>
  );
}
