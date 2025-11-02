import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MobileMoneyService } from './mobile-money.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('mobile-money')
@Controller('mobile-money')
export class MobileMoneyController {
  constructor(private readonly mobileMoneyService: MobileMoneyService) {}

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initier un paiement Mobile Money' })
  @ApiResponse({ status: 200, description: 'Paiement initié' })
  @ApiResponse({ status: 400, description: 'Erreur lors du paiement' })
  async pay(
    @Body()
    body: {
      amount: number;
      currency: string;
      phoneNumber: string;
      provider: 'mtn' | 'moov' | 'orange' | 'wave';
      invoiceId?: string;
    },
  ) {
    const txRef = `FIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return this.mobileMoneyService.initiatePayment({
      ...body,
      txRef,
    });
  }

  @Get('verify/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier le statut d\'une transaction' })
  @ApiResponse({ status: 200, description: 'Statut de la transaction' })
  async verify(@Param('transactionId') transactionId: string) {
    return this.mobileMoneyService.verifyTransaction(transactionId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Flutterwave (ne pas utiliser directement)' })
  async webhook(@Body() webhookData: any) {
    return this.mobileMoneyService.handleWebhook(webhookData);
  }

  @Post('generate-qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer un QR Code pour paiement Mobile Money' })
  @ApiResponse({ status: 200, description: 'QR Code généré' })
  async generateQR(
    @Body()
    body: {
      provider: string;
      amount: number;
      reference: string;
      phone?: string;
    },
  ) {
    const qrData = this.mobileMoneyService.generateQRCodeData(
      body.provider,
      body.amount,
      body.reference,
      body.phone,
    );

    return {
      qrData,
      provider: body.provider,
      amount: body.amount,
      currency: 'XOF',
    };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les transactions Mobile Money' })
  @ApiResponse({ status: 200, description: 'Liste des transactions' })
  async getTransactions(
    @Query('companyId') companyId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.mobileMoneyService.getTransactions({
      companyId,
      page,
      limit,
      status,
      provider,
      startDate,
      endDate,
    });
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Détails d\'une transaction Mobile Money' })
  @ApiResponse({ status: 200, description: 'Détails de la transaction' })
  async getTransaction(@Param('id') id: string) {
    return this.mobileMoneyService.getTransactionById(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistiques des transactions Mobile Money' })
  @ApiResponse({ status: 200, description: 'Statistiques' })
  async getStats(@Query('companyId') companyId: string) {
    return this.mobileMoneyService.getTransactionStats(companyId);
  }
}
