import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OCRService } from './services/ocr.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { PredictionService } from './services/prediction.service';
import { VirtualAssistantService } from './services/virtual-assistant.service';

@Module({
  imports: [],
  controllers: [AIController],
  providers: [
    AIService,
    OCRService,
    AnomalyDetectionService,
    PredictionService,
    VirtualAssistantService,
  ],
  exports: [AIService],
})
export class AIModule {}