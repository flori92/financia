import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { RemindersService } from './services/reminders.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(
  private readonly invoicesService: InvoicesService,
  private readonly remindersService: RemindersService,
) {}

  @Post()
  @RequirePermissions('invoices:create')
  @ApiOperation({ summary: 'Créer une nouvelle facture' })
  @ApiResponse({ status: 201, description: 'Facture créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CompanyId() companyId: string,
    @Request() req,
  ) {
    return this.invoicesService.create(createInvoiceDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les factures' })
  @ApiResponse({ status: 200, description: 'Liste des factures' })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const filters = { status, paymentStatus, startDate, endDate };
      return await this.invoicesService.findAll(companyId, filters);
    } catch (e) {
      console.error('InvoicesController.findAll error:', e);
      return [];
    }
  }

  @Get(':id')
  @RequirePermissions('invoices:read')
  @ApiOperation({ summary: 'Obtenir une facture par ID' })
  @ApiResponse({ status: 200, description: 'Facture trouvée' })
  @ApiResponse({ status: 404, description: 'Facture non trouvée' })
  async findOne(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.invoicesService.findOne(id, companyId);
  }

  @Patch(':id/submit')
  @RequirePermissions('invoices:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soumettre une facture (draft → submitted)' })
  @ApiResponse({ status: 200, description: 'Facture soumise' })
  async submit(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.invoicesService.submit(id, companyId);
  }

  @Patch(':id/cancel')
  @RequirePermissions('invoices:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Annuler une facture' })
  @ApiResponse({ status: 200, description: 'Facture annulée' })
  async cancel(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.invoicesService.cancel(id, companyId);
  }

  @Patch(':id/validate')
  @RequirePermissions('invoices:validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider une facture (comptable)' })
  @ApiResponse({ status: 200, description: 'Facture validée' })
  async validate(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Request() req,
  ) {
    return this.invoicesService.validate(id, companyId, req.user.userId);
  }

  @Post(':id/send')
  @RequirePermissions('invoices:send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer une facture par WhatsApp/SMS/Email' })
  @ApiResponse({ status: 200, description: 'Facture envoyée' })
  async send(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Body('method') method: 'whatsapp' | 'sms' | 'email',
  ) {
    return this.invoicesService.sendInvoice(id, companyId, method);
  }

  @Post('reminders/send')
  @RequirePermissions('invoices:remind')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer les relances automatiques' })
  @ApiResponse({ status: 200, description: 'Relances envoyées' })
  async sendReminders(@CompanyId() companyId: string) {
    return this.remindersService.sendReminders();
  }

  @Get('reminders/preview')
  @RequirePermissions('invoices:read')
  @ApiOperation({ summary: 'Prévisualiser les relances à envoyer' })
  @ApiResponse({ status: 200, description: 'Liste des relances prévues' })
  async previewReminders(@CompanyId() companyId: string) {
    const now = new Date();
    const unpaidInvoices = await this.invoicesService.findAll(companyId, {
      paymentStatus: 'unpaid',
    });

    const reminders = [];
    for (const invoice of unpaidInvoices) {
      if (new Date(invoice.dueDate) < now) {
        const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        let level: 'gentle' | 'firm' | 'formal' | 'legal' = 'gentle';
        if (daysOverdue > 45) level = 'legal';
        else if (daysOverdue > 30) level = 'formal';
        else if (daysOverdue > 15) level = 'firm';

        reminders.push({
          invoice: invoice.invoiceNumber,
          customerName: invoice.partyName,
          amount: invoice.totalAmount,
          dueDate: invoice.dueDate,
          daysOverdue,
          level,
          nextAction: this.getNextAction(level, daysOverdue),
        });
      }
    }

    return { reminders, total: reminders.length };
  }

  private getNextAction(level: string, daysOverdue: number): string {
    switch (level) {
      case 'gentle':
        return 'Email rappel amical';
      case 'firm':
        return 'Email + WhatsApp';
      case 'formal':
        return 'Email + WhatsApp + SMS';
      case 'legal':
        return 'Mise en demeure légale';
      default:
        return 'Aucune action';
    }
  }
}
