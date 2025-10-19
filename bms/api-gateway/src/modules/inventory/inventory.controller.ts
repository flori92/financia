import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { TraceabilityService } from './traceability.service';
import { PickingService } from './picking.service';
import { ValuationService } from './valuation.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly traceabilityService: TraceabilityService,
    private readonly pickingService: PickingService,
    private readonly valuationService: ValuationService,
  ) {}

  @Post('warehouses')
  @ApiOperation({ summary: 'Créer un entrepôt' })
  async createWarehouse(@Body() data: any) {
    return this.warehouseService.createWarehouse(data);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Liste des entrepôts' })
  async getWarehouses(@Query('companyId') companyId: string) {
    return [];
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Transférer entre entrepôts' })
  async transferStock(@Body() data: any) {
    return this.warehouseService.transferBetweenWarehouses(data.fromId, data.toId, data.items);
  }

  @Get('stock')
  @ApiOperation({ summary: 'Consulter le stock' })
  async getStock(@Query('warehouseId') warehouseId: string, @Query('itemId') itemId?: string) {
    return this.warehouseService.getStock(warehouseId, itemId);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Créer un lot' })
  async createBatch(@Body() data: any) {
    return this.traceabilityService.createBatch(data.itemId, data);
  }

  @Get('batches/:id/history')
  @ApiOperation({ summary: 'Historique d\'un lot' })
  async getBatchHistory(@Param('id') id: string) {
    return this.traceabilityService.getHistory(id);
  }

  @Post('picking')
  @ApiOperation({ summary: 'Créer une préparation de commande' })
  async createPicking(@Body() data: any) {
    return this.pickingService.createPickingList(data.orderId);
  }

  @Get('picking/:id/optimize')
  @ApiOperation({ summary: 'Optimiser le parcours de picking' })
  async optimizePicking(@Param('id') id: string) {
    return this.pickingService.optimizeRoute(id);
  }

  @Get('valuation/:itemId/fifo')
  @ApiOperation({ summary: 'Valorisation FIFO' })
  async calculateFIFO(@Param('itemId') itemId: string, @Query('quantity') quantity: number) {
    return this.valuationService.calculateFIFO(itemId, quantity);
  }
}
