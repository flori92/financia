import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { POSService } from './pos.service';

@ApiTags('POS')
@Controller('pos')
export class POSController {
  constructor(private readonly posService: POSService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Ouvrir une session de caisse' })
  async openSession(@Body() data: any) {
    return this.posService.openSession(data.cashierId, data.initialCash);
  }

  @Post('sales')
  @ApiOperation({ summary: 'Créer une vente' })
  async createSale(@Body() data: any) {
    return this.posService.createSale(data.sessionId, data.items);
  }

  @Post('sales/:id/payment')
  @ApiOperation({ summary: 'Enregistrer un paiement' })
  async processPayment(@Param('id') id: string, @Body() data: any) {
    return this.posService.processPayment(id, data.method, data.amount);
  }

  @Post('sessions/:id/close')
  @ApiOperation({ summary: 'Clôturer une session' })
  async closeSession(@Param('id') id: string) {
    return this.posService.closeSession(id);
  }

  @Get('sales/:id/receipt')
  @ApiOperation({ summary: 'Imprimer un ticket' })
  async printReceipt(@Param('id') id: string) {
    return this.posService.printReceipt(id);
  }
}
