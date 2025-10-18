import { Injectable } from '@nestjs/common';
import { OCRService } from './services/ocr.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { PredictionService } from './services/prediction.service';
import { VirtualAssistantService } from './services/virtual-assistant.service';

@Injectable()
export class AIService {
  constructor(
    private readonly ocrService: OCRService,
    private readonly anomalyDetection: AnomalyDetectionService,
    private readonly prediction: PredictionService,
    private readonly virtualAssistant: VirtualAssistantService,
  ) {}

  async processDocument(file: Express.Multer.File) {
    return this.ocrService.processDocument(file);
  }

  async analyzeData(data: any) {
    return this.anomalyDetection.analyze(data);
  }

  async getPrediction(data: any) {
    return this.prediction.getPrediction(data);
  }

  async chatResponse(content: string, context?: any) {
    return this.virtualAssistant.getResponse(content, context);
  }
}