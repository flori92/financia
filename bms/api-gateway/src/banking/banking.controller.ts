import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BankingService } from './banking.service';
import { ImportCsvDto, ReconcileDto } from './dto/import-csv.dto';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from './entities/bank-account.entity';

/**
 * Contrôleur pour la gestion bancaire
 */
@ApiTags('Banking')
@Controller('banking')
// @UseGuards(JwtAuthGuard) // À décommenter quand l'auth est configurée
@ApiBearerAuth()
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Post('import')
  @ApiOperation({ summary: 'Importer des transactions depuis un CSV' })
  @ApiResponse({
    status: 201,
    description: 'Transactions importées',
    type: [BankTransaction],
  })
  async importCsv(@Body() dto: ImportCsvDto): Promise<BankTransaction[]> {
    return this.bankingService.importFromCsv(dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Récupérer toutes les transactions bancaires' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'reconciled', 'ignored'] })
  @ApiResponse({
    status: 200,
    description: 'Liste des transactions bancaires',
    type: [BankTransaction],
  })
  async findAll(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ): Promise<BankTransaction[]> {
    return this.bankingService.findAll(companyId, startDate, endDate, status);
  }

  @Get('transactions/:id/suggest')
  @ApiOperation({ summary: 'Suggérer des paiements à rapprocher' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Paiements suggérés',
  })
  async suggest(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<any[]> {
    return this.bankingService.suggestReconciliation(companyId, id);
  }

  @Post('reconcile')
  @ApiOperation({ summary: 'Rapprocher une transaction bancaire avec un paiement' })
  @ApiResponse({
    status: 200,
    description: 'Rapprochement effectué',
    type: BankTransaction,
  })
  async reconcile(@Body() dto: ReconcileDto): Promise<BankTransaction> {
    return this.bankingService.reconcile(dto);
  }

  @Delete('transactions/:id/reconcile')
  @ApiOperation({ summary: 'Annuler un rapprochement' })
  @ApiResponse({
    status: 200,
    description: 'Rapprochement annulé',
    type: BankTransaction,
  })
  async unreconcile(@Param('id') id: string): Promise<BankTransaction> {
    return this.bankingService.unreconcile(id);
  }

  @Post('transactions/:id/ignore')
  @ApiOperation({ summary: 'Marquer une transaction comme ignorée' })
  @ApiResponse({
    status: 200,
    description: 'Transaction ignorée',
    type: BankTransaction,
  })
  async ignore(@Param('id') id: string): Promise<BankTransaction> {
    return this.bankingService.ignore(id);
  }

  // ==========================================
  // GESTION DES COMPTES BANCAIRES
  // ==========================================

  @Post('accounts')
  @ApiOperation({ summary: 'Créer un compte bancaire' })
  @ApiResponse({
    status: 201,
    description: 'Compte bancaire créé',
    type: BankAccount,
  })
  async createAccount(@Body() dto: CreateBankAccountDto): Promise<BankAccount> {
    return this.bankingService.createBankAccount(dto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Récupérer tous les comptes bancaires avec soldes' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Liste des comptes bancaires avec soldes calculés',
  })
  async findAllAccounts(@Query('companyId') companyId: string): Promise<any[]> {
    return this.bankingService.findAllAccounts(companyId);
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Récupérer un compte bancaire par ID' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Détails du compte bancaire',
    type: BankAccount,
  })
  async findAccountById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<BankAccount> {
    return this.bankingService.findAccountById(id, companyId);
  }

  @Put('accounts/:id')
  @ApiOperation({ summary: 'Mettre à jour un compte bancaire' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Compte bancaire mis à jour',
    type: BankAccount,
  })
  async updateAccount(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() dto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    return this.bankingService.updateBankAccount(id, companyId, dto);
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: 'Supprimer un compte bancaire' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Compte bancaire supprimé',
  })
  async deleteAccount(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    return this.bankingService.deleteBankAccount(id, companyId);
  }
}
