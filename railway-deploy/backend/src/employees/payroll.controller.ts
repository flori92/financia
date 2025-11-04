import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './services/payroll.service';
import { PayrollRecord, PayrollStatus, PayrollFrequency } from './entities/payroll-record.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payroll / Paie')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Créer une nouvelle fiche de paie' })
  @ApiResponse({ status: 201, description: 'Fiche de paie créée avec succès', type: PayrollRecord })
  @ApiResponse({ status: 400, description: 'Données invalides ou doublon de période' })
  async create(
    @Body() createPayrollDto: any,
    @Request() req: any
  ): Promise<PayrollRecord> {
    return await this.payrollService.create(createPayrollDto, req.user.companyId);
  }

  @Get()
  @Roles('admin', 'hr_manager', 'accountant', 'manager', 'employee')
  @ApiOperation({ summary: 'Lister les fiches de paie' })
  @ApiResponse({ status: 200, description: 'Liste des fiches de paie' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PayrollStatus })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: PayrollStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ payrollRecords: PayrollRecord[]; total: number }> {
    // Employé ne peut voir que ses propres fiches de paie
    if (req.user.role === 'employee') {
      employeeId = req.user.employeeId;
    }

    return await this.payrollService.findAll(req.user.companyId, {
      employeeId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Get('stats')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Obtenir les statistiques de paie' })
  @ApiResponse({ status: 200, description: 'Statistiques de paie' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    const period = startDate && endDate ? { startDate, endDate } : undefined;
    return await this.payrollService.getStats(req.user.companyId, period);
  }

  @Post('calculate-batch')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Calculer la paie pour plusieurs employés' })
  @ApiResponse({ status: 201, description: 'Fiches de paie calculées avec succès' })
  async calculateBatchPayroll(
    @Body() body: {
      employeeIds: string[];
      periodStart: Date;
      periodEnd: Date;
    },
    @Request() req: any
  ): Promise<PayrollRecord[]> {
    return await this.payrollService.calculateBatchPayroll(
      body.employeeIds,
      body.periodStart,
      body.periodEnd,
      req.user.companyId
    );
  }

  @Get(':id')
  @Roles('admin', 'hr_manager', 'accountant', 'manager', 'employee')
  @ApiOperation({ summary: 'Obtenir les détails d\'une fiche de paie' })
  @ApiResponse({ status: 200, description: 'Détails de la fiche de paie', type: PayrollRecord })
  @ApiResponse({ status: 404, description: 'Fiche de paie non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la fiche de paie' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<PayrollRecord> {
    const payrollRecord = await this.payrollService.findOne(id, req.user.companyId);
    
    // Employé ne peut voir que ses propres fiches de paie
    if (req.user.role === 'employee' && payrollRecord.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return payrollRecord;
  }

  @Patch(':id')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Mettre à jour une fiche de paie' })
  @ApiResponse({ status: 200, description: 'Fiche de paie mise à jour', type: PayrollRecord })
  @ApiResponse({ status: 400, description: 'Fiche de paie ne peut plus être modifiée' })
  @ApiResponse({ status: 404, description: 'Fiche de paie non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la fiche de paie' })
  async update(
    @Param('id') id: string,
    @Body() updatePayrollDto: any,
    @Request() req: any
  ): Promise<PayrollRecord> {
    return await this.payrollService.update(id, updatePayrollDto, req.user.companyId);
  }

  @Patch(':id/approve')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Approuver une fiche de paie' })
  @ApiResponse({ status: 200, description: 'Fiche de paie approuvée avec succès' })
  @ApiResponse({ status: 400, description: 'Fiche de paie ne peut pas être approuvée' })
  @ApiParam({ name: 'id', description: 'ID de la fiche de paie' })
  async approve(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<PayrollRecord> {
    return await this.payrollService.approve(id, req.user.id, req.user.companyId);
  }

  @Patch(':id/process')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Traiter une fiche de paie (générer bulletin)' })
  @ApiResponse({ status: 200, description: 'Fiche de paie traitée avec succès' })
  @ApiResponse({ status: 400, description: 'Fiche de paie ne peut pas être traitée' })
  @ApiParam({ name: 'id', description: 'ID de la fiche de paie' })
  async process(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<PayrollRecord> {
    return await this.payrollService.process(id, req.user.id, req.user.companyId);
  }

  @Patch(':id/mark-as-paid')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Marquer une fiche de paie comme payée' })
  @ApiResponse({ status: 200, description: 'Fiche de paie marquée comme payée avec succès' })
  @ApiResponse({ status: 400, description: 'Fiche de paie ne peut pas être marquée comme payée' })
  @ApiParam({ name: 'id', description: 'ID de la fiche de paie' })
  async markAsPaid(
    @Param('id') id: string,
    @Body() body: {
      paymentMethod?: string;
      bankReference?: string;
      transactionId?: string;
    },
    @Request() req: any
  ): Promise<PayrollRecord> {
    return await this.payrollService.markAsPaid(
      id,
      req.user.companyId,
      body.paymentMethod,
      body.bankReference,
      body.transactionId
    );
  }

  @Delete(':id')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Supprimer une fiche de paie' })
  @ApiResponse({ status: 200, description: 'Fiche de paie supprimée avec succès' })
  @ApiResponse({ status: 400, description: 'Fiche de paie ne peut plus être supprimée' })
  @ApiResponse({ status: 404, description: 'Fiche de paie non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la fiche de paie' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return await this.payrollService.remove(id, req.user.companyId);
  }
}
