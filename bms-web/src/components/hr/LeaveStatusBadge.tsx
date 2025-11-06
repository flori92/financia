import { LeaveStatus } from '@/types/leave';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function LeaveStatusBadge({ status, className = '' }: LeaveStatusBadgeProps) {
  const config = {
    [LeaveStatus.DRAFT]: {
      label: 'Brouillon',
      className: 'bg-gray-100 text-gray-700',
    },
    [LeaveStatus.PENDING]: {
      label: 'En attente',
      className: 'bg-amber-100 text-amber-700',
    },
    [LeaveStatus.APPROVED]: {
      label: 'Approuvé',
      className: 'bg-green-100 text-green-700',
    },
    [LeaveStatus.REJECTED]: {
      label: 'Rejeté',
      className: 'bg-red-100 text-red-700',
    },
    [LeaveStatus.CANCELLED]: {
      label: 'Annulé',
      className: 'bg-gray-100 text-gray-500',
    },
  };

  const { label, className: statusClass } = config[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass} ${className}`}>
      {label}
    </span>
  );
}
