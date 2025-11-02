import { Injectable } from '@nestjs/common';

@Injectable()
export class GanttService {
  async generateGantt(projectId: string): Promise<any> {
    const tasks = await this.getTasks(projectId);
    return { projectId, tasks: this.calculateSchedule(tasks), criticalPath: this.findCriticalPath(tasks) };
  }

  async updateTaskDates(taskId: string, startDate: Date, endDate: Date): Promise<any> {
    const task = await this.getTask(taskId);
    const dependents = await this.getDependentTasks(taskId);
    for (const dep of dependents) {
      await this.updateTaskDates(dep.id, this.addDays(endDate, 1), this.addDays(endDate, dep.duration));
    }
    return { taskId, startDate, endDate };
  }

  private calculateSchedule(tasks: any[]): any[] {
    return tasks.map(t => ({ ...t, startDate: new Date(), endDate: this.addDays(new Date(), t.duration) }));
  }

  private findCriticalPath(tasks: any[]): string[] {
    return tasks.filter(t => t.slack === 0).map(t => t.id);
  }

  private async getTasks(projectId: string): Promise<any[]> {
    return [];
  }

  private async getTask(id: string): Promise<any> {
    return {};
  }

  private async getDependentTasks(taskId: string): Promise<any[]> {
    return [];
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 86400000);
  }
}
