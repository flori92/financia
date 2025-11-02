import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('payroll')
export class PayrollProcessor {
  @Process('calculate-payroll')
  async handleCalculatePayroll(job: Job) {
    // À implémenter
  }
}
