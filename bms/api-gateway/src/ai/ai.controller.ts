import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AIService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('ocr/invoice')
  @ApiOperation({ summary: 'Extraction OCR de facture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Données extraites de la facture' })
  @UseInterceptors(FileInterceptor('file'))
  async extractInvoice(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.aiService.processDocument(file);
  }

  @Post('ocr/receipt')
  @ApiOperation({ summary: 'Extraction OCR de reçu' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async extractReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    const ocrService = this.aiService['ocrService'];
    return ocrService.extractReceiptData(file.buffer);
  }

  @Post('ocr/bank-statement')
  @ApiOperation({ summary: 'Extraction OCR de relevé bancaire' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async extractBankStatement(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    const ocrService = this.aiService['ocrService'];
    return ocrService.extractBankStatement(file.buffer);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyse de données avec IA' })
  async analyzeData(@Body() data: any) {
    return this.aiService.analyzeData(data);
  }

  @Post('predict')
  @ApiOperation({ summary: 'Prédiction basée sur données historiques' })
  async getPrediction(@Body() data: any) {
    return this.aiService.getPrediction(data);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Assistant virtuel conversationnel' })
  async chat(@Body() message: { content: string; context?: any }) {
    return this.aiService.chatResponse(message.content, message.context);
  }

  @Get('ocr/status')
  @ApiOperation({ summary: 'Vérifier le statut du service OCR' })
  async getStatus() {
    return {
      status: 'operational',
      service: 'OCR',
      version: '1.0.0',
      capabilities: ['invoice', 'receipt', 'bank_statement'],
      message: 'Service OCR opérationnel (mode simulation)',
    };
  }
}