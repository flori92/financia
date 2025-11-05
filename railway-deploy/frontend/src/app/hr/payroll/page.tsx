"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";
import { Plus, Loader2, AlertCircle, Edit, Trash2, Calendar, DollarSign, User, FileText } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  baseSalary: number;
}

interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  workedDays: number;
  grossSalary: number;
  bonuses: number;
  deductions: number;
  socialCharges: number;
  tax: number;
  netSalary: number;
  status: 'calculated' | 'approved' | 'paid' | 'cancelled';
  createdAt: string;
}

const STATUS_COLORS = {
  calculated: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  paid: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  calculated: 'Calculé',
  approved: 'Approuvé',
  paid: 'Payé',
  cancelled: 'Annulé',
};

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form refs
  const employeeRef = useRef<HTMLSelectElement>(null);
  const periodRef = useRef<HTMLInputElement>(null);
  const workedDaysRef = useRef<HTMLInputElement>(null);
  const bonusesRef = useRef<HTMLInputElement>(null);
  const deductionsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      const [payrollsData, employeesData] = await Promise.all([
        apiGet("/api/v1/hr/payroll", { companyId }),
        apiGet("/api/v1/hr/employees", { companyId }),
      ]);

      setPayrolls(payrollsData);
      setEmployees(employeesData);
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }

      const selectedEmployee = employees.find(emp => emp.id === employeeRef.current?.value);

      const formData = {
        companyId,
        employeeId: employeeRef.current?.value || "",
        period: periodRef.current?.value || "",
        workedDays: parseInt(workedDaysRef.current?.value || "22"),
        bonuses: parseFloat(bonusesRef.current?.value || "0"),
        deductions: parseFloat(deductionsRef.current?.value || "0"),
      };

      if (!formData.employeeId || !formData.period) {
        triggerToast("error", "Employé et période requis");
        return;
      }

      if (editingPayroll) {
        await apiPut(`/api/v1/hr/payroll/${editingPayroll.id}`, formData);
        triggerToast("success", "Paie modifiée !");
      } else {
        await apiPost("/api/v1/hr/payroll/calculate", formData);
        triggerToast("success", "Paie calculée !");
      }

      await loadData();
      closeForm();
    } catch (err: any) {
      triggerToast("error", err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    setShowForm(true);
  };

  const handleDelete = async (payrollId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette paie ?")) {
      return;
    }

    try {
      await apiDelete(`/api/v1/hr/payroll/${payrollId}`);
      triggerToast("success", "Paie supprimée");
      await loadData();
    } catch (err: any) {
      triggerToast("error", "Erreur lors de la suppression");
    }
  };

  const handleGeneratePayslip = async (payrollId: string) => {
    try {
      await apiPost(`/api/v1/hr/payroll/${payrollId}/payslip`, {});
      triggerToast("success", "Fiche de paie générée !");
    } catch (err: any) {
      triggerToast("error", "Erreur lors de la génération");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPayroll(null);
  };

  const getCurrentPeriod = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Erreur</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paie</h1>
          <p className="text-gray-600 mt-1">Gestion de la paie des employés</p>
        </div>
        <button
          onClick={() => {
            setEditingPayroll(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
        >
          <Plus className="w-4 h-4" />
          Calculer une paie
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingPayroll ? "Modifier la paie" : "Calculer une nouvelle paie"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employé *</label>
                <select
                  ref={employeeRef}
                  defaultValue={editingPayroll?.employeeId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  required
                  disabled={saving || !!editingPayroll}
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Période *</label>
                <input
                  ref={periodRef}
                  type="month"
                  defaultValue={editingPayroll?.period || getCurrentPeriod()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jours travaillés *</label>
                <input
                  ref={workedDaysRef}
                  type="number"
                  min="0"
                  max="31"
                  defaultValue={editingPayroll?.workedDays || 22}
                  placeholder="22"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Primes (FCFA)</label>
                <input
                  ref={bonusesRef}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingPayroll?.bonuses || 0}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Retenues (FCFA)</label>
                <input
                  ref={deductionsRef}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingPayroll?.deductions || 0}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:opacity-50"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Calcul..." : editingPayroll ? "Modifier" : "Calculer"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Charges</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net à Payer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune paie trouvée. Calculez votre première paie.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-semibold">
                          {payroll.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{payroll.employeeName}</div>
                          <div className="text-sm text-gray-600">{payroll.workedDays} jours</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(payroll.period + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat('fr-FR').format(payroll.grossSalary)} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-600">
                        {new Intl.NumberFormat('fr-FR').format(payroll.socialCharges + payroll.tax)} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-[#0D9488]">
                          {new Intl.NumberFormat('fr-FR').format(payroll.netSalary)} FCFA
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[payroll.status]}`}>
                        {STATUS_LABELS[payroll.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGeneratePayslip(payroll.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Générer fiche de paie"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                        </button>
                        {payroll.status === 'calculated' && (
                          <>
                            <button
                              onClick={() => handleEdit(payroll)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(payroll.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
