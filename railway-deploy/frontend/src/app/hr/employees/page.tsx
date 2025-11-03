"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    if (type === "error") {
      alert(`❌ Erreur: ${message}`);
    } else if (type === "success") {
      alert(`✅ Succès: ${message}`);
    } else {
      alert(`ℹ️ Info: ${message}`);
    }
  };

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await apiGet("/api/v1/hr/employees");
        setEmployees(data);
      } catch (error) {
        console.error("Erreur chargement employés:", error);
        // Fallback vers données mock
        const mockEmployees: Employee[] = [
          {
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@bms.com',
            position: 'Développeur Senior',
            department: 'IT',
            salary: 2500000,
            startDate: '2023-01-15',
            status: 'active'
          },
          {
            id: '2',
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@bms.com',
            position: 'Comptable',
            department: 'Finance',
            salary: 1800000,
            startDate: '2023-03-10',
            status: 'active'
          },
          {
            id: '3',
            firstName: 'Pierre',
            lastName: 'Durand',
            email: 'pierre.durand@bms.com',
            position: 'Chef de Projet',
            department: 'IT',
            salary: 3200000,
            startDate: '2022-11-20',
            status: 'active'
          }
        ];
        setEmployees(mockEmployees);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleCreateEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      firstName: 'Nouveau',
      lastName: 'Employé',
      email: `nouveau.employe${employees.length + 1}@bms.com`,
      position: 'À définir',
      department: 'À définir',
      salary: 1500000,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setEmployees([...employees, newEmployee]);
    setShowCreateModal(false);
    triggerToast("success", `Employé "${newEmployee.firstName} ${newEmployee.lastName}" créé avec succès !`);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employés</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel employé
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {employees.map((emp) => (
              <div key={emp.id} className="flex justify-between p-3 border rounded hover:bg-gray-50">
                <div>
                  <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                  <div className="text-sm text-slate-600">{emp.position} - {emp.department}</div>
                  <div className="text-xs text-slate-500">Email: {emp.email} | Depuis: {new Date(emp.startDate).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{emp.salary.toLocaleString('fr-FR')} FCFA</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {emp.status === 'active' ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal création employé */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouvel Employé</h2>
            <p className="text-gray-600 mb-4">
              Créer un nouvel employé avec les paramètres par défaut. Vous pourrez le modifier ultérieurement.
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateEmployee}>
                Créer l'employé
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
