'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { LeaveStatusBadge } from '@/components/hr/LeaveStatusBadge';
import { LeaveApprovalFlow } from '@/components/hr/LeaveApprovalFlow';
import { Leave, LeaveType } from '@/types/leave';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COMPANY_ID = 'e611a153-8dd5-41dd-bb8e-9434766a0dfd';

const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Congés annuels',
  [LeaveType.SICK]: 'Congé maladie',
  [LeaveType.UNPAID]: 'Congé sans solde',
  [LeaveType.MATERNITY]: 'Congé maternité',
  [LeaveType.PATERNITY]: 'Congé paternité',
  [LeaveType.PARENTAL]: 'Congé parental',
};

export default function LeaveDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLeave();
  }, [params.id]);

  const fetchLeave = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://bms-production-d9e9.up.railway.app/api/v1/hr/leaves/${params.id}?companyId=${COMPANY_ID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Demande introuvable');

      const data = await response.json();
      setLeave(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!leave) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `https://bms-production-d9e9.up.railway.app/api/v1/hr/leaves/${leave.id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ companyId: COMPANY_ID }),
        }
      );

      if (!response.ok) throw new Error('Erreur lors de la soumission');

      await fetchLeave();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!leave || !confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `https://bms-production-d9e9.up.railway.app/api/v1/hr/leaves/${leave.id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            companyId: COMPANY_ID,
            cancelledBy: 'current-user-id',
            reason: 'Annulé par l\'utilisateur',
          }),
        }
      );

      if (!response.ok) throw new Error('Erreur lors de l\'annulation');

      router.push('/hr/leaves');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <p className="text-red-600 mb-4">{error || 'Demande introuvable'}</p>
          <Link href="/hr/leaves" className="btn-primary">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(leave.startDate);
  const endDate = new Date(leave.endDate);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hr/leaves" className="btn-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Détails de la demande</h1>
            <p className="text-gray-600 mt-1">Référence: {leave.id.slice(0, 8)}</p>
          </div>
        </div>
        <LeaveStatusBadge status={leave.status} />
      </div>

      {/* Main Info */}
      <div className="card p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {leave.employee.firstName} {leave.employee.lastName}
            </h2>
            <p className="text-gray-600">{leave.employee.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Type de congé</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {leaveTypeLabels[leave.type]}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>Durée</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {leave.daysCount} jour{leave.daysCount > 1 ? 's' : ''}
            </p>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Date de début</div>
            <p className="text-lg font-semibold text-gray-900">
              {format(startDate, 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Date de fin</div>
            <p className="text-lg font-semibold text-gray-900">
              {format(endDate, 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>

        {leave.reason && (
          <div className="pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Motif</h3>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{leave.reason}</p>
          </div>
        )}
      </div>

      {/* Approval Flow */}
      {leave.approvals && leave.approvals.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Workflow d'approbation
          </h3>
          <LeaveApprovalFlow approvals={leave.approvals} currentStep={leave.currentStep} />
        </div>
      )}

      {/* Actions */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Créé le {format(new Date(leave.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </div>
          <div className="flex items-center gap-3">
            {leave.status === 'draft' && (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={actionLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Soumettre
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer
                </button>
              </>
            )}
            {leave.status === 'pending' && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
