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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';

/**
 * Contrôleur pour la gestion comptable OHADA
 */
@ApiTags('Accounting (OHADA)')
@Controller('api/v1/accounting')
// @UseGuards(JwtAuthGuard) // À décommenter quand l'auth est configurée
@ApiBearerAuth()
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ============================================
  // ENDPOINTS GESTION DES COMPTES
  // ============================================

  @Post('accounts')
  @ApiOperation({ summary: 'Créer un nouveau compte' })
  @ApiResponse({
    status: 201,
    description: 'Compte créé avec succès',
    type: Account,
  })
  @ApiResponse({ status: 409, description: 'Le compte existe déjà' })
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountingService.createAccount(createAccountDto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Récupérer tous les comptes d\'une société' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Liste des comptes',
    type: [Account],
  })
  async findAllAccounts(
    @Query('companyId') companyId: string,
  ): Promise<Account[]> {
    return this.accountingService.findAllAccounts(companyId);
  }

  @Get('accounts/class/:syscohadaClass')
  @ApiOperation({ summary: 'Récupérer les comptes par classe SYSCOHADA' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Comptes de la classe spécifiée',
    type: [Account],
  })
  async findAccountsByClass(
    @Query('companyId') companyId: string,
    @Param('syscohadaClass') syscohadaClass: number,
  ): Promise<Account[]> {
    return this.accountingService.findAccountsByClass(
      companyId,
      Number(syscohadaClass),
    );
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Récupérer un compte par ID' })
  @ApiResponse({ status: 200, description: 'Compte trouvé', type: Account })
  @ApiResponse({ status: 404, description: 'Compte non trouvé' })
  async findAccountById(@Param('id') id: string): Promise<Account> {
    return this.accountingService.findAccountById(id);
  }

  @Put('accounts/:id')
  @ApiOperation({ summary: 'Mettre à jour un compte' })
  @ApiResponse({
    status: 200,
    description: 'Compte mis à jour',
    type: Account,
  })
  @ApiResponse({ status: 404, description: 'Compte non trouvé' })
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountingService.updateAccount(id, updateAccountDto);
  }

  @Delete('accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un compte' })
  @ApiResponse({ status: 204, description: 'Compte supprimé' })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer un compte avec solde',
  })
  @ApiResponse({ status: 404, description: 'Compte non trouvé' })
  async deleteAccount(@Param('id') id: string): Promise<void> {
    return this.accountingService.deleteAccount(id);
  }

  // ============================================
  // ENDPOINTS GESTION DES ÉCRITURES
  // ============================================

  @Post('journal-entries')
  @ApiOperation({ summary: 'Créer une nouvelle écriture comptable' })
  @ApiResponse({
    status: 201,
    description: 'Écriture créée avec succès',
    type: JournalEntry,
  })
  @ApiResponse({
    status: 400,
    description: 'Déséquilibre comptable ou validation échouée',
  })
  async createJournalEntry(
    @Body() createJournalEntryDto: CreateJournalEntryDto,
  ): Promise<JournalEntry> {
    return this.accountingService.createJournalEntry(createJournalEntryDto);
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Récupérer les écritures comptables' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Liste des écritures',
    type: [JournalEntry],
  })
  async findAllJournalEntries(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<JournalEntry[]> {
    return this.accountingService.findAllJournalEntries(
      companyId,
      startDate,
      endDate,
    );
  }

  @Get('journal-entries/:id')
  @ApiOperation({ summary: 'Récupérer une écriture par ID' })
  @ApiResponse({
    status: 200,
    description: 'Écriture trouvée',
    type: JournalEntry,
  })
  @ApiResponse({ status: 404, description: 'Écriture non trouvée' })
  async findJournalEntryById(@Param('id') id: string): Promise<JournalEntry> {
    return this.accountingService.findJournalEntryById(id);
  }

  @Post('journal-entries/:id/post')
  @ApiOperation({ summary: 'Valider (poster) une écriture' })
  @ApiResponse({
    status: 200,
    description: 'Écriture validée',
    type: JournalEntry,
  })
  @ApiResponse({ status: 400, description: 'Écriture déjà validée' })
  @ApiResponse({ status: 404, description: 'Écriture non trouvée' })
  async postJournalEntry(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<JournalEntry> {
    return this.accountingService.postJournalEntry(id, userId);
  }

  @Post('journal-entries/:id/cancel')
  @ApiOperation({ summary: 'Annuler une écriture' })
  @ApiResponse({
    status: 200,
    description: 'Écriture annulée',
    type: JournalEntry,
  })
  @ApiResponse({ status: 400, description: 'Écriture déjà annulée' })
  @ApiResponse({ status: 404, description: 'Écriture non trouvée' })
  async cancelJournalEntry(@Param('id') id: string): Promise<JournalEntry> {
    return this.accountingService.cancelJournalEntry(id);
  }

  // ============================================
  // ENDPOINTS RAPPORTS OHADA
  // ============================================

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Générer le Bilan OHADA' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'date', required: true, description: 'Date du bilan' })
  @ApiResponse({
    status: 200,
    description: 'Bilan généré',
  })
  async generateBalanceSheet(
    @Query('companyId') companyId: string,
    @Query('date') date: string,
  ): Promise<any> {
    return this.accountingService.generateBalanceSheet(companyId, date);
  }

  @Get('reports/income-statement')
  @ApiOperation({ summary: 'Générer le Compte de Résultat OHADA' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({
    status: 200,
    description: 'Compte de résultat généré',
  })
  async generateIncomeStatement(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.accountingService.generateIncomeStatement(
      companyId,
      startDate,
      endDate,
    );
  }

  @Get('reports/general-ledger')
  @ApiOperation({ summary: 'Générer le Grand Livre' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'accountNumber', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Grand livre généré',
  })
  async generateGeneralLedger(
    @Query('companyId') companyId: string,
    @Query('accountNumber') accountNumber?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.accountingService.generateGeneralLedger(
      companyId,
      accountNumber,
      startDate,
      endDate,
    );
  }
}
