'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, TrendingUp, Award, FileText, CheckCircle, AlertTriangle, Target, Activity, Shield } from 'lucide-react';
import { apiGet, getCompanyId } from '@/lib/api';
import { formatCurrency } from "@/lib/format-utils";

interface BankPartnerData {
  portfolio: {
    activeClients: number;
    newClients: number;
    activeLoans: number;
    totalLoanAmount: number;
    repaymentRate: number;
    pendingApplications: number;
  };
  creditScoreDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    totalScored: number;
  };
  recentApplications: Array<{
    id: string;
    clientName: string;
    business: string;
    amount: number;
    creditScore: number;
    duration: number;
    status: 'pending' | 'approved' | 'rejected';
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  loanPortfolio: Array<{
    id: string;
    clientName: string;
    business: string;
    amount: number;
    repaid: number;
    remaining: number;
    dueDate: string;
    status: 'active' | 'completed' | 'overdue';
    daysPastDue?: number;
  }>;
  performance: {
    monthlyDisbursements: number;
    monthlyRepayments: number;
    defaultRate: number;
    averageLoanSize: number;
    approvalRate: number;
  };
  alerts: Array<{
    type: "danger" | "warning" | "info";
    title: string;
    message: string;
    clientName?: string;
  }>;
}

export default function BankPartnerDashboard() {
  const [data, setData] = useState<BankPartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      try {
        // Simuler les données de partenaire bancaire
        // En réalité, ces données viendraient des APIs scoring et loans
        const mockData: BankPartnerData = {
          portfolio: {
            activeClients: 156,
            newClients: 12,
            activeLoans: 89,
            totalLoanAmount: 245000000, // 245 millions FCFA
            repaymentRate: 94.5,
            pendingApplications: 23
          },
          creditScoreDistribution: {
            excellent: 34,
            good: 67,
            average: 42,
            poor: 13,
            totalScored: 156
          },
          recentApplications: [
            { 
              id: '1', 
              clientName: 'SARL Tech Innov', 
              business: 'Services IT', 
              amount: 15000000, 
              creditScore: 750, 
              duration: 24, 
              status: 'pending',
              riskLevel: 'low'
            },
            { 
              id: '2', 
              clientName: 'EURL Commerce Pro', 
              business: 'Commerce', 
              amount: 8000000, 
              creditScore: 680, 
              duration: 18, 
              status: 'approved',
              riskLevel: 'medium'
            },
            { 
              id: '3', 
              clientName: 'SA Industries Plus', 
              business: 'Industrie', 
              amount: 25000000, 
              creditScore: 450, 
              duration: 36, 
              status: 'rejected',
              riskLevel: 'high'
            }
          ],
          loanPortfolio: [
            {
              id: '1',
              clientName: 'SARL Construction Plus',
              business: 'BTP',
              amount: 20000000,
              repaid: 8500000,
              remaining: 11500000,
              dueDate: '2025-06-15',
              status: 'active'
            },
            {
              id: '2',
              clientName: 'EURL Services Elite',
              business: 'Services',
              amount: 12000000,
              repaid: 12000000,
              remaining: 0,
              dueDate: '2024-12-20',
              status: 'completed'
            },
            {
              id: '3',
              clientName: 'SA Transport Express',
              business: 'Transport',
              amount: 15000000,
              repaid: 5000000,
              remaining: 10000000,
              dueDate: '2024-11-30',
              status: 'overdue',
              daysPastDue: 45
            }
          ],
          performance: {
            monthlyDisbursements: 45000000,
            monthlyRepayments: 42000000,
            defaultRate: 5.5,
            averageLoanSize: 2750000,
            approvalRate: 68.5
          },
          alerts: [
            {
              type: 'danger',
              title: 'Retard de paiement critique',
              message: 'SA Transport Express a 45 jours de retard',
              clientName: 'SA Transport Express'
            },
            {
              type: 'warning',
              title: 'Applications à haut risque',
              message: '8 applications présentent un score de crédit inférieur à 500',
              clientName: 'Multiple'
            },
            {
              type: 'info',
              title: 'Nouveaux clients qualifiés',
              message: '12 nouveaux clients avec score de crédit > 650 ce mois',
              clientName: 'Multiple'
            }
          ]
        };

        setData(mockData);
      } catch (err: any) {
        setError(err?.message || "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partenaire Bancaire</h1>
        <p className="text-gray-600">Scoring et financement des entrepreneurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.portfolio.activeClients || 0).toLocaleString('fr-FR')}</div>
            <p className="text-xs text-gray-600 mt-1">+{data?.portfolio.newClients} ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prêts Actifs</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.portfolio.activeLoans}</div>
            <p className="text-xs text-green-600 mt-1">{(data?.portfolio.totalLoanAmount || 0).toLocaleString('fr-FR')} FCFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de Remboursement</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.portfolio.repaymentRate}%</div>
            <p className="text-xs text-purple-600 mt-1">Excellent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Demandes en Attente</CardTitle>
            <FileText className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.portfolio.pendingApplications}</div>
            <p className="text-xs text-orange-600 mt-1">À évaluer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Demandes de Crédit Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentApplications?.map((app) => (
                <div key={app.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{app.clientName}</p>
                      <p className="text-sm text-gray-600">{app.business}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status === 'approved' ? 'Approuvé' :
                       app.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Montant</p>
                      <p className="font-medium">{app.amount.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Score</p>
                      <p className="font-medium flex items-center gap-1">
                        <Award className="w-4 h-4 text-purple-600" />
                        {app.creditScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Durée</p>
                      <p className="font-medium">{app.duration} mois</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring Automatisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">Score Excellent (80-100)</span>
                  <span className="text-2xl font-bold text-green-600">{data?.creditScoreDistribution.excellent}</span>
                </div>
                <p className="text-sm text-gray-600">Risque faible - Approbation automatique</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800">Score Bon (60-79)</span>
                  <span className="text-2xl font-bold text-blue-600">{data?.creditScoreDistribution.good}</span>
                </div>
                <p className="text-sm text-gray-600">Risque modéré - Révision manuelle</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-orange-800">Score Moyen (40-59)</span>
                  <span className="text-2xl font-bold text-orange-600">{data?.creditScoreDistribution.average}</span>
                </div>
                <p className="text-sm text-gray-600">Risque élevé - Garanties requises</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-800">Score Faible (&lt;40)</span>
                  <span className="text-2xl font-bold text-red-600">{data?.creditScoreDistribution.poor}</span>
                </div>
                <p className="text-sm text-gray-600">Risque très élevé - Refus automatique</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio de Prêts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Remboursé</th>
                  <th className="text-left p-3">Restant</th>
                  <th className="text-left p-3">Échéance</th>
                  <th className="text-left p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data?.loanPortfolio?.map((loan) => (
                  <tr key={loan.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{loan.clientName}</p>
                        <p className="text-sm text-gray-600">{loan.business}</p>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{loan.amount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 text-green-600">{loan.repaid.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 text-orange-600">{loan.remaining.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 text-sm">{new Date(loan.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        loan.status === 'active' ? 'bg-green-100 text-green-800' :
                        loan.status === 'overdue' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {loan.status === 'active' ? 'À jour' :
                         loan.status === 'overdue' ? 'En retard' : 'Terminé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
