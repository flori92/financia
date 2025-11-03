"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayrolls = async () => {
      try {
        const companyId = getCompanyId();
        const data = await apiGet("/api/v1/hr/payroll", { companyId });
        setPayrolls(data);
      } catch (error) {
        console.error("Erreur chargement paies:", error);
        // Fallback vers données mock
        const mockPayrolls = [
          {
            id: '1',
            employee: 'Jean Dupont',
            month: 'Novembre 2025',
            salary: 500000,
            bonuses: 50000,
            deductions: 25000,
            net: 525000
          }
        ];
        setPayrolls(mockPayrolls);
      } finally {
        setLoading(false);
      }
    };
    
    loadPayrolls();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Paie</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Calculer la paie</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historique des paies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {payrolls.map((p: any) => (
              <div key={p.id} className="flex justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Employé #{p.employeeId}</div>
                  <div className="text-sm text-slate-600">{p.month}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{p.netSalary.toLocaleString('fr-FR')} FCFA</div>
                  <div className="text-sm text-slate-600">Brut: {p.grossSalary.toLocaleString('fr-FR')}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
