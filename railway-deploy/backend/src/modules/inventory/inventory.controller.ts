import { Controller, Get, Post, Body, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from '../../inventory/inventory.service';
import { WarehouseService } from './warehouse.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly warehouseService: WarehouseService,
  ) {}
  @Get('items')
  @ApiOperation({ summary: 'Lister les articles d\'inventaire' })
  @ApiResponse({ status: 200, description: 'Liste des articles retournée' })
  async getItems(@Query('companyId') companyId?: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.findAll(companyId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès' })
  async createProduct(@Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.create(data, companyId);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Récupérer un produit par ID' })
  @ApiResponse({ status: 200, description: 'Produit trouvé' })
  async getProduct(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.findOne(id, companyId);
  }

  @Post('items/:id')
  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiResponse({ status: 200, description: 'Produit mis à jour' })
  async updateProduct(@Param('id') id: string, @Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.update(id, data, companyId);
  }

  @Post('items/:id/delete')
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiResponse({ status: 200, description: 'Produit supprimé' })
  async deleteProduct(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.remove(id, companyId);
  }

  @Post('warehouses')
  @ApiOperation({ summary: 'Créer un entrepôt' })
  @ApiResponse({ status: 201, description: 'Entrepôt créé avec succès' })
  async createWarehouse(@Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.warehouseService.createWarehouse({ ...data, companyId });
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Liste des entrepôts' })
  @ApiResponse({ status: 200, description: 'Liste des entrepôts retournée' })
  async getWarehouses(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.warehouseService.getWarehouses(companyId);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Transférer entre entrepôts' })
  @ApiResponse({ status: 201, description: 'Transfert créé avec succès' })
  async transferStock(@Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.warehouseService.transferBetweenWarehouses(
      data.fromWarehouseId,
      data.toWarehouseId,
      data.items,
      companyId
    );
  }

  @Get('stock')
  @ApiOperation({ summary: 'Consulter le stock' })
  @ApiResponse({ status: 200, description: 'Informations de stock retournées' })
  async getStock(
    @Query('warehouseId') warehouseId: string, 
    @Query('itemId') itemId?: string,
    @Query('companyId') companyId?: string
  ) {
    if (!warehouseId) {
      throw new Error('warehouseId est requis');
    }
    return this.warehouseService.getStock(warehouseId, itemId);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Créer un lot' })
  @ApiResponse({ status: 201, description: 'Lot créé avec succès' })
  async createBatch(@Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.createBatch({ ...data, companyId });
  }

  @Get('batches/:id/history')
  @ApiOperation({ summary: 'Historique d\'un lot' })
  @ApiResponse({ status: 200, description: 'Historique du lot retourné' })
  async getBatchHistory(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.getBatchHistory(id, companyId);
  }

  @Post('picking')
  @ApiOperation({ summary: 'Créer une préparation de commande' })
  @ApiResponse({ status: 201, description: 'Préparation créée avec succès' })
  async createPicking(@Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.createPicking({ ...data, companyId });
  }

  @Get('picking/:id/optimize')
  @ApiOperation({ summary: 'Optimiser le parcours de picking' })
  @ApiResponse({ status: 200, description: 'Parcours optimisé retourné' })
  async optimizePicking(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.optimizePicking(id, companyId);
  }

  @Get('valuation/:itemId/fifo')
  @ApiOperation({ summary: 'Valorisation FIFO' })
  @ApiResponse({ status: 200, description: 'Valorisation FIFO calculée' })
  async calculateFIFO(
    @Param('itemId') itemId: string, 
    @Query('quantity') quantity: number,
    @Query('companyId') companyId: string
  ) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.calculateFIFO(itemId, quantity, companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques d\'inventaire' })
  @ApiResponse({ status: 200, description: 'Statistiques retournées' })
  async getInventoryStats(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.getInventoryStats(companyId);
  }

  @Post('stock-adjustment')
  @ApiOperation({ summary: 'Ajustement de stock' })
  @ApiResponse({ status: 201, description: 'Ajustement effectué' })
  async adjustStock(@Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.inventoryService.adjustStock({ ...data, companyId });
  }
}
