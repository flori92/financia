import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductionOrderService } from './production-order.service';
import { BOMService } from './bom.service';
import { MRPService } from './mrp.service';
import { MESService } from './mes.service';

@ApiTags('Manufacturing')
@Controller('manufacturing')
export class ManufacturingController {
  constructor(
    private readonly productionOrderService: ProductionOrderService,
    private readonly bomService: BOMService,
    private readonly mrpService: MRPService,
    private readonly mesService: MESService,
  ) {}

  @Post('production-orders')
  @ApiOperation({ summary: 'Créer un ordre de fabrication' })
  async createProductionOrder(@Body() data: any) {
    return this.productionOrderService.createOrder(data);
  }

  @Get('production-orders')
  @ApiOperation({ summary: 'Liste des ordres de fabrication' })
  async getProductionOrders(@Query('companyId') companyId: string) {
    return [];
  }

  @Post('production-orders/:id/start')
  @ApiOperation({ summary: 'Démarrer la production' })
  async startProduction(@Param('id') id: string) {
    return this.productionOrderService.startProduction(id);
  }

  @Post('bom')
  @ApiOperation({ summary: 'Créer une nomenclature' })
  async createBOM(@Body() data: any) {
    return this.bomService.createBOM(data.productId, data.components);
  }

  @Get('bom/:id/explode')
  @ApiOperation({ summary: 'Exploser une nomenclature' })
  async explodeBOM(@Param('id') id: string, @Query('quantity') quantity: number) {
    return this.bomService.explodeBOM(id, quantity);
  }

  @Post('mrp/run')
  @ApiOperation({ summary: 'Lancer le calcul MRP' })
  async runMRP(@Body() data: any) {
    return this.mrpService.runMRP(data.horizon);
  }

  @Post('mes/operations/:id/start')
  @ApiOperation({ summary: 'Démarrer une opération' })
  async startOperation(@Param('id') id: string, @Body() data: any) {
    return this.mesService.startOperation(id, data.workcenterId);
  }

  @Get('mes/workcenter/:id/oee')
  @ApiOperation({ summary: 'Obtenir l\'OEE d\'un centre de travail' })
  async getOEE(@Param('id') id: string, @Query() period: any) {
    return this.mesService.getOEE(id, period);
  }
}
