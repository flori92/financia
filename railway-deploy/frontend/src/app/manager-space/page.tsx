"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Download,
  AlertTriangle,
  UserCheck,
  FileText
} from "lucide-react";

interface TeamLeaveRequest {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface TeamCRA {
  id: string;
  employee: string;
  month: string;
  year: string;
  hoursWorked: number;
  activities: string[];
  status: 'submitted' | 'approved' | 'rejected';
  submissionDate: string;
}

interface TeamExpense {
  id: string;
  employee: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  status: 'active' | 'on_leave' | 'pending';
  performance: number;
  currentProjects: number;
}

function ManagerSpace() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'conges' | 'cra' | 'frais'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<TeamLeaveRequest[]>([]);
  const [cras, setCRAs] = useState<TeamCRA[]>([]);
  const [expenses, setExpenses] = useState<TeamExpense[]>([]);

  useEffect(() => {
    if (companyId) {
      loadManagerData();
    }
  }, [companyId]);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      // Simulation des données manager
      const teamData: TeamMember[] = [
        {
          id: "EMP-001",
          name: "Alice Martin",
          position: "Développeur Senior",
          department: "Tech",
          status: "active",
          performance: 92,
          currentProjects: 3
        },
        {
          id: "EMP-002",
          name: "Bob Bernard",
          position: "Développeur Junior",
          department: "Tech",
          status: "active",
          performance: 78,
          currentProjects: 2
        },
        {
          id: "EMP-003",
          name: "Carol Dubois",
          position: "Designer UX",
          department: "Design",
          status: "on_leave",
          performance: 88,
          currentProjects: 1
        }
      ];

      const leaveData: TeamLeaveRequest[] = [
        {
          id: "LEAVE-001",
          employee: "Alice Martin",
          type: "Congés annuels",
          startDate: "2025-12-20",
          endDate: "2025-12-31",
          days: 10,
          reason: "Vacances familiales",
          status: "pending",
          requestDate: "2025-11-01"
        },
        {
          id: "LEAVE-002",
          employee: "Bob Bernard",
          type: "RTT",
          startDate: "2025-11-15",
          endDate: "2025-11-15",
          days: 1,
          reason: "Journée récupération",
          status: "pending",
          requestDate: "2025-11-03"
        }
      ];

      const craData: TeamCRA[] = [
        {
          id: "CRA-001",
          employee: "Alice Martin",
          month: "Octobre",
          year: "2025",
          hoursWorked: 168,
          activities: ["Développement frontend", "Réunions client", "Documentation"],
          status: "submitted",
          submissionDate: "2025-11-01"
        },
        {
          id: "CRA-002",
          employee: "Bob Bernard",
          month: "Octobre",
          year: "2025",
          hoursWorked: 160,
          activities: ["Développement backend", "Tests unitaires", "Code review"],
          status: "submitted",
          submissionDate: "2025-11-02"
        }
      ];

      const expenseData: TeamExpense[] = [
        {
          id: "EXP-001",
          employee: "Alice Martin",
          date: "2025-11-03",
          amount: 45000,
          category: "Transport",
          description: "Frais de déplacement client",
          status: "pending",
          receiptUrl: "/api/expenses/receipts/EXP-001"
        },
        {
          id: "EXP-002",
          employee: "Bob Bernard",
          date: "2025-10-28",
          amount: 12000,
          category: "Repas",
          description: "Déjeuner d'affaires",
          status: "pending",
          receiptUrl: "/api/expenses/receipts/EXP-002"
        }
      ];

