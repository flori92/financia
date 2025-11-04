"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Calendar, 
  FileText, 
  Download, 
  Upload,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  TrendingUp
} from "lucide-react";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  days: number;
  reason: string;
}

interface Payslip {
  id: string;
  month: string;
  year: string;
  grossSalary: number;
  netSalary: number;
  downloadUrl: string;
}

interface CRA {
  id: string;
  month: string;
  year: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  hoursWorked: number;
  activities: string[];
  submissionDate?: string;
}

interface ExpenseNote {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
}

function EmployeeSpace() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conges' | 'bulletins' | 'cra' | 'frais'>('conges');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [cras, setCRAs] = useState<CRA[]>([]);
  const [expenses, setExpenses] = useState<ExpenseNote[]>([]);

  useEffect(() => {
    if (companyId) {
      loadEmployeeData();
    }
  }, [companyId]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Simulation des données employé
      const leaveData: LeaveRequest[] = [
        {
          id: "LEAVE-001",
          type: "Congés annuels",
          startDate: "2025-12-20",
          endDate: "2025-12-31",
          status: "pending",
          days: 10,
          reason: "Vacances familiales"
        },
        {
          id: "LEAVE-002",
          type: "RTT",
          startDate: "2025-11-15",
          endDate: "2025-11-15",
          status: "approved",
          days: 1,
          reason: "Journée récupération"
        }
      ];

      const payslipData: Payslip[] = [
        {
          id: "PAY-001",
          month: "Octobre",
          year: "2025",
          grossSalary: 850000,
          netSalary: 720000,
          downloadUrl: "/api/payslips/download/PAY-001"
        },
        {
          id: "PAY-002",
          month: "Septembre",
          year: "2025",
          grossSalary: 850000,
          netSalary: 718000,
          downloadUrl: "/api/payslips/download/PAY-002"
        }
      ];

      const craData: CRA[] = [
        {
          id: "CRA-001",
          month: "Octobre",
          year: "2025",
          status: "draft",
          hoursWorked: 168,
          activities: ["Développement frontend", "Réunions client", "Documentation technique"],
          submissionDate: undefined
        },
        {
          id: "CRA-002",
          month: "Septembre",
          year: "2025",
          status: "approved",
          hoursWorked: 160,
          activities: ["Formation React", "Maintenance applicative", "Support utilisateur"],
          submissionDate: "2025-10-05"
        }
      ];

      const expenseData: ExpenseNote[] = [
        {
          id: "EXP-001",
          date: "2025-11-03",
          amount: 45000,
          category: "Transport",
          description: "Frais de déplacement client",
          status: "pending",
          receiptUrl: "/api/expenses/receipts/EXP-001"
        },
        {
          id: "EXP-002",
          date: "2025-10-28",
          amount: 12000,
          category: "Repas",
          description: "Déjeuner d'affaires",
          status: "approved",
          receiptUrl: "/api/expenses/receipts/EXP-002"
        }
      ];

      setLeaveRequests(leaveData);
      setPayslips(payslipData);
      setCRAs(craData);
      setExpenses(expenseData);
    } catch (error) {
      console.error('Erreur chargement données employé:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLeave = () => {
    console.log('Demande de congé...');
  };

  const handleDownloadPayslip = (payslipId: string) => {
    console.log('Téléchargement bulletin:', payslipId);
  };

  const handleSubmitCRA = (craId: string) => {
    console.log('Soumission CRA:', craId);
  };

  const handleSubmitExpense = () => {
    console.log('Soumission note de frais...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace employé...</p>
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
            <User className="w-8 h-8 text-blue-600" />
            Espace Employé
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos congés, bulletins de salaire, CRA et notes de frais
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'conges', name: 'Congés', icon: Calendar },
                { id: 'bulletins', name: 'Bulletins de salaire', icon: FileText },
                { id: 'cra', name: 'CRA', icon: Clock },
                { id: 'frais', name: 'Notes de frais', icon: DollarSign }
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
          {/* Onglet Congés */}
          {activeTab === 'conges' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mes Demandes de Congés</h2>
                <button
                  onClick={handleRequestLeave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Nouvelle demande
                </button>
              </div>

              <div className="space-y-4">
                {leaveRequests.map((leave) => (
                  <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{leave.type}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-gray-600">{leave.days} jours - {leave.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {leave.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            En attente
                          </span>
                        )}
                        {leave.status === 'approved' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approuvé
                          </span>
                        )}
                        {leave.status === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Refusé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Bulletins de salaire */}
          {activeTab === 'bulletins' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mes Bulletins de Salaire</h2>
              </div>

              <div className="space-y-4">
                {payslips.map((payslip) => (
                  <div key={payslip.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Bulletin {payslip.month} {payslip.year}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            Salaire brut: <span className="font-medium">{payslip.grossSalary.toLocaleString()} FCFA</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Salaire net: <span className="font-medium text-green-600">{payslip.netSalary.toLocaleString()} FCFA</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadPayslip(payslip.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet CRA */}
          {activeTab === 'cra' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mes Comptes Rendus d'Activité</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Nouveau CRA
                </button>
              </div>

              <div className="space-y-4">
                {cras.map((cra) => (
                  <div key={cra.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          CRA {cra.month} {cra.year}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {cra.hoursWorked} heures travaillées
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Activités:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                            {cra.activities.map((activity, i) => (
                              <li key={i}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        {cra.submissionDate && (
                          <p className="text-sm text-gray-600 mt-2">
                            Soumis le: {new Date(cra.submissionDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {cra.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitCRA(cra.id)}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Upload className="w-3 h-3" />
                            Soumettre
                          </button>
                        )}
                        {cra.status === 'submitted' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            En cours de validation
                          </span>
                        )}
                        {cra.status === 'approved' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approuvé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Notes de frais */}
          {activeTab === 'frais' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mes Notes de Frais</h2>
                <button
                  onClick={handleSubmitExpense}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Nouvelle note de frais
                </button>
              </div>

              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{expense.category}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(expense.date).toLocaleDateString('fr-FR')} - {expense.description}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          {expense.amount.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {expense.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </span>
                        )}
                        {expense.status === 'approved' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approuvé
                          </span>
                        )}
                        {expense.receiptUrl && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Voir reçu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistiques personnelles */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Congés restants</p>
                <p className="text-2xl font-bold text-blue-600">18</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Jours disponibles</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CRA en attente</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">À soumettre</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Frais en attente</p>
                <p className="text-2xl font-bold text-amber-600">1</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">45,000 FCFA</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Salaire moyen</p>
                <p className="text-2xl font-bold text-purple-600">719K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Net mensuel</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeSpacePage() {
  return (
    <ProtectedPage requiredRole="ROLE_EMPLOYEE">
      <EmployeeSpace />
    </ProtectedPage>
  );
}
