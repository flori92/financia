import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('leave-requests')
export class LeaveProcessor {
  @Process('process-leave-request')
  async handleLeaveRequest(job: Job) {
    // À implémenter
  }
}
