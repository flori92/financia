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
import { GoogleVisionService } from './services/google-vision.service';
import { GoogleVisionFallbackService } from './services/google-vision-fallback.service';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly googleVisionService: GoogleVisionService,
    private readonly googleVisionFallbackService: GoogleVisionFallbackService,
  ) {}

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

  @Post('google-vision/extract-text')
  @ApiOperation({ summary: 'Extraction texte avec Google Cloud Vision' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async extractWithGoogleVision(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    
    // Utiliser Google Vision si disponible, sinon fallback
    try {
      const result = await this.googleVisionService.extractText(file.buffer);
      if (result.text && result.confidence > 0) {
        return { ...result, engine: 'google-vision', status: 'success' };
      }
    } catch (error) {
      console.warn('Google Vision indisponible, utilisation fallback:', error.message);
    }
    
    // Fallback
    const fallbackResult = await this.googleVisionFallbackService.extractText(file.buffer);
    return { ...fallbackResult, engine: 'google-vision-fallback', status: 'fallback' };
  }

  @Post('google-vision/classify')
  @ApiOperation({ summary: 'Classification document avec Google Cloud Vision' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async classifyDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    
    let documentType: string;
    let structuredData: any;
    let engine: string = 'google-vision';
    let status: string = 'success';
    
    // Utiliser Google Vision si disponible, sinon fallback
    try {
      documentType = await this.googleVisionService.classifyDocument(file.buffer);
      if (documentType === 'other') {
        throw new Error('Classification fallback nécessaire');
      }
      structuredData = await this.googleVisionService.extractStructuredData(file.buffer, documentType);
    } catch (error) {
      console.warn('Google Vision indisponible, utilisation fallback:', error.message);
      documentType = await this.googleVisionFallbackService.classifyDocument(file.buffer);
      structuredData = await this.googleVisionFallbackService.extractStructuredData(file.buffer, documentType);
      engine = 'google-vision-fallback';
      status = 'fallback';
    }
    
    return {
      documentType,
      data: structuredData,
      extractedAt: new Date().toISOString(),
      ocrEngine: engine,
      status,
    };
  }

  @Get('ocr/status')
  @ApiOperation({ summary: 'Vérifier le statut du service OCR' })
  async getStatus() {
    return {
      status: 'operational',
      service: 'OCR',
      version: '2.0.0',
      capabilities: ['invoice', 'receipt', 'bank_statement', 'identity_document'],
      engines: [
        { name: 'Google Cloud Vision', status: 'active', priority: 1 },
        { name: 'OCR.space API', status: 'active', priority: 2 },
        { name: 'Tesseract.js', status: 'active', priority: 3 },
        { name: 'Simulation', status: 'active', priority: 4 },
      ],
      message: 'Service OCR multi-moteurs opérationnel (Google Vision + OCR.space + Tesseract.js)',
    };
  }
}