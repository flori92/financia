import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'Lister les fournisseurs' })
  @ApiResponse({ status: 200, description: 'Liste des fournisseurs retournée' })
  async getSuppliers(@Query('companyId') companyId?: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.getSuppliers(companyId);
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Créer un nouveau fournisseur' })
  @ApiResponse({ status: 201, description: 'Fournisseur créé avec succès' })
  async createSupplier(@Body() supplierData: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.createSupplier({ ...supplierData, companyId });
  }

  @Post('orders')
  @ApiOperation({ summary: 'Créer une commande d\'achat' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès' })
  createOrder(@Body() data: any) {
    return this.service.createOrder(data);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Lister les commandes d\'achat' })
  @ApiResponse({ status: 200, description: 'Liste des commandes retournée' })
  getOrders(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.getOrders(companyId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Détails d\'une commande d\'achat' })
  @ApiResponse({ status: 200, description: 'Détails de la commande retournés' })
  getOrder(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.getOrder(id, companyId);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Mettre à jour une commande d\'achat' })
  @ApiResponse({ status: 200, description: 'Commande mise à jour' })
  updateOrder(@Param('id') id: string, @Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.updateOrder(id, data, companyId);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Supprimer une commande d\'achat' })
  @ApiResponse({ status: 200, description: 'Commande supprimée' })
  deleteOrder(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.deleteOrder(id, companyId);
  }

  @Post('orders/:id/send')
  @ApiOperation({ summary: 'Envoyer une commande au fournisseur' })
  @ApiResponse({ status: 200, description: 'Commande envoyée' })
  sendOrder(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.sendOrder(id, companyId);
  }

  @Post('orders/:id/approve')
  @ApiOperation({ summary: 'Approuver une commande' })
  @ApiResponse({ status: 200, description: 'Commande approuvée' })
  approveOrder(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.approveOrder(id, companyId);
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Annuler une commande' })
  @ApiResponse({ status: 200, description: 'Commande annulée' })
  cancelOrder(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.cancelOrder(id, companyId);
  }

  @Post('receipts')
  @ApiOperation({ summary: 'Créer un réception de marchandise' })
  @ApiResponse({ status: 201, description: 'Réception créée avec succès' })
  createReceipt(@Body() data: any) {
    return this.service.createReceipt(data);
  }

  @Get('receipts')
  @ApiOperation({ summary: 'Lister les réceptions' })
  @ApiResponse({ status: 200, description: 'Liste des réceptions retournée' })
  getReceipts(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.getReceipts(companyId);
  }

  @Get('three-way-match/:orderId')
  @ApiOperation({ summary: 'Vérification three-way match' })
  @ApiResponse({ status: 200, description: 'Résultat de la vérification three-way match' })
  threeWayMatch(@Param('orderId') orderId: string) {
    return this.service.threeWayMatch(orderId);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Détails d\'un fournisseur' })
  @ApiResponse({ status: 200, description: 'Détails du fournisseur retournés' })
  getSupplier(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.getSupplier(id, companyId);
  }

  @Put('suppliers/:id')
  @ApiOperation({ summary: 'Mettre à jour un fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur mis à jour' })
  updateSupplier(@Param('id') id: string, @Body() data: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.updateSupplier(id, data, companyId);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Supprimer un fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur supprimé' })
  deleteSupplier(@Param('id') id: string, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.deleteSupplier(id, companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques achats' })
  @ApiResponse({ status: 200, description: 'Statistiques retournées' })
  getPurchaseStats(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    return this.service.getPurchaseStats(companyId);
  }
}
