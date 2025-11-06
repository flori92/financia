'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { useLeaves } from '@/hooks/useLeaves';
import { useLeaveBalance } from '@/hooks/useLeaveBalance';
import { LeaveRequestCard } from '@/components/hr/LeaveRequestCard';
import { LeaveBalanceCard } from '@/components/hr/LeaveBalanceCard';
import { LeaveFilters } from '@/components/hr/LeaveFilters';
import { LeaveStatus, LeaveType } from '@/types/leave';

const COMPANY_ID = 'e611a153-8dd5-41dd-bb8e-9434766a0dfd';
const EMPLOYEE_ID = 'current-user-id'; // TODO: Get from auth context

export default function LeavesPage() {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<LeaveType | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const { leaves, loading, error } = useLeaves({
    companyId: COMPANY_ID,
    status: statusFilter,
    type: typeFilter,
  });

  const { balance, loading: balanceLoading } = useLeaveBalance(COMPANY_ID, EMPLOYEE_ID);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Congés & Absences</h1>
          <p className="text-gray-600 mt-1">Gérez vos demandes de congés</p>
        </div>
        <Link
          href="/hr/leaves/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle demande
        </Link>
      </div>

      {/* Balance Cards */}
      {balance && <LeaveBalanceCard balance={balance} loading={balanceLoading} />}

      {/* Filters */}
      <div className="card p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtres</span>
        </button>

        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <LeaveFilters
              status={statusFilter}
              type={typeFilter}
              onStatusChange={setStatusFilter}
              onTypeChange={setTypeFilter}
            />
          </div>
        )}
      </div>

      {/* Leaves List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Mes demandes ({leaves.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 mb-4">Aucune demande de congé</p>
            <Link href="/hr/leaves/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer une demande
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaves.map((leave) => (
              <LeaveRequestCard key={leave.id} leave={leave} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
