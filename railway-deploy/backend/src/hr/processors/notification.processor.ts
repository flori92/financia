import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('hr-notifications')
export class HRNotificationProcessor {
  @Process('leave-reminder')
  async handleLeaveReminder(job: Job) {
    // À implémenter
  }

  @Process('timesheet-reminder')
  async handleTimesheetReminder(job: Job) {
    // À implémenter
  }
}
