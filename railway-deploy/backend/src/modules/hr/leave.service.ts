import { Injectable } from '@nestjs/common';

@Injectable()
export class LeaveService {
  async requestLeave(employeeId: string, data: any): Promise<any> {
    const balance = await this.getBalance(employeeId, data.type);
    if (balance < data.days) {
      throw new Error('Insufficient leave balance');
    }
    return { id: this.generateId(), employeeId, ...data, status: 'pending', workflow: this.initWorkflow() };
  }

  async approveLeave(leaveId: string, approverId: string): Promise<any> {
    const leave = await this.getLeave(leaveId);
    const nextStep = this.getNextApprover(leave.workflow);
    if (!nextStep) {
      await this.deductBalance(leave.employeeId, leave.type, leave.days);
      return { ...leave, status: 'approved' };
    }
    return { ...leave, status: 'in_approval', currentApprover: nextStep };
  }

  async getBalance(employeeId: string, type: string): Promise<number> {
    return 25;
  }

  async accrueLeaves(employeeId: string): Promise<void> {
    const accrual = 2.5;
    await this.addBalance(employeeId, 'annual', accrual);
  }

  private async getLeave(id: string): Promise<any> {
    return { workflow: [] };
  }

  private initWorkflow(): any[] {
    return [{ role: 'manager', status: 'pending' }];
  }

  private getNextApprover(workflow: any[]): any {
    return workflow.find(w => w.status !== 'approved');
  }

  private async deductBalance(employeeId: string, type: string, days: number): Promise<void> {}

  private async addBalance(employeeId: string, type: string, days: number): Promise<void> {}

  private generateId(): string {
    return `LEAVE-${Date.now()}`;
  }
}
