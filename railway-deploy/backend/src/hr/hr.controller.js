const hrService = require('./hr.service');
const { ApiOperation, ApiResponse, ApiTags } = require('@nestjs/swagger');

@ApiTags('HR')
@Controller('hr')
export class HRController {
  constructor(private readonly hrService: HRService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get HR dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'HR dashboard data retrieved successfully' })
  async getHRDashboard(@Query('companyId') companyId: string) {
    return this.hrService.getDashboardMetrics(companyId);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  async getEmployees(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.hrService.getEmployees(companyId, status);
  }

  @Post('employees')
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async createEmployee(@Body() createEmployeeDto: any, @Query('companyId') companyId: string) {
    return this.hrService.createEmployee(createEmployeeDto, companyId);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  async updateEmployee(@Param('id') id: string, @Body() updateEmployeeDto: any) {
    return this.hrService.updateEmployee(id, updateEmployeeDto);
  }

  @Get('payroll')
  @ApiOperation({ summary: 'Get payroll calculations' })
  @ApiResponse({ status: 200, description: 'Payroll data retrieved successfully' })
  async getPayroll(@Query('companyId') companyId: string, @Query('month') month?: string) {
    return this.hrService.getPayroll(companyId, month);
  }

  @Post('payroll/generate')
  @ApiOperation({ summary: 'Generate payroll slips' })
  @ApiResponse({ status: 201, description: 'Payroll generated successfully' })
  async generatePayroll(@Body() generateDto: { month: string; employeeIds?: string[] }, @Query('companyId') companyId: string) {
    return this.hrService.generatePayroll(generateDto, companyId);
  }

  @Get('leaves')
  @ApiOperation({ summary: 'Get all leave requests' })
  @ApiResponse({ status: 200, description: 'Leave requests retrieved successfully' })
  async getLeaves(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.hrService.getLeaves(companyId, status);
  }

  @Post('leaves')
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  async createLeave(@Body() createLeaveDto: any, @Query('companyId') companyId: string) {
    return this.hrService.createLeave(createLeaveDto, companyId);
  }

  @Put('leaves/:id/approve')
  @ApiOperation({ summary: 'Approve leave request' })
  @ApiResponse({ status: 200, description: 'Leave request approved successfully' })
  async approveLeave(@Param('id') id: string, @Body() approveDto: { approved: boolean; comment?: string }) {
    return this.hrService.approveLeave(id, approveDto);
  }
}
