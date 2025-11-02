import { Module } from '@nestjs/common';
import { AIAnalyticsController } from './ai-analytics.controller';
import { AIAnalyticsService } from './ai-analytics.service';

@Module({
  imports: [],
  controllers: [AIAnalyticsController],
  providers: [AIAnalyticsService],
  exports: [AIAnalyticsService],
})
export class AIAnalyticsModule {}
