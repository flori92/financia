"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  FileText,
  UserPlus,
  Award,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Settings,
  BarChart3
} from "lucide-react";

interface GlobalLeaveStats {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  currentOnLeave: number;
}

interface PayrollStats {
  totalEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  monthlyCost: number;
  pendingPayslips: number;
}

interface CompanyPolicy {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  downloadUrl: string;
}

interface RecruitmentRequest {
  id: string;
  position: string;
  department: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  postedDate: string;
  applicants: number;
}

function HRSpace() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'conges' | 'paie' | 'politiques' | 'recrutement'>('dashboard');
  const [leaveStats, setLeaveStats] = useState<GlobalLeaveStats | null>(null);
  const [payrollStats, setPayrollStats] = useState<PayrollStats | null>(null);
  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const [recruitmentRequests, setRecruitmentRequests] = useState<RecruitmentRequest[]>([]);

  useEffect(() => {
    if (companyId) {
      loadHRData();
    }
  }, [companyId]);

  const loadHRData = async () => {
    setLoading(true);
    try {
      // Simulation des données RH globales
      const leaveData: GlobalLeaveStats = {
        totalRequests: 45,
        pending: 8,
        approved: 35,
        rejected: 2,
        currentOnLeave: 3
      };

      const payrollData: PayrollStats = {
        totalEmployees: 24,
        totalPayroll: 18000000,
        averageSalary: 750000,
        monthlyCost: 17280000,
        pendingPayslips: 2
      };

      const policiesData: CompanyPolicy[] = [
        {
          id: "POL-001",
          title: "Politique de gestion des congés",
          category: "Congés",
          lastUpdated: "2025-10-15",
          status: "active",
          downloadUrl: "/api/policies/download/POL-001"
        },
        {
          id: "POL-002",
          title: "Guide des notes de frais",
          category: "Dépenses",
          lastUpdated: "2025-09-30",
          status: "active",
          downloadUrl: "/api/policies/download/POL-002"
        },
        {
          id: "POL-003",
          title: "Charte de télétravail",
          category: "Télétravail",
          lastUpdated: "2025-11-01",
          status: "draft",
          downloadUrl: "/api/policies/download/POL-003"
        }
      ];

      const recruitmentData: RecruitmentRequest[] = [
        {
          id: "REC-001",
          position: "Développeur Full-Stack",
          department: "Tech",
          urgency: "high",
          status: "open",
          postedDate: "2025-10-20",
          applicants: 12
        },
        {
          id: "REC-002",
          position: "Commercial Senior",
          department: "Sales",
          urgency: "medium",
          status: "in_progress",
          postedDate: "2025-10-15",
          applicants: 8
        },
        {
          id: "REC-003",
          position: "Chef de Projet Digital",
          department: "Tech",
          urgency: "high",
          status: "open",
          postedDate: "2025-11-01",
          applicants: 5
        }
      ];

      setLeaveStats(leaveData);
      setPayrollStats(payrollData);
      setPolicies(policiesData);
      setRecruitmentRequests(recruitmentData);
    } catch (error) {
      console.error('Erreur chargement données RH:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = () => {
    console.log('Génération des bulletins de salaire...');
  };

  const handleDownloadPolicy = (policyId: string) => {
    console.log('Téléchargement politique:', policyId);
  };

  const handleViewRecruitment = (requestId: string) => {
    console.log('Voir détails recrutement:', requestId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace RH...</p>
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
            <Users className="w-8 h-8 text-blue-600" />
            Espace RH
          </h1>
          <p className="text-gray-600 mt-2">
            Gestion globale des ressources humaines et administration du personnel
          </p>
        </div>

        {/* KPI RH Globaux */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Effectif Total</p>
                <p className="text-2xl font-bold text-blue-600">{payrollStats?.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Employés actifs</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Masse Salariale</p>
                <p className="text-2xl font-bold text-green-600">
                  {payrollStats ? (payrollStats.totalPayroll / 1000000).toFixed(1) : '0'}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">FCFA mensuels</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Congés en attente</p>
                <p className="text-2xl font-bold text-amber-600">{leaveStats?.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Validation requise</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recrutements</p>
                <p className="text-2xl font-bold text-purple-600">{recruitmentRequests.filter(r => r.status === 'open').length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Postes ouverts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bulletins en attente</p>
                <p className="text-2xl font-bold text-red-600">{payrollStats?.pendingPayslips}</p>
              </div>
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">À générer</p>
          </div>
        </div>

        {/* Actions Rapides RH */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <button className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>Gestion Congés</span>
          </button>
          
          <button
            onClick={handleGeneratePayslips}
            className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span>Générer Paie</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <UserPlus className="w-5 h-5" />
            <span>Recrutement</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            <Award className="w-5 h-5" />
            <span>Performance</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Paramètres RH</span>
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'dashboard', name: 'Tableau de Bord', icon: BarChart3 },
                { id: 'conges', name: 'Congés Globaux', icon: Calendar },
                { id: 'paie', name: 'Administration Paie', icon: DollarSign },
                { id: 'politiques', name: 'Politiques RH', icon: FileText },
                { id: 'recrutement', name: 'Recrutement', icon: UserPlus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Onglet Dashboard */}
          {activeTab === 'dashboard' && leaveStats && payrollStats && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vue d'ensemble RH</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Statistiques Congés */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    Statistiques des Congés
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Total demandes ce mois</span>
                      <span className="font-medium">{leaveStats.totalRequests}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm text-yellow-800">En attente de validation</span>
                      <span className="font-medium text-yellow-600">{leaveStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-800">Approuvées</span>
                      <span className="font-medium text-green-600">{leaveStats.approved}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-800">Actuellement en congé</span>
                      <span className="font-medium text-blue-600">{leaveStats.currentOnLeave}</span>
                    </div>
                  </div>
                </div>

                {/* Statistiques Paie */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Statistiques de Paie
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Effectif total</span>
                      <span className="font-medium">{payrollStats.totalEmployees} employés</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-800">Masse salariale mensuelle</span>
                      <span className="font-medium text-green-600">
                        {payrollStats.monthlyCost.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-800">Salaire moyen</span>
                      <span className="font-medium text-blue-600">
                        {payrollStats.averageSalary.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-red-800">Bulletins à générer</span>
                      <span className="font-medium text-red-600">{payrollStats.pendingPayslips}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Congés Globaux */}
          {activeTab === 'conges' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Gestion Globale des Congés</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Nouvelle politique de congés
                </button>
              </div>
              
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Interface de gestion globale des congés</p>
                <p className="text-sm text-gray-500 mt-2">Validation, planning, et administration des congés entreprise</p>
              </div>
            </div>
          )}

          {/* Onglet Paie */}
          {activeTab === 'paie' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Administration de la Paie</h2>
                <button
                  onClick={handleGeneratePayslips}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Générer bulletins du mois
                </button>
              </div>
              
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Interface d'administration de la paie</p>
                <p className="text-sm text-gray-500 mt-2">Génération, validation et distribution des bulletins de salaire</p>
              </div>
            </div>
          )}

          {/* Onglet Politiques */}
          {activeTab === 'politiques' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Politiques et Procédures RH</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  Nouvelle politique
                </button>
              </div>

              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{policy.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Catégorie: {policy.category}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Dernière mise à jour: {new Date(policy.lastUpdated).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          policy.status === 'active' ? 'bg-green-100 text-green-800' :
                          policy.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.status === 'active' ? 'Active' :
                           policy.status === 'draft' ? 'Brouillon' : 'Archivée'}
                        </span>
                        <button
                          onClick={() => handleDownloadPolicy(policy.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Recrutement */}
          {activeTab === 'recrutement' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Processus de Recrutement</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Nouvelle offre d'emploi
                </button>
              </div>

              <div className="space-y-4">
                {recruitmentRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{request.position}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Département: {request.department}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                            request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.urgency === 'high' ? 'Urgent' :
                             request.urgency === 'medium' ? 'Moyen' : 'Faible'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {request.applicants} candidats
                          </span>
                          <span className="text-sm text-gray-600">
                            Posté le: {new Date(request.postedDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewRecruitment(request.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HRSpacePage() {
  return (
    <ProtectedPage requiredRole="ROLE_HR">
      <HRSpace />
    </ProtectedPage>
  );
}
