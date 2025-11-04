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
import { LeaveRequestService } from './services/leave-request.service';
import { LeaveRequest, LeaveType, LeaveStatus } from './entities/leave-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/guards/roles.guard';

@ApiTags('Leave Requests / Congés')
@Controller('leave-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Créer une nouvelle demande de congé' })
  @ApiResponse({ status: 201, description: 'Demande de congé créée avec succès', type: LeaveRequest })
  @ApiResponse({ status: 400, description: 'Données invalides ou solde insuffisant' })
  async create(
    @Body() createLeaveRequestDto: any,
    @Request() req: any
  ): Promise<LeaveRequest> {
    // Employé ne peut créer que pour lui-même
    if (req.user.role === 'employee') {
      createLeaveRequestDto.employeeId = req.user.employeeId;
    }

    return await this.leaveRequestService.create(createLeaveRequestDto, req.user.companyId);
  }

  @Get()
  @Roles('admin', 'hr_manager', 'accountant', 'manager', 'employee')
  @ApiOperation({ summary: 'Lister les demandes de congé' })
  @ApiResponse({ status: 200, description: 'Liste des demandes de congé' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: LeaveStatus })
  @ApiQuery({ name: 'leaveType', required: false, enum: LeaveType })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: LeaveStatus,
    @Query('leaveType') leaveType?: LeaveType,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ leaveRequests: LeaveRequest[]; total: number }> {
    // Employé ne peut voir que ses propres demandes
    if (req.user.role === 'employee') {
      employeeId = req.user.employeeId;
    }

    return await this.leaveRequestService.findAll(req.user.companyId, {
      employeeId,
      status,
      leaveType,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Get('stats')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Obtenir les statistiques des congés' })
  @ApiResponse({ status: 200, description: 'Statistiques des congés' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getStats(
    @Request() req: any,
    @Query('year') year?: number
  ) {
    return await this.leaveRequestService.getStats(req.user.companyId, year);
  }

  @Get('pending-approval')
  @Roles('admin', 'hr_manager', 'manager')
  @ApiOperation({ summary: 'Lister les demandes en attente de validation' })
  @ApiResponse({ status: 200, description: 'Demandes en attente de validation' })
  @ApiQuery({ name: 'role', required: false, enum: ['manager', 'hr'] })
  async findPendingApproval(
    @Request() req: any,
    @Query('role') role?: 'manager' | 'hr'
  ): Promise<LeaveRequest[]> {
    return await this.leaveRequestService.findPendingApproval(req.user.companyId, role);
  }

  @Get(':id')
  @Roles('admin', 'hr_manager', 'accountant', 'manager', 'employee')
  @ApiOperation({ summary: 'Obtenir les détails d\'une demande de congé' })
  @ApiResponse({ status: 200, description: 'Détails de la demande de congé', type: LeaveRequest })
  @ApiResponse({ status: 404, description: 'Demande de congé non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestService.findOne(id, req.user.companyId);
    
    // Employé ne peut voir que ses propres demandes
    if (req.user.role === 'employee' && leaveRequest.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return leaveRequest;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Mettre à jour une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande de congé mise à jour', type: LeaveRequest })
  @ApiResponse({ status: 400, description: 'Demande ne peut plus être modifiée' })
  @ApiResponse({ status: 404, description: 'Demande de congé non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: any,
    @Request() req: any
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestService.findOne(id, req.user.companyId);
    
    // Employé ne peut modifier que ses propres demandes
    if (req.user.role === 'employee' && leaveRequest.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.leaveRequestService.update(id, updateLeaveRequestDto, req.user.companyId);
  }

  @Patch(':id/submit')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Soumettre une demande de congé pour validation' })
  @ApiResponse({ status: 200, description: 'Demande de congé soumise avec succès' })
  @ApiResponse({ status: 400, description: 'Demande ne peut plus être soumise' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async submit(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req: any
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestService.findOne(id, req.user.companyId);
    
    // Employé ne peut soumettre que ses propres demandes
    if (req.user.role === 'employee' && leaveRequest.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.leaveRequestService.submit(id, req.user.id, req.user.companyId, body.comment);
  }

  @Patch(':id/approve')
  @Roles('admin', 'hr_manager')
  @ApiOperation({ summary: 'Approuver directement une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande de congé approuvée avec succès' })
  @ApiResponse({ status: 400, description: 'Demande ne peut pas être approuvée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async approve(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req: any
  ): Promise<LeaveRequest> {
    return await this.leaveRequestService.approve(id, req.user.id, req.user.companyId, body.comment);
  }

  @Patch(':id/approve-by-manager')
  @Roles('admin', 'hr_manager', 'manager')
  @ApiOperation({ summary: 'Approuver une demande de congé (Manager)' })
  @ApiResponse({ status: 200, description: 'Demande de congé approuvée par le manager' })
  @ApiResponse({ status: 400, description: 'Demande ne peut pas être approuvée par le manager' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async approveByManager(
    @Param('id') id: string,
    @Body() body: { managerComment?: string },
    @Request() req: any
  ): Promise<LeaveRequest> {
    return await this.leaveRequestService.approveByManager(id, req.user.id, req.user.companyId, body.managerComment);
  }

  @Patch(':id/approve-by-hr')
  @Roles('admin', 'hr_manager')
  @ApiOperation({ summary: 'Approuver une demande de congé (RH)' })
  @ApiResponse({ status: 200, description: 'Demande de congé approuvée par les RH' })
  @ApiResponse({ status: 400, description: 'Demande ne peut pas être approuvée par les RH' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async approveByHR(
    @Param('id') id: string,
    @Body() body: { hrComment?: string },
    @Request() req: any
  ): Promise<LeaveRequest> {
    return await this.leaveRequestService.approveByHR(id, req.user.id, req.user.companyId, body.hrComment);
  }

  @Patch(':id/reject')
  @Roles('admin', 'hr_manager', 'manager')
  @ApiOperation({ summary: 'Rejeter une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande de congé rejetée avec succès' })
  @ApiResponse({ status: 400, description: 'Demande ne peut pas être rejetée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async reject(
    @Param('id') id: string,
    @Body() body: { rejectReason: string; rejectBy?: 'manager' | 'hr' },
    @Request() req: any
  ): Promise<LeaveRequest> {
    return await this.leaveRequestService.reject(
      id,
      req.user.id,
      req.user.companyId,
      body.rejectReason,
      body.rejectBy
    );
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Annuler une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande de congé annulée avec succès' })
  @ApiResponse({ status: 400, description: 'Demande ne peut plus être annulée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async cancel(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestService.findOne(id, req.user.companyId);
    
    // Employé ne peut annuler que ses propres demandes
    if (req.user.role === 'employee' && leaveRequest.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.leaveRequestService.cancel(id, req.user.id, req.user.companyId);
  }

  @Patch(':id/process')
  @Roles('admin', 'hr_manager', 'accountant')
  @ApiOperation({ summary: 'Marquer une demande de congé comme traitée' })
  @ApiResponse({ status: 200, description: 'Demande de congé traitée avec succès' })
  @ApiResponse({ status: 400, description: 'Demande ne peut pas être traitée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async process(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<LeaveRequest> {
    return await this.leaveRequestService.process(id, req.user.id, req.user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Supprimer une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande de congé supprimée avec succès' })
  @ApiResponse({ status: 400, description: 'Demande ne peut plus être supprimée' })
  @ApiResponse({ status: 404, description: 'Demande de congé non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la demande de congé' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    const leaveRequest = await this.leaveRequestService.findOne(id, req.user.companyId);
    
    // Employé ne peut supprimer que ses propres demandes
    if (req.user.role === 'employee' && leaveRequest.employeeId !== req.user.employeeId) {
      throw new Error('Accès non autorisé');
    }

    return await this.leaveRequestService.remove(id, req.user.companyId);
  }
}
