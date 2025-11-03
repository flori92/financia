const projectsService = require('./projects.service');
const { ApiOperation, ApiResponse, ApiTags } = require('@nestjs/swagger');

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get projects dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'Projects dashboard data retrieved successfully' })
  async getProjectsDashboard(@Query('companyId') companyId: string) {
    return this.projectsService.getDashboardMetrics(companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getProjects(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.projectsService.getProjects(companyId, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async createProject(@Body() createProjectDto: any, @Query('companyId') companyId: string) {
    return this.projectsService.createProject(createProjectDto, companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  async updateProject(@Param('id') id: string, @Body() updateProjectDto: any) {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get project tasks' })
  @ApiResponse({ status: 200, description: 'Project tasks retrieved successfully' })
  async getProjectTasks(@Param('id') projectId: string) {
    return this.projectsService.getProjectTasks(projectId);
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Create project task' })
  @ApiResponse({ status: 201, description: 'Project task created successfully' })
  async createProjectTask(@Param('id') projectId: string, @Body() createTaskDto: any) {
    return this.projectsService.createProjectTask(projectId, createTaskDto);
  }
}
