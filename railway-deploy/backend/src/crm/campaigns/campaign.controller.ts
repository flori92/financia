import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CampaignService } from './campaign.service';

@Controller('crm/campaigns')
export class CampaignController {
  constructor(private service: CampaignService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string) {
    return this.service.execute(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }
}
