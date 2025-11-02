import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('Logistics')
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('calculate-shipping')
  @ApiOperation({ summary: 'Calculer les frais de port' })
  async calculateShipping(@Body() data: any) {
    return this.shippingService.calculateShipping(data.orderId, data.carrier);
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Créer un envoi' })
  async createShipment(@Body() data: any) {
    return this.shippingService.createShipment(data.orderId, data.carrier);
  }

  @Get('tracking/:number')
  @ApiOperation({ summary: 'Suivre un colis' })
  async trackShipment(@Param('number') trackingNumber: string) {
    return this.shippingService.trackShipment(trackingNumber);
  }

  @Post('optimize-route')
  @ApiOperation({ summary: 'Optimiser une tournée' })
  async optimizeRoute(@Body() data: any) {
    return this.shippingService.optimizeRoute(data.shipments);
  }
}