      setTeamMembers(teamData);
      setLeaveRequests(leaveData);
      setCRAs(craData);
      setExpenses(expenseData);
    } catch (error) {
      console.error('Erreur chargement données manager:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = (leaveId: string) => {
    console.log('Approbation congé:', leaveId);
    setLeaveRequests(prev => 
      prev.map(leave => 
        leave.id === leaveId ? { ...leave, status: 'approved' } : leave
      )
    );
  };

  const handleRejectLeave = (leaveId: string) => {
    console.log('Refus congé:', leaveId);
    setLeaveRequests(prev => 
      prev.map(leave => 
        leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
      )
    );
  };

  const handleApproveCRA = (craId: string) => {
    console.log('Approbation CRA:', craId);
    setCRAs(prev => 
      prev.map(cra => 
        cra.id === craId ? { ...cra, status: 'approved' } : cra
      )
    );
  };

  const handleApproveExpense = (expenseId: string) => {
    console.log('Approbation note de frais:', expenseId);
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId ? { ...expense, status: 'approved' } : expense
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace manager...</p>
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
            Espace Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez votre équipe, validez les congés, CRA et notes de frais
          </p>
        </div>

        {/* KPI Manager */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Effectif Équipe</p>
                <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {teamMembers.filter(m => m.status === 'active').length} actifs
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Congés en attente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {leaveRequests.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Validation requise</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CRA à valider</p>
                <p className="text-2xl font-bold text-green-600">
                  {cras.filter(c => c.status === 'submitted').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">En cours de review</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notes de frais</p>
                <p className="text-2xl font-bold text-purple-600">
                  {expenses.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0).toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'team', name: 'Mon Équipe', icon: Users },
                { id: 'conges', name: 'Validation Congés', icon: Calendar },
                { id: 'cra', name: 'Validation CRA', icon: FileText },
                { id: 'frais', name: 'Validation Frais', icon: DollarSign }
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
          {/* Onglet Équipe */}
          {activeTab === 'team' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vue d'ensemble de l'équipe</h2>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.position} • {member.department}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status === 'active' ? 'Actif' :
                               member.status === 'on_leave' ? 'En congé' : 'En attente'}
                            </span>
                            <span className="text-sm text-gray-600">
                              Performance: {member.performance}%
                            </span>
                            <span className="text-sm text-gray-600">
                              Projets: {member.currentProjects}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Voir détails →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Congés */}
          {activeTab === 'conges' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Demandes de congés à valider</h2>
              <div className="space-y-4">
                {leaveRequests.filter(l => l.status === 'pending').map((leave) => (
                  <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{leave.employee}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {leave.type} • {leave.days} jours
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Motif: {leave.reason}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Demandé le: {new Date(leave.requestDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <XCircle className="w-3 h-3" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {leaveRequests.filter(l => l.status === 'pending').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune demande de congé en attente</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet CRA */}
          {activeTab === 'cra' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">CRA à valider</h2>
              <div className="space-y-4">
                {cras.filter(c => c.status === 'submitted').map((cra) => (
                  <div key={cra.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{cra.employee}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          CRA {cra.month} {cra.year} • {cra.hoursWorked} heures
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Activités:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                            {cra.activities.map((activity, i) => (
                              <li key={i}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Soumis le: {new Date(cra.submissionDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <Eye className="w-4 h-4 inline mr-1" />
                          Voir détails
                        </button>
                        <button
                          onClick={() => handleApproveCRA(cra.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approuver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {cras.filter(c => c.status === 'submitted').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun CRA en attente de validation</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Notes de frais */}
          {activeTab === 'frais' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notes de frais à valider</h2>
              <div className="space-y-4">
                {expenses.filter(e => e.status === 'pending').map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{expense.employee}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {expense.category} • {expense.amount.toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(expense.date).toLocaleDateString('fr-FR')} - {expense.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {expense.receiptUrl && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            <Download className="w-4 h-4 inline mr-1" />
                            Voir reçu
                          </button>
                        )}
                        <button
                          onClick={() => handleApproveExpense(expense.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approuver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {expenses.filter(e => e.status === 'pending').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune note de frais en attente de validation</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManagerSpacePage() {
  return (
    <ProtectedPage requiredRole="ROLE_MANAGER">
      <ManagerSpace />
    </ProtectedPage>
  );
}
