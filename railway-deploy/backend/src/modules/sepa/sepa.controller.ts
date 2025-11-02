import { Controller, Post, Get, Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { SEPAService } from './sepa.service';
import { Express } from 'express';

@ApiTags('sepa')
@Controller('sepa')
export class SEPAController {
  constructor(private readonly sepaService: SEPAService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importer un fichier SEPA' })
  @ApiResponse({ status: 200, description: 'Fichier SEPA importé avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur lors de l\'import' })
  async importSEPA(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { companyId: string },
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    try {
      const result = await this.sepaService.importSEPAFile(file.buffer, body.companyId);
      return {
        success: true,
        message: 'Fichier SEPA importé avec succès',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Post('generate-transfer')
  @ApiOperation({ summary: 'Générer un fichier de virement SEPA' })
  @ApiResponse({ status: 200, description: 'Fichier SEPA généré' })
  async generateTransfer(
    @Body() body: {
      payments: any[];
      creditor: any;
      companyId: string;
    },
  ) {
    try {
      const xmlContent = this.sepaService.generateSEPATransfer(body.payments, body.creditor);
      
      return {
        success: true,
        filename: `virement-sepa-${Date.now()}.xml`,
        content: xmlContent,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('validate')
  @ApiOperation({ summary: 'Valider un fichier SEPA' })
  @ApiResponse({ status: 200, description: 'Validation SEPA' })
  async validateSEPA(@Query('type') type: 'pain.001' | 'pain.008') {
    return {
      message: 'Endpoint de validation SEPA',
      type,
      status: 'ready',
    };
  }
}
