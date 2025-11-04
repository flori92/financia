import { Injectable } from '@nestjs/common';

@Injectable()
export class TimesheetService {
  async logTime(employeeId: string, data: any): Promise<any> {
    return { id: this.generateId(), employeeId, ...data, loggedAt: new Date() };
  }

  async getTimesheet(employeeId: string, period: any): Promise<any> {
    const entries = await this.getEntries(employeeId, period);
    const byProject = this.groupBy(entries, 'projectId');
    return { employeeId, period, entries, byProject, total: this.sum(entries) };
  }

  async submitTimesheet(employeeId: string, period: any): Promise<any> {
    return { employeeId, period, status: 'submitted', submittedAt: new Date() };
  }

  async approveTimesheet(timesheetId: string, approverId: string): Promise<any> {
    return { timesheetId, status: 'approved', approvedBy: approverId };
  }

  async billableHours(projectId: string, period: any): Promise<number> {
    const entries = await this.getProjectEntries(projectId, period);
    return entries.filter(e => e.billable).reduce((s, e) => s + e.hours, 0);
  }

  private async getEntries(employeeId: string, period: any): Promise<any[]> {
    return [];
  }

  private async getProjectEntries(projectId: string, period: any): Promise<any[]> {
    return [];
  }

  private groupBy(items: any[], key: string): any {
    return items.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});
  }

  private sum(entries: any[]): number {
    return entries.reduce((s, e) => s + e.hours, 0);
  }

  private generateId(): string {
    return `TIME-${Date.now()}`;
  }
}
