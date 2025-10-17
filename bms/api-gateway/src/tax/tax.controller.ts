import { Controller, Get, Query, Header } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
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
}
