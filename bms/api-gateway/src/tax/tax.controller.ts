import { Controller, Get, Post, Query, Header, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { VatReturnDto } from './dto/vat-return.dto';

/**
 * Contrôleur pour la gestion fiscale (TVA)
 */
@ApiTags('Tax')
@Controller('tax')
// @UseGuards(JwtAuthGuard) // À décommenter quand l'auth est configurée
@ApiBearerAuth()
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('vat/return')
  @ApiOperation({ summary: 'Calculer la déclaration de TVA pour une période' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-01-31' })
  @ApiResponse({
    status: 200,
    description: 'Déclaration de TVA calculée',
    type: VatReturnDto,
  })
  async getVatReturn(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<VatReturnDto> {
    return this.taxService.getVatReturn(companyId, startDate, endDate);
  }

  @Get('vat/return/export')
  @ApiOperation({ summary: 'Exporter la déclaration de TVA en CSV' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="declaration-tva.csv"')
  async exportVatReturn(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<string> {
    const vatReturn = await this.taxService.getVatReturn(
      companyId,
      startDate,
      endDate,
    );
    return this.taxService.exportVatReturnCsv(vatReturn);
  }

  @Post('vat/recalculate')
  @ApiOperation({ summary: 'Recalculer la TVA pour une période' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyId: { type: 'string' },
        period: { type: 'string', example: '2025-01' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'TVA recalculée avec succès',
    schema: {
      type: 'object',
      properties: {
        collected: { type: 'number' },
        deductible: { type: 'number' },
        net: { type: 'number' },
      },
    },
  })
  async recalculateVat(
    @Body() body: { companyId: string; period: string },
  ): Promise<{ collected: number; deductible: number; net: number }> {
    // Calculer les dates de début et fin du mois
    const startDate = `${body.period}-01`;
    const date = new Date(body.period);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const endDate = `${body.period}-${lastDay.toString().padStart(2, '0')}`;

    const vatReturn = await this.taxService.getVatReturn(
      body.companyId,
      startDate,
      endDate,
    );

    return {
      collected: vatReturn.vatCollected,
      deductible: vatReturn.vatDeductible,
      net: vatReturn.vatNet,
    };
  }

  @Get('export/fec')
  @ApiOperation({ summary: 'Exporter le Fichier des Écritures Comptables (FEC)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'year', required: false, description: 'Année fiscale (défaut: année courante)' })
  @Header('Content-Type', 'text/plain; charset=UTF-8')
  async exportFEC(
    @Query('companyId') companyId: string,
    @Query('year') year?: string,
    @Res() res?: Response,
  ): Promise<any> {
    const fiscalYear = year ? parseInt(year) : new Date().getFullYear();
    const fecContent = await this.taxService.generateFEC(companyId, fiscalYear);
    
    if (res) {
      res.set({
        'Content-Type': 'text/plain; charset=UTF-8',
        'Content-Disposition': `attachment; filename="FEC-${fiscalYear}.txt"`,
      });
      return res.send(fecContent);
    }
    
    return fecContent;
  }

  @Get('generate-ca3-pdf')
  @ApiOperation({ summary: 'Générer le PDF du formulaire CA3' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'period', required: false, description: 'Période YYYY-MM (défaut: mois courant)' })
  async generateCA3Pdf(
    @Query('companyId') companyId: string,
    @Query('period') period?: string,
    @Res() res?: Response,
  ): Promise<any> {
    // Pour l'instant, générer un PDF simple avec les données
    // TODO: Utiliser une vraie bibliothèque PDF comme pdfkit ou puppeteer
    const currentPeriod = period || new Date().toISOString().substring(0, 7);
    const startDate = `${currentPeriod}-01`;
    const date = new Date(currentPeriod);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const endDate = `${currentPeriod}-${lastDay.toString().padStart(2, '0')}`;

    const vatReturn = await this.taxService.getVatReturn(
      companyId,
      startDate,
      endDate,
    );

    // Générer un PDF simple (mock pour l'instant)
    const pdfContent = `DECLARATION DE TVA CA3
    
Période: ${currentPeriod}
    
CHIFFRE D'AFFAIRES
Montant HT: ${vatReturn.revenueHT.toFixed(2)} FCFA
TVA Collectée: ${vatReturn.vatCollected.toFixed(2)} FCFA
    
ACHATS ET CHARGES
Montant HT: ${vatReturn.purchasesHT.toFixed(2)} FCFA
TVA Déductible: ${vatReturn.vatDeductible.toFixed(2)} FCFA
    
TVA À PAYER: ${vatReturn.vatNet.toFixed(2)} FCFA

---
Document généré automatiquement
Pour une déclaration officielle, utilisez le portail DGI
`;

    if (res) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CA3-${currentPeriod}.pdf"`,
      });
      // Pour l'instant, retourner du texte
      // TODO: Intégrer une vraie génération PDF
      return res.send(Buffer.from(pdfContent));
    }

    return pdfContent;
  }
}
