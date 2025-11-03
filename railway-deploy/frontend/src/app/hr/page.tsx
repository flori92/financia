"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Calendar, FileText, Clock, UserCheck, TrendingUp, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

interface HRData {
  totalEmployees: number;
  activeEmployees: number;
  newEmployees: number;
  monthlyPayroll: number;
  pendingLeaveRequests: number;
  openPositions: number;
  employeeSatisfaction: number;
  turnoverRate: number;
}

export default function HRPage() {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = async () => {
    try {
      // Charger les données RH depuis l'API
      const companyId = getCompanyId();
      const response = await apiGet('/api/v1/hr/dashboard', { companyId });
      setData(response);
    } catch (error) {
      console.error("Erreur chargement données RH:", error);
      // Fallback vers données mock si API indisponible
      const mockData: HRData = {
        totalEmployees: 45,
        activeEmployees: 42,
        newEmployees: 3,
        monthlyPayroll: 12500000,
        pendingLeaveRequests: 8,
        openPositions: 5,
        employeeSatisfaction: 4.2,
        turnoverRate: 8.5
      };
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ressources Humaines</h1>
          <p className="text-gray-600">Gestion des employés et administration du personnel</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Employé
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalEmployees}</div>
            <p className="text-xs text-blue-600">+{data?.newEmployees} ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Masse Salariale</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.monthlyPayroll?.toLocaleString()} FCFA</div>
            <p className="text-xs text-green-600">Mensuelle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Congés en Attente</CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pendingLeaveRequests}</div>
            <p className="text-xs text-orange-600">À valider</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Postes Ouverts</CardTitle>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.openPositions}</div>
            <p className="text-xs text-purple-600">Recrutement</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/hr/employees" className="card p-6 hover:shadow-lg transition-shadow">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold mb-2">Employés</h3>
          <p className="text-sm text-slate-600">Gestion des employés et contrats</p>
        </Link>
        <Link href="/hr/payroll" className="card p-6 hover:shadow-lg transition-shadow">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <h3 className="font-semibold mb-2">Paie</h3>
          <p className="text-sm text-slate-600">Calcul et génération des fiches de paie</p>
        </Link>
        <Link href="/hr/leaves" className="card p-6 hover:shadow-lg transition-shadow">
          <Calendar className="w-8 h-8 text-amber-600 mb-2" />
          <h3 className="font-semibold mb-2">Congés & Absences</h3>
          <p className="text-sm text-slate-600">Gestion des demandes de congés</p>
        </Link>
        <Link href="/hr/timesheets" className="card p-6 hover:shadow-lg transition-shadow">
          <Clock className="w-8 h-8 text-indigo-600 mb-2" />
          <h3 className="font-semibold mb-2">CRA & Temps</h3>
          <p className="text-sm text-slate-600">Comptes rendus et feuilles de temps</p>
        </Link>
        <Link href="/hr/expenses" className="card p-6 hover:shadow-lg transition-shadow">
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold mb-2">Notes de Frais</h3>
          <p className="text-sm text-slate-600">Validation et remboursement</p>
        </Link>
      </div>
    </div>
  );
}
