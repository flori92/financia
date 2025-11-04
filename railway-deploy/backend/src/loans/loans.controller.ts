import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Demander un micro-crédit' })
  @ApiResponse({ status: 201, description: 'Demande créée' })
  async apply(
    @Body()
    body: {
      companyId: string;
      bankId: string;
      requestedAmount: number;
      durationMonths: number;
      collateral?: any;
    },
  ) {
    return this.loansService.applyForLoan(body.companyId, body.bankId, body);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Mes demandes de crédit' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  async getCompanyLoans(@Param('companyId') companyId: string) {
    return this.loansService.getCompanyLoans(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une demande' })
  @ApiResponse({ status: 200, description: 'Demande trouvée' })
  async getLoan(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simuler un prêt' })
  @ApiResponse({ status: 200, description: 'Simulation effectuée' })
  async simulate(
    @Body()
    body: {
      amount: number;
      rate: number;
      durationMonths: number;
    },
  ) {
    return this.loansService.simulateLoan(body.amount, body.rate, body.durationMonths);
  }

  // Banque endpoints
  @Get('bank/:bankId/applications')
  @ApiOperation({ summary: '[Banque] Lister les demandes' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  async getBankLoans(@Param('bankId') bankId: string, @Query() filters: any) {
    return this.loansService.getAllLoans(bankId, filters);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: '[Banque] Approuver un prêt' })
  @ApiResponse({ status: 200, description: 'Prêt approuvé' })
  async approve(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { approvedAmount: number; rate: number },
  ) {
    return this.loansService.approveLoan(id, req.user.userId, body.approvedAmount, body.rate);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '[Banque] Rejeter un prêt' })
  @ApiResponse({ status: 200, description: 'Prêt rejeté' })
  async reject(@Param('id') id: string, @Request() req, @Body() body: { reason: string }) {
    return this.loansService.rejectLoan(id, req.user.userId, body.reason);
  }

  @Patch(':id/disburse')
  @ApiOperation({ summary: '[Banque] Décaisser un prêt' })
  @ApiResponse({ status: 200, description: 'Prêt décaissé' })
  async disburse(@Param('id') id: string, @Body() body: { method: string; reference: string }) {
    return this.loansService.disburseLoan(id, body);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Enregistrer un remboursement' })
  @ApiResponse({ status: 200, description: 'Paiement enregistré' })
  async recordPayment(@Param('id') id: string, @Body() body: { amount: number; reference: string }) {
    return this.loansService.recordPayment(id, body.amount, body.reference);
  }
}
