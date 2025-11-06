import { LeaveApproval } from '@/types/leave';
import { Check, X, Clock, Minus } from 'lucide-react';

interface LeaveApprovalFlowProps {
  approvals: LeaveApproval[];
  currentStep: number;
}

export function LeaveApprovalFlow({ approvals, currentStep }: LeaveApprovalFlowProps) {
  const getStepIcon = (approval: LeaveApproval) => {
    switch (approval.status) {
      case 'approved':
        return <Check className="w-5 h-5 text-white" />;
      case 'rejected':
        return <X className="w-5 h-5 text-white" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-white" />;
      case 'skipped':
        return <Minus className="w-5 h-5 text-white" />;
      default:
        return <Clock className="w-5 h-5 text-white" />;
    }
  };

  const getStepColor = (approval: LeaveApproval) => {
    switch (approval.status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-amber-500';
      case 'skipped':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {approvals.map((approval, index) => (
        <div key={approval.id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full ${getStepColor(approval)} flex items-center justify-center`}>
              {getStepIcon(approval)}
            </div>
            {index < approvals.length - 1 && (
              <div className={`w-0.5 h-12 ${approval.status === 'approved' ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Étape {approval.stepOrder} - {approval.role === 'manager' ? 'Manager' : 'RH'}
                </h4>
                {approval.approverId && (
                  <p className="text-sm text-gray-500">Par: {approval.approverId}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                approval.status === 'approved' ? 'bg-green-100 text-green-700' :
                approval.status === 'rejected' ? 'bg-red-100 text-red-700' :
                approval.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {approval.status === 'approved' ? 'Approuvé' :
                 approval.status === 'rejected' ? 'Rejeté' :
                 approval.status === 'pending' ? 'En attente' :
                 'Ignoré'}
              </span>
            </div>

            {approval.comment && (
              <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {approval.comment}
              </p>
            )}

            {approval.decidedAt && (
              <p className="mt-1 text-xs text-gray-500">
                {new Date(approval.decidedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
