import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollService } from './payroll.service';
import { LeaveService } from './leave.service';
import { ExpenseService } from './expense.service';
import { RecruitmentService } from './recruitment.service';
import { Employee } from './entities/employee.entity';
import { HrCertificateService } from './hr-certificate.service';
import { HrCertificateStatus, HrCertificateType } from './entities/hr-certificate.entity';
import { HrLeaveStatus, HrLeaveType } from './entities/hr-leave.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { SubmitLeaveDto } from './dto/submit-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { CancelLeaveDto } from './dto/cancel-leave.dto';
import { Response } from 'express';

interface CreateCertificateRequestDto {
  companyId: string;
  employeeId: string;
  type: HrCertificateType;
  purpose?: string;
  notes?: string;
}

interface GeneratePayslipRequestDto {
  companyId: string;
  issuedBy?: string;
}

interface GenerateCertificateRequestDto {
  companyId: string;
  issuedBy?: string;
}

interface DeliverCertificateRequestDto {
  companyId: string;
}

interface LeaveListQuery {
  companyId: string;
  status?: HrLeaveStatus;
  employeeId?: string;
  type?: HrLeaveType;
  startDate?: string;
  endDate?: string;
}

interface AccrualRequestBody {
  months?: number;
}

@ApiTags('HR')
@Controller('hr')
export class HRController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly leaveService: LeaveService,
    private readonly expenseService: ExpenseService,
    private readonly recruitmentService: RecruitmentService,
    private readonly hrCertificateService: HrCertificateService,
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
  async generatePayslip(
    @Param('id') id: string,
    @Body() payload: GeneratePayslipRequestDto,
  ) {
    const { companyId, issuedBy } = payload;
    return this.payrollService.generatePayslip(id, companyId, { issuedBy });
  }

  @Get('certificates')
  @ApiOperation({ summary: 'Lister les attestations employeur' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'generated', 'delivered'] })
  async listCertificates(
    @Query('companyId') companyId: string,
    @Query('status') status?: HrCertificateStatus,
  ) {
    return this.hrCertificateService.listCertificates(companyId, status);
  }

  @Post('certificates')
  @ApiOperation({ summary: 'Créer une demande d’attestation' })
  async createCertificateRequest(@Body() payload: CreateCertificateRequestDto) {
    return this.hrCertificateService.createRequest(payload);
  }

  @Get('certificates/:id')
  @ApiOperation({ summary: 'Consulter une attestation' })
  async getCertificate(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.hrCertificateService.getCertificate(id, companyId);
  }

  @Post('certificates/:id/generate')
  @ApiOperation({ summary: 'Générer le PDF d’une attestation' })
  async generateCertificate(
    @Param('id') id: string,
    @Body() payload: GenerateCertificateRequestDto,
  ) {
    const { companyId, issuedBy } = payload;
    return this.hrCertificateService.generateCertificate(id, companyId, { issuedBy });
  }

  @Post('certificates/:id/deliver')
  @ApiOperation({ summary: 'Marquer une attestation comme délivrée' })
  async markCertificateDelivered(
    @Param('id') id: string,
    @Body() payload: DeliverCertificateRequestDto,
  ) {
    return this.hrCertificateService.markDelivered(id, payload.companyId);
  }

  @Get('certificates/:id/download')
  @ApiOperation({ summary: 'Télécharger le PDF d’une attestation' })
  @ApiQuery({ name: 'companyId', required: true })
  async downloadCertificate(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Res() res: Response,
  ) {
    const file = await this.hrCertificateService.downloadCertificate(id, companyId);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
      'Content-Length': file.buffer.length.toString(),
    });
    return res.send(file.buffer);
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
  @ApiOperation({ summary: 'Créer une demande de congé' })
  async createLeave(@Body() payload: CreateLeaveRequestDto) {
    return this.leaveService.createLeave(payload);
  }

  @Put('leaves/:id')
  @ApiOperation({ summary: 'Mettre à jour une demande de congé' })
  async updateLeave(@Param('id') id: string, @Body() payload: UpdateLeaveRequestDto) {
    return this.leaveService.updateLeave(id, payload.companyId, payload);
  }

  @Get('leaves')
  @ApiOperation({ summary: 'Lister les demandes de congés' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(HrLeaveStatus) })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: Object.values(HrLeaveType) })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async listLeaves(@Query() query: LeaveListQuery) {
    const { companyId, ...filters } = query;
    return this.leaveService.listLeaves(companyId, filters);
  }

  @Get('leaves/:id')
  @ApiOperation({ summary: 'Consulter une demande de congé' })
  @ApiQuery({ name: 'companyId', required: true })
  async getLeave(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.leaveService.getLeaveById(id, companyId);
  }

  @Post('leaves/:id/submit')
  @ApiOperation({ summary: 'Soumettre une demande de congé' })
  @ApiQuery({ name: 'companyId', required: true })
  async submitLeave(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() payload: SubmitLeaveDto,
  ) {
    return this.leaveService.submitLeave(id, companyId, payload);
  }

  @Post('leaves/:id/approve')
  @ApiOperation({ summary: 'Approuver une demande de congé' })
  @ApiQuery({ name: 'companyId', required: true })
  async approveLeave(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() payload: ApproveLeaveDto,
  ) {
    return this.leaveService.approveLeave(id, companyId, payload);
  }

  @Post('leaves/:id/reject')
  @ApiOperation({ summary: 'Rejeter une demande de congé' })
  @ApiQuery({ name: 'companyId', required: true })
  async rejectLeave(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() payload: RejectLeaveDto,
  ) {
    return this.leaveService.rejectLeave(id, companyId, payload);
  }

  @Post('leaves/:id/cancel')
  @ApiOperation({ summary: 'Annuler une demande de congé' })
  @ApiQuery({ name: 'companyId', required: true })
  async cancelLeave(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() payload: CancelLeaveDto,
  ) {
    return this.leaveService.cancelLeave(id, companyId, payload);
  }

  @Get('leaves/:employeeId/balance')
  @ApiOperation({ summary: 'Consulter le solde de congés' })
  @ApiQuery({ name: 'companyId', required: true })
  async getLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Query('companyId') companyId: string,
  ) {
    return this.leaveService.getBalance(companyId, employeeId);
  }

  @Post('leaves/:employeeId/accrual')
  @ApiOperation({ summary: 'Accumuler des congés' })
  @ApiQuery({ name: 'companyId', required: true })
  async accrueLeaves(
    @Param('employeeId') employeeId: string,
    @Query('companyId') companyId: string,
    @Body() body: AccrualRequestBody,
  ) {
    return this.leaveService.accrueLeaves(companyId, employeeId, body?.months ?? 1);
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
