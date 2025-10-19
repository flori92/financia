import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Opportunity } from '../crm/entities/opportunity.entity';
import { RevenueRecognitionService } from './services/revenue-recognition.service';
import { RevenueForecastService } from './services/revenue-forecast.service';
import { RevenueController } from './revenue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Opportunity])],
  providers: [RevenueRecognitionService, RevenueForecastService],
  controllers: [RevenueController],
  exports: [RevenueRecognitionService, RevenueForecastService],
})
export class RevenueModule {}
