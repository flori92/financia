export enum LeaveStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  PARENTAL = 'parental',
}

export interface LeaveApproval {
  id: string;
  stepOrder: number;
  role: string;
  approverId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comment?: string;
  decidedAt?: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  status: LeaveStatus;
  approvals: LeaveApproval[];
  currentStep: number;
  currentApproverId?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  annual: {
    total: number;
    taken: number;
    remaining: number;
  };
  sick: {
    total: number;
    taken: number;
    remaining: number;
  };
}
