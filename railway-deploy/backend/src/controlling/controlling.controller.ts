import { Controller, Get, Query } from '@nestjs/common';
import { CostAccountingService } from './services/cost-accounting.service';
import { BreakevenService } from './services/breakeven.service';

@Controller('controlling')
export class ControllingController {
  constructor(
    private costAccounting: CostAccountingService,
    private breakeven: BreakevenService,
  ) {}

  @Get('cost-price')
  calculateCostPrice(@Query('companyId') companyId: string, @Query('productId') productId: string) {
    return this.costAccounting.calculateCostPrice(companyId, productId);
  }

  @Get('margins')
  calculateMargins(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.costAccounting.calculateMargins(companyId, startDate, endDate);
  }

  @Get('breakeven')
  calculateBreakeven(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.breakeven.calculateBreakeven(companyId, startDate, endDate);
  }
}
