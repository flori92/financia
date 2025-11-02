import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { ExpenseService } from './expense.service';
import { RecruitmentService } from './recruitment.service';

@ApiTags('HR')
@Controller('hr')
export class HRController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly leaveService: LeaveService,
    private readonly expenseService: ExpenseService,
    private readonly recruitmentService: RecruitmentService,
  ) {}

  @Post('payroll/calculate')
  @ApiOperation({ summary: 'Calculer la paie' })
  async calculatePayroll(@Body() data: any) {
    return this.payrollService.calculatePayroll(data.employeeId, data.period);
  }

  @Post('payroll/:id/payslip')
  @ApiOperation({ summary: 'Générer une fiche de paie' })
  async generatePayslip(@Param('id') id: string) {
    return this.payrollService.generatePayslip(id);
  }

  @Post('leaves')
  @ApiOperation({ summary: 'Demander un congé' })
  async requestLeave(@Body() data: any) {
    return this.leaveService.requestLeave(data.employeeId, data);
  }

  @Get('leaves')
  @ApiOperation({ summary: 'Liste des congés' })
  async getLeaves(@Query('employeeId') employeeId: string) {
    return [];
  }

  @Post('leaves/:id/approve')
  @ApiOperation({ summary: 'Approuver un congé' })
  async approveLeave(@Param('id') id: string, @Body() data: any) {
    return this.leaveService.approveLeave(id, data.approverId);
  }

  @Get('leaves/:employeeId/balance')
  @ApiOperation({ summary: 'Solde de congés' })
  async getLeaveBalance(@Param('employeeId') employeeId: string, @Query('type') type: string) {
    return this.leaveService.getBalance(employeeId, type);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Créer une note de frais' })
  async createExpense(@Body() data: any) {
    return this.expenseService.createExpense(data.employeeId, data);
  }

  @Post('expenses/:id/submit')
  @ApiOperation({ summary: 'Soumettre une note de frais' })
  async submitExpense(@Param('id') id: string) {
    return this.expenseService.submitExpense(id);
  }

  @Post('expenses/:id/approve')
  @ApiOperation({ summary: 'Approuver une note de frais' })
  async approveExpense(@Param('id') id: string, @Body() data: any) {
    return this.expenseService.approveExpense(id, data.approverId);
  }

  @Post('recruitment/jobs')
  @ApiOperation({ summary: 'Créer une offre d\'emploi' })
  async createJob(@Body() data: any) {
    return this.recruitmentService.createJobPosting(data);
  }

  @Post('recruitment/jobs/:id/publish')
  @ApiOperation({ summary: 'Publier une offre' })
  async publishJob(@Param('id') id: string, @Body() data: any) {
    return this.recruitmentService.publishJob(id, data.channels);
  }

  @Post('recruitment/applications')
  @ApiOperation({ summary: 'Soumettre une candidature' })
  async submitApplication(@Body() data: any) {
    return this.recruitmentService.submitApplication(data.jobId, data);
  }
}
