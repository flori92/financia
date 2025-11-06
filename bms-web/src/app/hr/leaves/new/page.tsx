'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useLeaves } from '@/hooks/useLeaves';
import { useLeaveBalance } from '@/hooks/useLeaveBalance';
import { LeaveBalanceCard } from '@/components/hr/LeaveBalanceCard';
import { LeaveType } from '@/types/leave';

const COMPANY_ID = 'e611a153-8dd5-41dd-bb8e-9434766a0dfd';
const EMPLOYEE_ID = 'current-user-id';

export default function NewLeavePage() {
  const router = useRouter();
  const { createLeave, submitLeave } = useLeaves({ companyId: COMPANY_ID });
  const { balance, loading: balanceLoading } = useLeaveBalance(COMPANY_ID, EMPLOYEE_ID);

  const [formData, setFormData] = useState({
    type: LeaveType.ANNUAL,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitDirect, setSubmitDirect] = useState(false);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const daysCount = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const leave = await createLeave({
        companyId: COMPANY_ID,
        employeeId: EMPLOYEE_ID,
        ...formData,
      });

      if (submitDirect) {
        await submitLeave(leave.id);
      }

      router.push('/hr/leaves');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughBalance = () => {
    if (!balance) return true;
    if (formData.type === LeaveType.ANNUAL) {
      return balance.annual.remaining >= daysCount;
    }
    if (formData.type === LeaveType.SICK) {
      return balance.sick.remaining >= daysCount;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/hr/leaves" className="btn-secondary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande de congé</h1>
          <p className="text-gray-600 mt-1">Remplissez le formulaire ci-dessous</p>
        </div>
      </div>

      {/* Balance */}
      {balance && <LeaveBalanceCard balance={balance} loading={balanceLoading} />}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de congé *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value={LeaveType.ANNUAL}>Congés annuels</option>
            <option value={LeaveType.SICK}>Congé maladie</option>
            <option value={LeaveType.UNPAID}>Congé sans solde</option>
            <option value={LeaveType.MATERNITY}>Congé maternité</option>
            <option value={LeaveType.PATERNITY}>Congé paternité</option>
            <option value={LeaveType.PARENTAL}>Congé parental</option>
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Days Count */}
        {daysCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  Durée: {daysCount} jour{daysCount > 1 ? 's' : ''}
                </span>
              </div>
              {!hasEnoughBalance() && (
                <span className="text-red-600 text-sm font-medium">
                  Solde insuffisant
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motif (optionnel)
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Expliquez brièvement la raison de votre demande..."
          />
        </div>

        {/* Submit Direct */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="submitDirect"
            checked={submitDirect}
            onChange={(e) => setSubmitDirect(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="submitDirect" className="text-sm text-gray-700">
            Soumettre directement pour approbation
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link href="/hr/leaves" className="btn-secondary">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || !hasEnoughBalance()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : submitDirect ? 'Créer et soumettre' : 'Créer en brouillon'}
          </button>
        </div>
      </form>
    </div>
  );
}
