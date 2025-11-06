import { useState, useEffect } from 'react';
import { LeaveBalance } from '@/types/leave';

export function useLeaveBalance(companyId: string, employeeId: string) {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, [companyId, employeeId]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(
        `${apiUrl}/api/v1/hr/leaves/balance?companyId=${companyId}&employeeId=${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur lors du chargement du solde');

      const data = await response.json();
      setBalance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return { balance, loading, error, refetch: fetchBalance };
}
