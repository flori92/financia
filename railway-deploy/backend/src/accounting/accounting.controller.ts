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
import { AccountingAutomationService } from './accounting-automation.service';
import { AccountingDashboardService } from './accounting-dashboard.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProfileGuard } from '../auth/guards/profile.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { UserProfile } from '../auth/guards/user-profiles';

/**
 * Contrôleur pour la gestion comptable OHADA
 */
@ApiTags('Accounting (OHADA)')
@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard, ProfileGuard)
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly accountingAutomation: AccountingAutomationService,
    private readonly dashboardService: AccountingDashboardService,
  ) {}

  // ============================================
  // ENDPOINTS GESTION DES COMPTES
  // ============================================

  @Post('accounts')
  @RequirePermissions('accounting:create')
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

  // ============================================
  // ÉTATS COMPTABLES
  // ============================================

  @Get('trial-balance')
  @ApiOperation({ summary: 'Balance de vérification' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getTrialBalance(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountingService.getTrialBalance(companyId, startDate, endDate);
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Compte de résultat (P&L)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getProfitLoss(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountingService.getProfitLoss(companyId, startDate, endDate);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Bilan' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'date', required: true })
  async getBalanceSheet(
    @Query('companyId') companyId: string,
    @Query('date') date: string,
  ) {
    return this.accountingService.getBalanceSheet(companyId, date);
  }

  @Get('accounts')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Récupérer tous les comptes d\'une société' })
  async findAllAccounts(
    @CompanyId() companyId: string,
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

  // ============================================
  // SEED PLAN COMPTABLE SYSCOHADA
  // ============================================

  @Post('seed-syscohada')
  @ApiOperation({ summary: 'Initialiser le plan comptable SYSCOHADA pour une société' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 201, description: 'Comptes créés' })
  async seedSyscohada(@Query('companyId') companyId: string) {
    const created = await this.accountingService.seedSyscohada(companyId);
    return { created };
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
  @ApiResponse({ status: 200, description: 'Compte mis à jour', type: Account })
  @ApiResponse({ status: 404, description: 'Compte non trouvé' })
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountingService.updateAccount(id, updateAccountDto);
  }

  @Delete('accounts/:id')
  @RequirePermissions('accounting:delete')
  @Profiles(UserProfile.EXPERT_COMPTABLE, UserProfile.ACCOUNTANT)
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.EXPERT_COMPTABLE)
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
  @RequirePermissions('accounting:create')
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
  @RequirePermissions('accounting:validate')
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

  @Get('general-ledger')
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

  // ============================================
  // AUTOMATISATION DES ÉCRITURES
  // ============================================

  @Post('auto/sale')
  @ApiOperation({ summary: 'Générer automatiquement une écriture de vente' })
  async autoGenerateSaleEntry(@Body() body: {
    companyId: string;
    invoiceNumber: string;
    invoiceDate: string;
    customerName: string;
    amountHT: number;
    vatAmount: number;
    amountTTC: number;
    serviceType?: 'goods' | 'services';
    userId: string;
  }) {
    return this.accountingAutomation.generateSaleEntry(body);
  }

  @Post('auto/purchase')
  @ApiOperation({ summary: 'Générer automatiquement une écriture d\'achat' })
  async autoGeneratePurchaseEntry(@Body() body: {
    companyId: string;
    invoiceNumber: string;
    invoiceDate: string;
    supplierName: string;
    amountHT: number;
    vatAmount: number;
    amountTTC: number;
    purchaseType?: 'goods' | 'services';
    userId: string;
  }) {
    return this.accountingAutomation.generatePurchaseEntry(body);
  }

  @Post('auto/customer-payment')
  @ApiOperation({ summary: 'Générer automatiquement une écriture d\'encaissement client' })
  async autoGenerateCustomerPayment(@Body() body: {
    companyId: string;
    paymentNumber: string;
    paymentDate: string;
    customerName: string;
    amount: number;
    paymentMethod: 'bank' | 'cash' | 'mobile_money';
    userId: string;
  }) {
    return this.accountingAutomation.generateCustomerPaymentEntry(body);
  }

  @Post('auto/supplier-payment')
  @ApiOperation({ summary: 'Générer automatiquement une écriture de décaissement fournisseur' })
  async autoGenerateSupplierPayment(@Body() body: {
    companyId: string;
    paymentNumber: string;
    paymentDate: string;
    supplierName: string;
    amount: number;
    paymentMethod: 'bank' | 'cash' | 'mobile_money';
    userId: string;
  }) {
    return this.accountingAutomation.generateSupplierPaymentEntry(body);
  }

  // ============================================
  // BALANCE ÂGÉE (CRÉANCES/DETTES)
  // ============================================

  @Get('aged-balance')
  @ApiOperation({ summary: 'Balance âgée des créances clients ou dettes fournisseurs' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'type', enum: ['receivables', 'payables'], required: true })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Date d\'analyse (défaut: aujourd\'hui)' })
  @ApiResponse({
    status: 200,
    description: 'Balance âgée avec ventilation par tranches d\'ancienneté',
  })
  async getAgedBalance(
    @Query('companyId') companyId: string,
    @Query('type') type: 'receivables' | 'payables',
    @Query('asOfDate') asOfDate?: string,
  ): Promise<any> {
    const date = asOfDate || new Date().toISOString().slice(0, 10);
    return this.accountingService.getAgedBalance(companyId, type, date);
  }

  // ============================================
  // DASHBOARD COMPTABLE
  // ============================================

  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Métriques du dashboard comptable (KPI, graphiques, alertes)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Dashboard avec KPI, évolution, top clients/fournisseurs, ratios, alertes',
  })
  async getDashboardMetrics(@Query('companyId') companyId: string): Promise<any> {
    return this.dashboardService.getDashboardMetrics(companyId);
  }

  // ============================================
  // ENDPOINTS EXPORT DE DONNÉES
  // ============================================

  @Get('export/journal-entries')
  @ApiOperation({ summary: 'Export CSV des écritures comptables' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Fichier CSV des écritures' })
  async exportJournalEntries(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const data = await this.accountingService.generateGeneralLedger(
      companyId,
      undefined,
      startDate,
      endDate,
    );

    const csv = this.convertToCSV(data.movements, [
      'date',
      'entryNumber',
      'description',
      'reference',
      'debit',
      'credit',
      'balance',
    ]);

    return {
      filename: `journal_${new Date().toISOString().slice(0, 10)}.csv`,
      data: csv,
      contentType: 'text/csv',
    };
  }

  @Get('export/trial-balance')
  @ApiOperation({ summary: 'Export CSV de la balance de vérification' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Fichier CSV de la balance' })
  async exportTrialBalance(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const result = await this.accountingService.getTrialBalance(
      companyId,
      startDate,
      endDate,
    );

    const csv = this.convertToCSV(result.rows, [
      'number',
      'name',
      'debit',
      'credit',
      'balance',
    ]);

    return {
      filename: `balance_${new Date().toISOString().slice(0, 10)}.csv`,
      data: csv,
      contentType: 'text/csv',
    };
  }

  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'Obtenir le plan comptable' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'Plan comptable' })
  async getChartOfAccounts(@Query('companyId') companyId: string): Promise<any> {
    return await this.accountingService.findAllAccounts(companyId);
  }

  @Get('export/chart-of-accounts')
  @ApiOperation({ summary: 'Export CSV du plan comptable' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'Fichier CSV du plan comptable' })
  async exportChartOfAccounts(@Query('companyId') companyId: string): Promise<any> {
    const accounts = await this.accountingService.findAllAccounts(companyId);

    const csv = this.convertToCSV(accounts, [
      'accountNumber',
      'accountName',
      'type',
      'category',
      'isActive',
    ]);

    return {
      filename: `plan_comptable_${new Date().toISOString().slice(0, 10)}.csv`,
      data: csv,
      contentType: 'text/csv',
    };
  }

  // ============================================
  // ENDPOINTS CLOTURE ET TAXES
  // ============================================

  @Get('close/last')
  @ApiOperation({ summary: 'Obtenir la dernière clôture de période' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'Dernière clôture de période' })
  async getLastClosure(@Query('companyId') companyId: string): Promise<any> {
    // Mock data - à implémenter avec la vraie logique
    return {
      id: 'closure-123',
      period: '2025-09',
      status: 'completed',
      closedAt: '2025-10-01T00:00:00Z',
      totalRevenue: 12500000,
      totalExpenses: 8700000,
      netIncome: 3800000,
      closedBy: 'comptable@system.com'
    };
  }

  @Get('tax/vat/return')
  @ApiOperation({ summary: 'Générer une déclaration TVA' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Déclaration TVA générée' })
  async generateVATReturn(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    // Mock data - à implémenter avec la vraie logique
    return {
      period: `${startDate} au ${endDate}`,
      vatCollected: 2500000,
      vatDeductible: 1800000,
      vatDue: 700000,
      vatCredit: 0,
      taxableRevenue: 12500000,
      deductibleExpenses: 9000000,
      declarationId: 'vat-2025-11',
      status: 'draft',
      dueDate: '2025-11-25'
    };
  }

  // Helper pour conversion CSV
  private convertToCSV(data: any[], columns: string[]): string {
    if (!data || data.length === 0) return '';

    const header = columns.join(';') + '\n';
    const rows = data
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(';')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(';'),
      )
      .join('\n');

    return header + rows;
  }
}
