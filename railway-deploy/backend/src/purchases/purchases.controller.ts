import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  private suppliers: any[] = []; // Stockage temporaire en mémoire

  constructor(private service: PurchasesService) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'Lister les fournisseurs' })
  async getSuppliers(@Query('companyId') companyId?: string) {
    try {
      // Retourner les fournisseurs stockés en mémoire pour les tests
      return this.suppliers;
    } catch (e) {
      console.error('PurchasesController.getSuppliers error:', e);
      return [];
    }
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Créer un nouveau fournisseur' })
  async createSupplier(@Body() supplierData: any) {
    try {
      // TODO: Implémenter la création réelle avec validation et base de données
      const newSupplier = {
        id: Date.now().toString(),
        ...supplierData,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      console.log('Supplier created (mock):', newSupplier);
      
      // Ajouter à la liste en mémoire pour les tests
      this.suppliers.push(newSupplier);
      
      return newSupplier;
    } catch (e) {
      console.error('PurchasesController.createSupplier error:', e);
      throw e;
    }
  }

  @Post('orders')
  createOrder(@Body() data: any) {
    return this.service.createOrder(data);
  }

  @Post('receipts')
  createReceipt(@Body() data: any) {
    return this.service.createReceipt(data);
  }

  @Get('three-way-match/:orderId')
  threeWayMatch(@Param('orderId') orderId: string) {
    return this.service.threeWayMatch(orderId);
  }
}
