const marketingService = require('./marketing.service');
const { ApiOperation, ApiResponse, ApiTags } = require('@nestjs/swagger');

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get marketing dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'Marketing dashboard data retrieved successfully' })
  async getMarketingDashboard(@Query('companyId') companyId: string) {
    return this.marketingService.getDashboardMetrics(companyId);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getCampaigns(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.marketingService.getCampaigns(companyId, status);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  async createCampaign(@Body() createCampaignDto: any, @Query('companyId') companyId: string) {
    return this.marketingService.createCampaign(createCampaignDto, companyId);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  async updateCampaign(@Param('id') id: string, @Body() updateCampaignDto: any) {
    return this.marketingService.updateCampaign(id, updateCampaignDto);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get all leads' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  async getLeads(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.marketingService.getLeads(companyId, status);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  async createLead(@Body() createLeadDto: any, @Query('companyId') companyId: string) {
    return this.marketingService.createLead(createLeadDto, companyId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get marketing analytics' })
  @ApiResponse({ status: 200, description: 'Marketing analytics retrieved successfully' })
  async getAnalytics(@Query('companyId') companyId: string, @Query('period') period?: string) {
    return this.marketingService.getAnalytics(companyId, period);
  }
}
