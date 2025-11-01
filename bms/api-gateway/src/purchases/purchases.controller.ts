import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'Lister les fournisseurs' })
  async getSuppliers(@Query('companyId') companyId?: string) {
    try {
      // Pour l'instant, retourner un tableau vide
      // TODO: Implémenter la logique réelle avec une base de données
      return [];
    } catch (e) {
      console.error('PurchasesController.getSuppliers error:', e);
      return [];
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
