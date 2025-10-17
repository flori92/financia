import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountingClosureService } from './accounting-closure.service';
import { PeriodClosure } from './entities/period-closure.entity';

/**
 * Contrôleur pour la clôture de période comptable
 */
@ApiTags('Accounting Closure')
@Controller('accounting/closure')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountingClosureController {
  constructor(
    private readonly closureService: AccountingClosureService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les clôtures d\'une société' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, type: [PeriodClosure] })
  async findAll(@Query('companyId') companyId: string): Promise<PeriodClosure[]> {
    return this.closureService.findAll(companyId);
  }

  @Get('preview')
  @ApiOperation({ summary: 'Preview d\'une clôture (calcul résultat)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200 })
  async preview(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.closureService.previewClosure(companyId, startDate, endDate);
  }

  @Post('close')
  @ApiOperation({ summary: 'Clôturer une période comptable' })
  @ApiResponse({ status: 201, type: PeriodClosure })
  async close(@Body() body: {
    companyId: string;
    startDate: string;
    endDate: string;
    userId: string;
  }): Promise<PeriodClosure> {
    return this.closureService.closePeriod(
      body.companyId,
      body.startDate,
      body.endDate,
      body.userId,
    );
  }

  @Get('last')
  @ApiOperation({ summary: 'Récupérer la dernière clôture' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, type: PeriodClosure })
  async getLast(@Query('companyId') companyId: string): Promise<PeriodClosure | null> {
    return this.closureService.getLastClosure(companyId);
  }
}
