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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserRole, UserProfile } from '../auth/guards/user-profiles';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.EXPERT_COMPTABLE)
@Profiles(UserProfile.ADMIN, UserProfile.ACCOUNTANT, UserProfile.EXPERT_COMPTABLE)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

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
}
