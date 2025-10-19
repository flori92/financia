import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';

@Controller('budget')
export class BudgetController {
  constructor(private service: BudgetService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/update-variances')
  updateVariances(@Param('id') id: string) {
    return this.service.updateVariances(id);
  }

  @Get('alerts/:companyId')
  getAlerts(@Param('companyId') companyId: string, @Query('threshold') threshold?: number) {
    return this.service.getAlerts(companyId, threshold);
  }
}
