import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmployeeService } from '../services/employee.service';

@ApiTags('HR Employees')
@Controller('hr/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel employé' })
  async create(@Body() employeeData: any) {
    return this.employeeService.create(employeeData);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les employés' })
  async findAll(
    @Query('companyId') companyId: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('position') position?: string
  ) {
    return this.employeeService.findAll(companyId, { department, status, position });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les détails d\'un employé' })
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un employé' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.employeeService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver un employé' })
  async remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Get('org-chart/:companyId')
  @ApiOperation({ summary: 'Obtenir l\'organigramme' })
  async getOrganizationChart(@Param('companyId') companyId: string) {
    return this.employeeService.getOrganizationChart(companyId);
  }

  @Get('statistics/:companyId')
  @ApiOperation({ summary: 'Obtenir les statistiques RH' })
  async getStatistics(@Param('companyId') companyId: string) {
    return this.employeeService.getStatistics(companyId);
  }

  @Get('birthdays/:companyId')
  @ApiOperation({ summary: 'Obtenir les anniversaires du mois' })
  async getBirthdaysThisMonth(@Param('companyId') companyId: string) {
    return this.employeeService.getBirthdaysThisMonth(companyId);
  }

  @Get('probation/:companyId')
  @ApiOperation({ summary: 'Obtenir les employés en période d\'essai' })
  async getProbationEmployees(@Param('companyId') companyId: string) {
    return this.employeeService.getProbationEmployees(companyId);
  }
}
