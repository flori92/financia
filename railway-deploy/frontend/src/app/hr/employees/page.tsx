"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/hr/employees")
      .then(setEmployees)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employés</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Nouvel employé</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {employees.map((emp: any) => (
              <div key={emp.id} className="flex justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                  <div className="text-sm text-slate-600">{emp.position} - {emp.department}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{safeToLocaleString(emp.salary)} FCFA</div>
                  <div className="text-sm text-slate-600">{emp.email}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
