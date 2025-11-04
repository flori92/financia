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
import { TimesheetService } from './services/timesheet.service';
import { Timesheet, TimesheetStatus, TimesheetPeriod } from './entities/timesheet.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Timesheets / CRA')
@Controller('timesheets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post()
  @Roles('admin', 'hr_manager', 'manager', 'employee')
  @ApiOperation({ summary: 'Créer un nouveau CRA' })
  @ApiResponse({ status: 201, description: 'CRA créé avec succès', type: Timesheet })
  @ApiResponse({ status: 400, description: 'Données invalides ou doublon de période' })
  async create(
    @Body() createTimesheetDto: any,
    @Request() req: any
  ): Promise<Timesheet> {
    // Employé ne peut créer que pour lui-même
    if (req.user.role === 'employee') {
      createTimesheetDto.employeeId = req.user.employeeId;
    }

    return await this.timesheetService.create(createTimesheetDto, req.user.companyId);
  }

  @Get()
  @Roles('admin', 'hr_manager', 'accountant', 'manager', 'employee')
  @ApiOperation({ summary: 'Lister les CRA' })
  @ApiResponse({ status: 200, description: 'Liste des CRA' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: TimesheetStatus })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: TimesheetStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ timesheets: Timesheet[]; total: number }> {
    // Employé ne peut voir que ses propres CRA
    if (req.user.role === 'employee') {
      employeeId = req.user.employeeId;
    }

    return await this.timesheetService.findAll(req.user.companyId, {
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
  @ApiOperation({ summary: 'Obtenir les statistiques des CRA' })
  @ApiResponse({ status: 200, description: 'Statistiques des CRA' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    const period = startDate && endDate ? { startDate, endDate } : undefined;
    return await this.timesheetService.getStats(req.user.companyId, period);
  }

  @Get('pending-approval')
  @Roles('admin', 'hr_manager', 'manager')
  @ApiOperation({ summary: 'Lister les CRA en attente de validation' })
  @ApiResponse({ status: 200, description: 'CRA en attente de validation' })
  async findPendingApproval(@Request() req: any): Promise<Timesheet[]> {
    return await this.timesheetService.findPendingApproval(req.user.companyId);
  }

  @Get(':id')
  @Roles('admin', 'hr_manager', 'accountant', 'manager', 'employee')
  @ApiOperation({ summary: 'Obtenir les détails d\'un CRA' })
  @ApiResponse({ status: 200, description: 'Détails du CRA', type: Timesheet })
  @ApiResponse({ status: 404, description: 'CRA non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<Timesheet> {
    const timesheet = await this.timesheetService.findOne(id, req.user.companyId);
    
    // Employé ne peut voir que ses propres CRA
    if (req.user.role === 'employee' && timesheet.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return timesheet;
  }

  @Patch(':id')
  @Roles('admin', 'hr_manager', 'manager', 'employee')
  @ApiOperation({ summary: 'Mettre à jour un CRA' })
  @ApiResponse({ status: 200, description: 'CRA mis à jour', type: Timesheet })
  @ApiResponse({ status: 400, description: 'CRA ne peut plus être modifié' })
  @ApiResponse({ status: 404, description: 'CRA non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async update(
    @Param('id') id: string,
    @Body() updateTimesheetDto: any,
    @Request() req: any
  ): Promise<Timesheet> {
    const timesheet = await this.timesheetService.findOne(id, req.user.companyId);
    
    // Employé ne peut modifier que ses propres CRA
    if (req.user.role === 'employee' && timesheet.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.timesheetService.update(id, updateTimesheetDto, req.user.companyId);
  }

  @Patch(':id/submit')
  @Roles('admin', 'hr_manager', 'manager', 'employee')
  @ApiOperation({ summary: 'Soumettre un CRA pour validation' })
  @ApiResponse({ status: 200, description: 'CRA soumis avec succès' })
  @ApiResponse({ status: 400, description: 'CRA ne peut plus être soumis' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async submit(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req: any
  ): Promise<Timesheet> {
    const timesheet = await this.timesheetService.findOne(id, req.user.companyId);
    
    // Employé ne peut soumettre que ses propres CRA
    if (req.user.role === 'employee' && timesheet.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.timesheetService.submit(id, req.user.id, req.user.companyId, body.comment);
  }

  @Patch(':id/approve')
  @Roles('admin', 'hr_manager', 'manager')
  @ApiOperation({ summary: 'Approuver un CRA' })
  @ApiResponse({ status: 200, description: 'CRA approuvé avec succès' })
  @ApiResponse({ status: 400, description: 'CRA ne peut pas être approuvé' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async approve(
    @Param('id') id: string,
    @Body() body: { managerComment?: string },
    @Request() req: any
  ): Promise<Timesheet> {
    return await this.timesheetService.approve(id, req.user.id, req.user.companyId, body.managerComment);
  }

  @Patch(':id/reject')
  @Roles('admin', 'hr_manager', 'manager')
  @ApiOperation({ summary: 'Rejeter un CRA' })
  @ApiResponse({ status: 200, description: 'CRA rejeté avec succès' })
  @ApiResponse({ status: 400, description: 'CRA ne peut pas être rejeté' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async reject(
    @Param('id') id: string,
    @Body() body: { managerComment: string },
    @Request() req: any
  ): Promise<Timesheet> {
    return await this.timesheetService.reject(id, req.user.id, req.user.companyId, body.managerComment);
  }

  @Patch(':id/process')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Marquer un CRA comme traité (intégré en paie)' })
  @ApiResponse({ status: 200, description: 'CRA traité avec succès' })
  @ApiResponse({ status: 400, description: 'CRA ne peut pas être traité' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async process(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<Timesheet> {
    return await this.timesheetService.process(id, req.user.id, req.user.companyId);
  }

  @Delete(':id')
  @Roles('admin', 'hr_manager', 'manager', 'employee')
  @ApiOperation({ summary: 'Supprimer un CRA' })
  @ApiResponse({ status: 200, description: 'CRA supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'CRA ne peut plus être supprimé' })
  @ApiResponse({ status: 404, description: 'CRA non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du CRA' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    const timesheet = await this.timesheetService.findOne(id, req.user.companyId);
    
    // Employé ne peut supprimer que ses propres CRA
    if (req.user.role === 'employee' && timesheet.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.timesheetService.remove(id, req.user.companyId);
  }
}
