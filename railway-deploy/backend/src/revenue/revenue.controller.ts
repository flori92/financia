import { Controller, Get, Query } from '@nestjs/common';
import { RevenueRecognitionService } from './services/revenue-recognition.service';
import { RevenueForecastService } from './services/revenue-forecast.service';

@Controller('revenue')
export class RevenueController {
  constructor(
    private recognition: RevenueRecognitionService,
    private forecast: RevenueForecastService,
  ) {}

  @Get('recognition')
  recognizeRevenue(@Query('companyId') companyId: string, @Query('method') method: any) {
    return this.recognition.recognizeRevenue(companyId, method);
  }

  @Get('deferred')
  getDeferredRevenue(@Query('companyId') companyId: string) {
    return this.recognition.getDeferredRevenue(companyId);
  }

  @Get('forecast')
  forecastRevenue(@Query('companyId') companyId: string, @Query('months') months?: string) {
    return this.forecast.forecastRevenue(companyId, months ? parseInt(months) : 3);
  }
}
