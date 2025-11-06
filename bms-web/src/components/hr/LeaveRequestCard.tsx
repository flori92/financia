import Link from 'next/link';
import { Calendar, User, Clock } from 'lucide-react';
import { Leave, LeaveType } from '@/types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LeaveRequestCardProps {
  leave: Leave;
}

const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'Congés annuels',
  [LeaveType.SICK]: 'Congé maladie',
  [LeaveType.UNPAID]: 'Congé sans solde',
  [LeaveType.MATERNITY]: 'Congé maternité',
  [LeaveType.PATERNITY]: 'Congé paternité',
  [LeaveType.PARENTAL]: 'Congé parental',
};

export function LeaveRequestCard({ leave }: LeaveRequestCardProps) {
  const startDate = new Date(leave.startDate);
  const endDate = new Date(leave.endDate);

  return (
    <Link href={`/hr/leaves/${leave.id}`}>
      <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {leave.employee.firstName} {leave.employee.lastName}
              </h3>
              <p className="text-sm text-gray-500">{leave.employee.email}</p>
            </div>
          </div>
          <LeaveStatusBadge status={leave.status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{leaveTypeLabels[leave.type]}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Du {format(startDate, 'dd MMM yyyy', { locale: fr })} au{' '}
              {format(endDate, 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900">
              {leave.daysCount} jour{leave.daysCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {leave.reason && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 line-clamp-2">{leave.reason}</p>
          </div>
        )}

        {leave.status === 'pending' && leave.approvals && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(leave.currentStep / leave.approvals.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                Étape {leave.currentStep}/{leave.approvals.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
