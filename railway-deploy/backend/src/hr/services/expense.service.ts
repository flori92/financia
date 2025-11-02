import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpenseService {
  async create(employeeId: string, data: any): Promise<any> {
    return { id: 'EXP-001', employeeId, ...data, status: 'draft' };
  }

  async submitExpense(id: string): Promise<any> {
    return { id, status: 'submitted' };
  }

  async approveExpense(id: string, approverId: string): Promise<any> {
    return { id, status: 'approved', approverId };
  }
}
