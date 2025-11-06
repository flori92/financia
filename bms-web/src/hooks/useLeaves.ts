import { useState, useEffect } from 'react';
import { Leave, LeaveStatus, LeaveType } from '@/types/leave';

interface UseLeavesOptions {
  companyId: string;
  status?: LeaveStatus;
  employeeId?: string;
  type?: LeaveType;
}

export function useLeaves(options: UseLeavesOptions) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, [options.companyId, options.status, options.employeeId, options.type]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        companyId: options.companyId,
        ...(options.status && { status: options.status }),
        ...(options.employeeId && { employeeId: options.employeeId }),
        ...(options.type && { type: options.type }),
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/v1/hr/leaves?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des demandes');

      const data = await response.json();
      setLeaves(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createLeave = async (data: Partial<Leave>) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/v1/hr/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      const newLeave = await response.json();
      setLeaves((prev) => [newLeave, ...prev]);
      return newLeave;
    } catch (err) {
      throw err;
    }
  };

  const submitLeave = async (leaveId: string, notes?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/v1/hr/leaves/${leaveId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error('Erreur lors de la soumission');

      const updatedLeave = await response.json();
      setLeaves((prev) => prev.map((l) => (l.id === leaveId ? updatedLeave : l)));
      return updatedLeave;
    } catch (err) {
      throw err;
    }
  };

  return {
    leaves,
    loading,
    error,
    createLeave,
    submitLeave,
    refetch: fetchLeaves,
  };
}
