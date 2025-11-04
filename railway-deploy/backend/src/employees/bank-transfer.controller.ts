import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BankTransferService } from './services/bank-transfer.service';
import { BankTransfer, TransferStatus, TransferType, PaymentProvider } from './entities/bank-transfer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/guards/roles.guard';

@ApiTags('Bank Transfers / Virements')
@Controller('bank-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankTransferController {
  constructor(private readonly bankTransferService: BankTransferService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Créer un nouveau virement' })
  @ApiResponse({ status: 201, description: 'Virement créé avec succès', type: BankTransfer })
  @ApiResponse({ status: 400, description: 'Données invalides ou informations de paiement manquantes' })
  async create(
    @Body() createBankTransferDto: any,
    @Request() req: any
  ): Promise<BankTransfer> {
    return await this.bankTransferService.create(createBankTransferDto, req.user.companyId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT, UserRole.MANAGER)
  @ApiOperation({ summary: 'Lister les virements' })
  @ApiResponse({ status: 200, description: 'Liste des virements' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: TransferStatus })
  @ApiQuery({ name: 'provider', required: false, enum: PaymentProvider })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: TransferStatus,
    @Query('provider') provider?: PaymentProvider,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ bankTransfers: BankTransfer[]; total: number }> {
    return await this.bankTransferService.findAll(req.user.companyId, {
      employeeId,
      status,
      provider,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Obtenir les statistiques des virements' })
  @ApiResponse({ status: 200, description: 'Statistiques des virements' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    const period = startDate && endDate ? { startDate, endDate } : undefined;
    return await this.bankTransferService.getStats(req.user.companyId, period);
  }

  @Post('schedule-payroll')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Programmer les virements de paie automatiques' })
  @ApiResponse({ status: 201, description: 'Virements de paie programmés avec succès' })
  async schedulePayrollTransfers(
    @Body() body: { payrollRecordIds: string[] },
    @Request() req: any
  ): Promise<BankTransfer[]> {
    return await this.bankTransferService.schedulePayrollTransfers(
      body.payrollRecordIds,
      req.user.id,
      req.user.companyId
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtenir les détails d\'un virement' })
  @ApiResponse({ status: 200, description: 'Détails du virement', type: BankTransfer })
  @ApiResponse({ status: 404, description: 'Virement non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du virement' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<BankTransfer> {
    return await this.bankTransferService.findOne(id, req.user.companyId);
  }

  @Patch(':id/execute')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Exécuter un virement' })
  @ApiResponse({ status: 200, description: 'Virement exécuté avec succès' })
  @ApiResponse({ status: 400, description: 'Virement ne peut plus être exécuté' })
  @ApiParam({ name: 'id', description: 'ID du virement' })
  async execute(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<BankTransfer> {
    return await this.bankTransferService.executeTransfer(id, req.user.id, req.user.companyId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Annuler un virement' })
  @ApiResponse({ status: 200, description: 'Virement annulé avec succès' })
  @ApiResponse({ status: 400, description: 'Virement ne peut plus être annulé' })
  @ApiParam({ name: 'id', description: 'ID du virement' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: any
  ): Promise<BankTransfer> {
    return await this.bankTransferService.cancel(id, req.user.id, req.user.companyId, body.reason);
  }

  @Patch(':id/retry')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Réessayer un virement échoué' })
  @ApiResponse({ status: 200, description: 'Virement réessayé avec succès' })
  @ApiResponse({ status: 400, description: 'Virement ne peut pas être réessayé' })
  @ApiParam({ name: 'id', description: 'ID du virement' })
  async retry(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<BankTransfer> {
    return await this.bankTransferService.retry(id, req.user.id, req.user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Supprimer un virement' })
  @ApiResponse({ status: 200, description: 'Virement supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'Virement ne peut plus être supprimé' })
  @ApiResponse({ status: 404, description: 'Virement non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du virement' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return await this.bankTransferService.remove(id, req.user.companyId);
  }
}
