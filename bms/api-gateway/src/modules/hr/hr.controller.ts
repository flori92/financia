import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { ExpenseService } from './expense.service';
import { RecruitmentService } from './recruitment.service';
import { Employee } from './entities/employee.entity';

@ApiTags('HR')
@Controller('hr')
export class HRController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly leaveService: LeaveService,
    private readonly expenseService: ExpenseService,
    private readonly recruitmentService: RecruitmentService,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  @Get('payroll')
  @ApiOperation({ summary: 'Lister les paies' })
  async getPayrolls(@Query('companyId') companyId: string) {
    return this.payrollService.getPayrolls(companyId);
  }

  @Get('payroll/:id')
  @ApiOperation({ summary: 'Récupérer une paie par ID' })
  async getPayroll(@Param('id') id: string) {
    return this.payrollService.getPayroll(id);
  }

  @Post('payroll/calculate')
  @ApiOperation({ summary: 'Calculer la paie' })
  async calculatePayroll(@Body() data: any) {
    return this.payrollService.calculatePayroll(
      data.companyId,
      data.employeeId,
      data.period,
      data.workedDays || 22,
      data.bonuses || 0,
      data.deductions || 0,
    );
  }

  @Put('payroll/:id')
  @ApiOperation({ summary: 'Mettre à jour une paie' })
  async updatePayroll(@Param('id') id: string, @Body() data: any) {
    return this.payrollService.updatePayroll(id, data);
  }

  @Delete('payroll/:id')
  @ApiOperation({ summary: 'Supprimer une paie' })
  async deletePayroll(@Param('id') id: string) {
    return this.payrollService.deletePayroll(id);
  }

  @Post('payroll/:id/payslip')
  @ApiOperation({ summary: 'Générer une fiche de paie' })
  async generatePayslip(@Param('id') id: string) {
    return this.payrollService.generatePayslip(id);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Lister les employés' })
  async getEmployees(@Query('companyId') companyId: string) {
    return this.employeeRepo.find({
      where: { companyId, status: 'active' },
      order: { firstName: 'ASC' },
    });
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Récupérer un employé par ID' })
  async getEmployee(@Param('id') id: string) {
    return this.employeeRepo.findOne({ where: { id } });
  }

  @Post('employees')
  @ApiOperation({ summary: 'Créer un employé' })
  async createEmployee(@Body() data: any) {
    const employee = this.employeeRepo.create(data);
    return this.employeeRepo.save(employee);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'Mettre à jour un employé' })
  async updateEmployee(@Param('id') id: string, @Body() data: any) {
    await this.employeeRepo.update(id, data);
    return this.employeeRepo.findOne({ where: { id } });
  }

  @Delete('employees/:id')
  @ApiOperation({ summary: 'Supprimer un employé' })
  async deleteEmployee(@Param('id') id: string) {
    await this.employeeRepo.delete(id);
    return { success: true, message: 'Employé supprimé' };
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
