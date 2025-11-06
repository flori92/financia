import { useState } from 'react';

interface ApproveLeaveData {
  approverId: string;
  comment?: string;
}

interface RejectLeaveData {
  approverId: string;
  reason: string;
  comment?: string;
}

export function useLeaveApproval() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveLeave = async (leaveId: string, companyId: string, data: ApproveLeaveData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://bms-production-d9e9.up.railway.app/api/v1/hr/leaves/${leaveId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ companyId, ...data }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'approbation');
      }

      const updatedLeave = await response.json();
      return updatedLeave;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectLeave = async (leaveId: string, companyId: string, data: RejectLeaveData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://bms-production-d9e9.up.railway.app/api/v1/hr/leaves/${leaveId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ companyId, ...data }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du rejet');
      }

      const updatedLeave = await response.json();
      return updatedLeave;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    approveLeave,
    rejectLeave,
    loading,
    error,
  };
}
