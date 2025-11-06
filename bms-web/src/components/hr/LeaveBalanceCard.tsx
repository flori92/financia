import { LeaveBalance } from '@/types/leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  loading?: boolean;
}

export function LeaveBalanceCard({ balance, loading }: LeaveBalanceCardProps) {
  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Congés Annuels */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Congés Annuels</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-semibold">{balance.annual.total} jours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pris</span>
            <span className="text-lg font-semibold text-orange-600">
              {balance.annual.taken} jours
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm font-medium text-gray-900">Restant</span>
            <span className="text-2xl font-bold text-green-600">
              {balance.annual.remaining} jours
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${(balance.annual.remaining / balance.annual.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Congés Maladie */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Congés Maladie</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-semibold">{balance.sick.total} jours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pris</span>
            <span className="text-lg font-semibold text-orange-600">
              {balance.sick.taken} jours
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm font-medium text-gray-900">Restant</span>
            <span className="text-2xl font-bold text-blue-600">
              {balance.sick.remaining} jours
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(balance.sick.remaining / balance.sick.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
