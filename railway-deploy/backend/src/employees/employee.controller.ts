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
import { EmployeeService } from './services/employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee, EmployeeStatus, ContractType } from './entities/employee.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/guards/roles.guard';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Créer un nouvel employé' })
  @ApiResponse({ status: 201, description: 'Employé créé avec succès', type: Employee })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Entreprise ou utilisateur non trouvé' })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req: any
  ): Promise<Employee> {
    return await this.employeeService.create(createEmployeeDto, req.user.companyId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT, UserRole.MANAGER)
  @ApiOperation({ summary: 'Lister tous les employés' })
  @ApiResponse({ status: 200, description: 'Liste des employés' })
  @ApiQuery({ name: 'status', required: false, enum: EmployeeStatus })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'contractType', required: false, enum: ContractType })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('status') status?: EmployeeStatus,
    @Query('department') department?: string,
    @Query('contractType') contractType?: ContractType,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ employees: Employee[]; total: number }> {
    return await this.employeeService.findAll(req.user.companyId, {
      status,
      department,
      contractType,
      search,
      page,
      limit,
    });
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Obtenir les statistiques des employés' })
  @ApiResponse({ status: 200, description: 'Statistiques des employés' })
  async getStats(@Request() req: any) {
    return await this.employeeService.getStats(req.user.companyId);
  }

  @Get('managers')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Lister les managers disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des managers' })
  async findManagers(@Request() req: any): Promise<Employee[]> {
    return await this.employeeService.findManagers(req.user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Obtenir les détails d\'un employé' })
  @ApiResponse({ status: 200, description: 'Détails de l\'employé', type: Employee })
  @ApiResponse({ status: 404, description: 'Employé non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<Employee> {
    // Vérifier les permissions : employé ne peut voir que ses propres infos
    if (req.user.role === UserRole.EMPLOYEE && req.user.employeeId !== id) {
      throw new Error('Accès non autorisé');
    }

    return await this.employeeService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Mettre à jour un employé' })
  @ApiResponse({ status: 200, description: 'Employé mis à jour', type: Employee })
  @ApiResponse({ status: 404, description: 'Employé non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: Partial<CreateEmployeeDto>,
    @Request() req: any
  ): Promise<Employee> {
    return await this.employeeService.update(id, updateEmployeeDto, req.user.companyId);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Activer/Désactiver un employé' })
  @ApiResponse({ status: 200, description: 'Statut de l\'employé mis à jour' })
  @ApiResponse({ status: 404, description: 'Employé non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async toggleStatus(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<Employee> {
    return await this.employeeService.toggleStatus(id, req.user.companyId);
  }

  @Patch(':id/update-leave-balance')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Mettre à jour le solde de congés d\'un employé' })
  @ApiResponse({ status: 200, description: 'Solde de congés mis à jour' })
  @ApiResponse({ status: 404, description: 'Employé non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async updateLeaveBalance(
    @Param('id') id: string,
    @Body() body: { daysUsed: number; operation?: 'add' | 'subtract' },
    @Request() req: any
  ): Promise<Employee> {
    return await this.employeeService.updateLeaveBalance(
      id,
      req.user.companyId,
      body.daysUsed,
      body.operation
    );
  }

  @Post(':id/associate-user')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Associer un utilisateur à un employé' })
  @ApiResponse({ status: 200, description: 'Utilisateur associé avec succès' })
  @ApiResponse({ status: 404, description: 'Employé ou utilisateur non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async associateUser(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Request() req: any
  ): Promise<Employee> {
    return await this.employeeService.associateUser(id, body.userId, req.user.companyId);
  }

  @Delete(':id/dissociate-user')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Désassocier un utilisateur d\'un employé' })
  @ApiResponse({ status: 200, description: 'Utilisateur désassocié avec succès' })
  @ApiResponse({ status: 404, description: 'Employé non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async dissociateUser(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<Employee> {
    return await this.employeeService.dissociateUser(id, req.user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Supprimer un employé (soft delete)' })
  @ApiResponse({ status: 200, description: 'Employé supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Employé non trouvé' })
  @ApiParam({ name: 'id', description: 'ID de l\'employé' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return await this.employeeService.remove(id, req.user.companyId);
  }
}
