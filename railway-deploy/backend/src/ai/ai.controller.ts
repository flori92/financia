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
import { DocumentAIService } from './services/document-ai.service';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly documentAIService: DocumentAIService,
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

  @Post('document-ai/extract')
  @ApiOperation({ summary: 'Extraction document avec Google Document AI (le plus puissant)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async extractWithDocumentAI(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    
    // Détecter le type MIME
    const isPDF = file.buffer.length > 4 && file.buffer[0] === 0x25 && file.buffer[1] === 0x50;
    const mimeType = isPDF ? 'application/pdf' : 'image/jpeg';
    
    try {
      const result = await this.documentAIService.extractDocumentData(file.buffer, mimeType);
      if (result) {
        return {
          ...result,
          status: 'success',
          message: 'Document AI extraction réussie',
        };
      }
    } catch (error) {
      console.warn('Document AI indisponible:', error.message);
      return {
        status: 'error',
        message: 'Document AI non disponible',
        error: error.message,
        engine: 'google-document-ai',
      };
    }
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
      version: '3.0.0',
      capabilities: ['invoice', 'receipt', 'bank_statement', 'identity_document'],
      engines: [
        { name: 'Google Document AI', status: 'active', priority: 1, description: 'Le plus puissant pour documents structurés' },
        { name: 'Google Cloud Vision', status: 'active', priority: 2, description: 'Extraction texte et classification' },
        { name: 'OCR.space API', status: 'active', priority: 3, description: 'Gratuit et fiable' },
        { name: 'Tesseract.js', status: 'active', priority: 4, description: 'Fallback local' },
        { name: 'Simulation', status: 'active', priority: 5, description: 'Fallback final' },
      ],
      message: 'Service OCR multi-moteurs avancé (Document AI + Google Vision + OCR.space + Tesseract.js)',
      endpoints: [
        'POST /api/v1/ai/ocr/invoice - Cascade complète',
        'POST /api/v1/ai/document-ai/extract - Document AI direct',
        'POST /api/v1/ai/google-vision/extract-text - Google Vision direct',
        'GET /api/v1/ai/ocr/status - Statut des moteurs',
      ],
    };
  }
}