import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { CPQService } from './cpq.service';

@ApiTags('CRM Advanced')
@Controller('crm')
export class CRMAdvancedController {
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly cpqService: CPQService,
  ) {}

  @Post('pipeline/opportunities')
  @ApiOperation({ summary: 'Créer une opportunité' })
  async createOpportunity(@Body() data: any) {
    return this.pipelineService.createOpportunity(data);
  }

  @Put('pipeline/opportunities/:id/stage')
  @ApiOperation({ summary: 'Changer le stade d\'une opportunité' })
  async moveStage(@Param('id') id: string, @Body() data: any) {
    return this.pipelineService.moveStage(id, data.stage);
  }

  @Get('pipeline/forecast')
  @ApiOperation({ summary: 'Prévisions de ventes' })
  async getForecast(@Query() period: any) {
    return this.pipelineService.forecast(period);
  }

  @Post('cpq/configure')
  @ApiOperation({ summary: 'Configurer un produit' })
  async configureProduct(@Body() data: any) {
    return this.cpqService.configureProduct(data.productId, data.options);
  }

  @Post('cpq/quote')
  @ApiOperation({ summary: 'Générer un devis CPQ' })
  async generateQuote(@Body() data: any) {
    return this.cpqService.generateQuote(data.config, data.customer);
  }

  @Post('cpq/quote/:id/discount')
  @ApiOperation({ summary: 'Appliquer une remise' })
  async applyDiscount(@Param('id') id: string, @Body() data: any) {
    return this.cpqService.applyDiscount(id, data.discount);
  }
}
