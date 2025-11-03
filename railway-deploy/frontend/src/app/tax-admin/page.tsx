'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Target, Shield } from 'lucide-react';
import { apiGet, getCompanyId } from '@/lib/api';
import { formatCurrency } from "@/lib/format-utils";

interface TaxAdminData {
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    newCompanies: number;
    totalDeclarations: number;
    pendingDeclarations: number;
    monthlyRevenue: number;
    revenueGrowth: number;
  };
  compliance: {
    compliantCompanies: number;
    lateCompanies: number;
    nonCompliantCompanies: number;
    anomalies: number;
    overallComplianceRate: number;
  };
  recentDeclarations: Array<{id: string; company: string; type: string; period: string; amount: number; status: string}>;
  sectorStats: Array<{name: string; companies: number; revenue: number; complianceRate: number}>;
  vatSummary: {
    totalVATCollected: number;
    totalVATDeductible: number;
    netVATToPay: number;
    declarationsProcessed: number;
  };
  alerts: Array<{
    type: "danger" | "warning" | "info";
    title: string;
    message: string;
    company?: string;
  }>;
}

export default function TaxAdminDashboard() {
  const [data, setData] = useState<TaxAdminData | null>(null);
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
        // Simuler les données d'administration fiscale
        // En réalité, ces données viendraient d'une agrégation de toutes les entreprises
        const mockData: TaxAdminData = {
          overview: {
            totalCompanies: 1247,
            activeCompanies: 1156,
            newCompanies: 45,
            totalDeclarations: 3420,
            pendingDeclarations: 127,
            monthlyRevenue: 2840000000, // 2.84 milliards FCFA
            revenueGrowth: 12.5
          },
          compliance: {
            compliantCompanies: 890,
            lateCompanies: 187,
            nonCompliantCompanies: 79,
            anomalies: 23,
            overallComplianceRate: 77.0
          },
          recentDeclarations: [
            { id: '1', company: 'SARL Tech Solutions', type: 'TVA', period: '2025-01', amount: 2500000, status: 'submitted' },
            { id: '2', company: 'EURL Commerce Plus', type: 'TVA', period: '2025-01', amount: 1800000, status: 'validated' },
            { id: '3', company: 'SA Industries Modernes', type: 'TVA', period: '2024-12', amount: 3200000, status: 'pending' },
            { id: '4', company: 'SARL Services Pro', type: 'Impôt sur revenu', period: '2025-01', amount: 850000, status: 'submitted' }
          ],
          sectorStats: [
            { name: 'Commerce', companies: 456, revenue: 1200000000, complianceRate: 82.5 },
            { name: 'Services', companies: 312, revenue: 890000000, complianceRate: 74.2 },
            { name: 'Industrie', companies: 234, revenue: 650000000, complianceRate: 68.9 },
            { name: 'Transport', companies: 154, revenue: 100000000, complianceRate: 91.3 }
          ],
          vatSummary: {
            totalVATCollected: 456000000,
            totalVATDeductible: 234000000,
            netVATToPay: 222000000,
            declarationsProcessed: 892
          },
          alerts: [
            {
              type: 'danger',
              title: 'Non-conformité critique',
              message: '79 entreprises présentent des irrégularités fiscales majeures',
              company: 'Multiple'
            },
            {
              type: 'warning',
              title: 'Déclarations en retard',
              message: '187 entreprises ont des déclarations TVA en retard de plus de 30 jours',
              company: 'Multiple'
            },
            {
              type: 'info',
              title: 'Nouvelles entreprises',
              message: '45 nouvelles entreprises enregistrées ce mois',
              company: 'Multiple'
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
        <h1 className="text-3xl font-bold">Administration Fiscale</h1>
        <p className="text-gray-600">Suivi et contrôle fiscal automatisé</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entreprises Actives</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.activeCompanies?.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">+{data?.overview.newCompanies} ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Déclarations en Attente</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.pendingDeclarations}</div>
            <p className="text-xs text-orange-600 mt-1">À traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recettes du Mois</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.monthlyRevenue?.toLocaleString()} FCFA</div>
            <p className="text-xs text-green-600 mt-1">+{data?.overview.revenueGrowth}% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Détectées</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.compliance.anomalies}</div>
            <p className="text-xs text-red-600 mt-1">Nécessite attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Déclarations Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentDeclarations?.map((decl) => (
                <div key={decl.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{decl.company}</p>
                    <p className="text-sm text-gray-600">{decl.type} - {decl.period}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{safeToLocaleString(decl.amount)} FCFA</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      decl.status === 'validated' ? 'bg-green-100 text-green-800' :
                      decl.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {decl.status === 'validated' ? 'Validé' :
                       decl.status === 'pending' ? 'En attente' : 'Rejeté'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conformité Fiscale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Conformes</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{data?.compliance.compliantCompanies}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">En retard</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{data?.compliance.lateCompanies}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Non conformes</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{data?.compliance.nonCompliantCompanies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques par Secteur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Secteur</th>
                  <th className="text-left p-3">Entreprises</th>
                  <th className="text-left p-3">Recettes Totales</th>
                  <th className="text-left p-3">Taux de Conformité</th>
                </tr>
              </thead>
              <tbody>
                {data?.sectorStats?.map((sector) => (
                  <tr key={sector.name} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{sector.name}</td>
                    <td className="p-3">{sector.companies}</td>
                    <td className="p-3">{safeToLocaleString(sector.revenue)} FCFA</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${sector.complianceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{sector.complianceRate}%</span>
                      </div>
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
