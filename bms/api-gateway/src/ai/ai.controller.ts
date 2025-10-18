import { Controller, Post, Get, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('ocr')
  @UseInterceptors(FileInterceptor('file'))
  async processDocument(@UploadedFile() file: Express.Multer.File) {
    return this.aiService.processDocument(file);
  }

  @Post('analyze')
  async analyzeData(@Body() data: any) {
    return this.aiService.analyzeData(data);
  }

  @Post('predict')
  async getPrediction(@Body() data: any) {
    return this.aiService.getPrediction(data);
  }

  @Post('chat')
  async chat(@Body() message: { content: string; context?: any }) {
    return this.aiService.chatResponse(message.content, message.context);
  }
}