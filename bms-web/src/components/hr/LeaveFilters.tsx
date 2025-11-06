import { LeaveStatus, LeaveType } from '@/types/leave';

interface LeaveFiltersProps {
  status?: LeaveStatus;
  type?: LeaveType;
  onStatusChange: (status?: LeaveStatus) => void;
  onTypeChange: (type?: LeaveType) => void;
}

export function LeaveFilters({ status, type, onStatusChange, onTypeChange }: LeaveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
        <select
          value={status || ''}
          onChange={(e) => onStatusChange(e.target.value as LeaveStatus || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les statuts</option>
          <option value={LeaveStatus.DRAFT}>Brouillon</option>
          <option value={LeaveStatus.PENDING}>En attente</option>
          <option value={LeaveStatus.APPROVED}>Approuvé</option>
          <option value={LeaveStatus.REJECTED}>Rejeté</option>
          <option value={LeaveStatus.CANCELLED}>Annulé</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type || ''}
          onChange={(e) => onTypeChange(e.target.value as LeaveType || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les types</option>
          <option value={LeaveType.ANNUAL}>Congés annuels</option>
          <option value={LeaveType.SICK}>Congé maladie</option>
          <option value={LeaveType.UNPAID}>Congé sans solde</option>
          <option value={LeaveType.MATERNITY}>Congé maternité</option>
          <option value={LeaveType.PATERNITY}>Congé paternité</option>
          <option value={LeaveType.PARENTAL}>Congé parental</option>
        </select>
      </div>
    </div>
  );
}
