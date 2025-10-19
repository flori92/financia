import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

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
