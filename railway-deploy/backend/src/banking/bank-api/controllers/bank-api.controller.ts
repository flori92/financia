import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankApiService } from '../services/bank-api.service';
import { CreateBankConnectionDto, BankSyncOptionsDto } from '../dto/bank-api.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Bank API')
@Controller('bank-api')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BankApiController {
  constructor(private readonly bankApiService: BankApiService) {}

  @Post('connections')
  @ApiOperation({ summary: 'Initialiser une connexion bancaire' })
  @ApiResponse({ status: 201, description: 'Connexion initialisée avec succès' })
  async createConnection(@Body() createConnectionDto: CreateBankConnectionDto) {
    return this.bankApiService.initializeConnection(createConnectionDto);
  }

  @Post('connections/:connectionId/complete-auth')
  @ApiOperation({ summary: 'Finaliser l\'authentification OAuth2' })
  @ApiResponse({ status: 200, description: 'Authentification complétée' })
  async completeAuthentication(
    @Param('connectionId') connectionId: string,
    @Body('code') code: string
  ) {
    return this.bankApiService.completeAuthentication(connectionId, code);
  }

  @Get('connections/:connectionId/accounts')
  @ApiOperation({ summary: 'Récupérer les comptes d\'une connexion' })
  @ApiResponse({ status: 200, description: 'Liste des comptes récupérée' })
  async getAccounts(@Param('connectionId') connectionId: string) {
    return this.bankApiService.getBankAccounts(connectionId);
  }

  @Get('accounts/:accountId/transactions')
  @ApiOperation({ summary: 'Récupérer les transactions d\'un compte' })
  @ApiResponse({ status: 200, description: 'Transactions récupérées' })
  async getTransactions(
    @Param('accountId') accountId: string,
    @Query('limit') limit?: number
  ) {
    return this.bankApiService.getTransactions(accountId, limit);
  }

  @Post('accounts/:accountId/sync')
  @ApiOperation({ summary: 'Synchroniser les transactions d\'un compte' })
  @ApiResponse({ status: 200, description: 'Synchronisation lancée' })
  async syncAccount(
    @Param('accountId') accountId: string,
    @Body() options?: BankSyncOptionsDto
  ) {
    return this.bankApiService.syncAccountTransactions(accountId, options);
  }

  @Get('accounts/:accountId/anomalies')
  @ApiOperation({ summary: 'Récupérer les anomalies d\'un compte' })
  @ApiResponse({ status: 200, description: 'Anomalies récupérées' })
  async getAnomalies(
    @Param('accountId') accountId: string,
    @Query('status') status?: string
  ) {
    return this.bankApiService.getAnomalies(accountId, status);
  }

  @Get('connections/:connectionId/status')
  @ApiOperation({ summary: 'Vérifier le statut d\'une connexion' })
  @ApiResponse({ status: 200, description: 'Statut de la connexion' })
  async getConnectionStatus(@Param('connectionId') connectionId: string) {
    return this.bankApiService.getConnectionStatus(connectionId);
  }
}
