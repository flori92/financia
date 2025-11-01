import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OcrService } from './services/ocr.service';
// import { AnomalyDetectionService } from './services/anomaly-detection.service';

@Module({
  imports: [],
  controllers: [AIController],
  providers: [
    AIService,
    OcrService,
    // AnomalyDetectionService, // Temporarily disabled (TensorFlow deps)
  ],
  exports: [AIService],
})
export class AIModule {}