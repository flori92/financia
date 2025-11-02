import { Module } from '@nestjs/common';
import { AIAnalyticsController } from './ai-analytics.controller';
import { AIAnalyticsService } from './ai-analytics.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AIAnalyticsController],
  providers: [AIAnalyticsService],
  exports: [AIAnalyticsService],
})
export class AIAnalyticsModule {}
