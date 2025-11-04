import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { LeadNurturingService } from './lead-nurturing.service';

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly leadNurturingService: LeadNurturingService,
  ) {}

  @Post('campaigns')
  @ApiOperation({ summary: 'Créer une campagne' })
  async createCampaign(@Body() data: any) {
    return this.campaignService.createCampaign(data);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Liste des campagnes' })
  async getCampaigns(@Query('companyId') companyId: string) {
    return [];
  }

  @Post('campaigns/:id/send')
  @ApiOperation({ summary: 'Envoyer une campagne' })
  async sendCampaign(@Param('id') id: string) {
    return this.campaignService.sendCampaign(id);
  }

  @Post('campaigns/:id/ab-test')
  @ApiOperation({ summary: 'Lancer un A/B test' })
  async abTest(@Param('id') id: string, @Body() data: any) {
    return this.campaignService.abTest(data.variantA, data.variantB, data.sampleSize);
  }

  @Post('nurturing/workflows')
  @ApiOperation({ summary: 'Créer un workflow de nurturing' })
  async createWorkflow(@Body() data: any) {
    return this.leadNurturingService.createWorkflow(data);
  }

  @Post('nurturing/workflows/:id/enroll')
  @ApiOperation({ summary: 'Inscrire un lead dans un workflow' })
  async enrollLead(@Param('id') id: string, @Body() data: any) {
    return this.leadNurturingService.enrollLead(data.leadId, id);
  }
}
