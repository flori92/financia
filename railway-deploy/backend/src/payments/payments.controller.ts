import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import { Payment } from './entities/payment.entity';

/**
 * Contrôleur pour la gestion des paiements
 */
@ApiTags('Payments')
@Controller('payments')
// @UseGuards(JwtAuthGuard) // À décommenter quand l'auth est configurée
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau paiement' })
  @ApiResponse({
    status: 201,
    description: 'Paiement créé avec succès',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation échouée',
  })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les paiements d\'une société' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'partyType', required: false, enum: ['customer', 'supplier'] })
  @ApiResponse({
    status: 200,
    description: 'Liste des paiements',
    type: [Payment],
  })
  async findAllPayments(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('partyType') partyType?: string,
  ): Promise<Payment[]> {
    return this.paymentsService.findAllPayments(
      companyId,
      startDate,
      endDate,
      partyType,
    );
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Récupérer les paiements d\'une facture' })
  @ApiResponse({
    status: 200,
    description: 'Paiements de la facture',
    type: [Payment],
  })
  async findPaymentsByInvoice(
    @Param('invoiceId') invoiceId: string,
  ): Promise<Payment[]> {
    return this.paymentsService.findPaymentsByInvoice(invoiceId);
  }

  @Get('party/:partyId')
  @ApiOperation({ summary: 'Récupérer les paiements d\'un client/fournisseur' })
  @ApiQuery({ name: 'partyType', required: true, enum: ['customer', 'supplier'] })
  @ApiResponse({
    status: 200,
    description: 'Paiements du client/fournisseur',
    type: [Payment],
  })
  async findPaymentsByParty(
    @Param('partyId') partyId: string,
    @Query('partyType') partyType: string,
  ): Promise<Payment[]> {
    return this.paymentsService.findPaymentsByParty(partyId, partyType);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtenir le récapitulatif des paiements' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({
    status: 200,
    description: 'Récapitulatif des paiements',
  })
  async getPaymentsSummary(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.paymentsService.getPaymentsSummary(
      companyId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement par ID' })
  @ApiResponse({
    status: 200,
    description: 'Paiement trouvé',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async findPaymentById(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.findPaymentById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un paiement' })
  @ApiResponse({
    status: 200,
    description: 'Paiement mis à jour',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Seuls les paiements en brouillon peuvent être modifiés',
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.updatePayment(id, updatePaymentDto);
  }

  @Post(':id/allocate')
  @ApiOperation({ summary: 'Allouer un paiement à une facture' })
  @ApiResponse({
    status: 200,
    description: 'Allocation créée',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Montant insuffisant ou allocation impossible',
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async allocatePayment(
    @Param('id') id: string,
    @Body() allocatePaymentDto: AllocatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.allocatePayment(id, allocatePaymentDto);
  }

  @Delete(':id/allocations/:allocationId')
  @ApiOperation({ summary: 'Annuler une allocation' })
  @ApiResponse({
    status: 200,
    description: 'Allocation annulée',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Paiement ou allocation non trouvé' })
  async deallocatePayment(
    @Param('id') id: string,
    @Param('allocationId') allocationId: string,
  ): Promise<Payment> {
    return this.paymentsService.deallocatePayment(id, allocationId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Soumettre (valider) un paiement' })
  @ApiResponse({
    status: 200,
    description: 'Paiement validé',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Paiement déjà validé' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async submitPayment(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<Payment> {
    return this.paymentsService.submitPayment(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Annuler un paiement' })
  @ApiResponse({
    status: 200,
    description: 'Paiement annulé',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Paiement déjà annulé' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async cancelPayment(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.cancelPayment(id);
  }

  @Patch(':id/validate')
  @ApiOperation({ summary: 'Valider (approuver) un paiement' })
  @ApiResponse({ status: 200, description: 'Paiement validé', type: Payment })
  async validatePayment(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.validatePayment(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un paiement' })
  @ApiResponse({ status: 204, description: 'Paiement supprimé' })
  @ApiResponse({
    status: 400,
    description: 'Seuls les paiements en brouillon peuvent être supprimés',
  })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async deletePayment(@Param('id') id: string): Promise<void> {
    return this.paymentsService.deletePayment(id);
  }

  @Get('all-transactions')
  @ApiOperation({ summary: 'Récupérer toutes les transactions (banque, mobile money, espèces)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['bank', 'mobile', 'cash', 'all'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Liste des transactions' })
  async getAllTransactions(
    @Query('companyId') companyId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type: string = 'all',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getAllTransactions({
      companyId,
      page,
      limit,
      type,
      startDate,
      endDate,
    });
  }
}
