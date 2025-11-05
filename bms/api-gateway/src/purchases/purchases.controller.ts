import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchasesService } from './purchases.service';
import { Supplier } from './entities/supplier.entity';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(
    private service: PurchasesService,
    @InjectRepository(Supplier)
    private suppliersRepo: Repository<Supplier>,
  ) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'Lister les fournisseurs' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'Liste des fournisseurs', type: [Supplier] })
  async getSuppliers(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new Error('companyId est requis');
    }
    try {
      return await this.suppliersRepo.find({
        where: { companyId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('[PurchasesController] Erreur getSuppliers:', error);
      throw error;
    }
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Récupérer un fournisseur par ID' })
  @ApiResponse({ status: 200, description: 'Détails du fournisseur', type: Supplier })
  async getSupplier(@Param('id') id: string) {
    return this.suppliersRepo.findOne({ where: { id } });
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Créer un nouveau fournisseur' })
  @ApiResponse({ status: 201, description: 'Fournisseur créé', type: Supplier })
  async createSupplier(@Body() supplierData: Partial<Supplier>) {
    const supplier = this.suppliersRepo.create({
      ...supplierData,
      status: supplierData.status || 'active',
    });
    return this.suppliersRepo.save(supplier);
  }

  @Put('suppliers/:id')
  @ApiOperation({ summary: 'Mettre à jour un fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur mis à jour', type: Supplier })
  async updateSupplier(
    @Param('id') id: string,
    @Body() supplierData: Partial<Supplier>,
  ) {
    await this.suppliersRepo.update(id, supplierData);
    return this.suppliersRepo.findOne({ where: { id } });
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Supprimer un fournisseur' })
  @ApiResponse({ status: 200, description: 'Fournisseur supprimé' })
  async deleteSupplier(@Param('id') id: string) {
    await this.suppliersRepo.delete(id);
    return { success: true, message: 'Fournisseur supprimé' };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Lister les bons de commande' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'Liste des commandes' })
  getOrders(@Query('companyId') companyId: string) {
    return this.service.getOrders(companyId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Récupérer un bon de commande par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la commande' })
  getOrder(@Param('id') id: string) {
    return this.service.getOrder(id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Créer un bon de commande' })
  @ApiResponse({ status: 201, description: 'Commande créée' })
  createOrder(@Body() data: any) {
    return this.service.createOrder(data);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Mettre à jour un bon de commande' })
  @ApiResponse({ status: 200, description: 'Commande mise à jour' })
  updateOrder(@Param('id') id: string, @Body() data: any) {
    return this.service.updateOrder(id, data);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Annuler un bon de commande' })
  @ApiResponse({ status: 200, description: 'Commande annulée' })
  cancelOrder(@Param('id') id: string) {
    return this.service.cancelOrder(id);
  }

  @Post('receipts')
  createReceipt(@Body() data: any) {
    return this.service.createReceipt(data);
  }

  @Get('three-way-match/:orderId')
  threeWayMatch(@Param('orderId') orderId: string) {
    return this.service.threeWayMatch(orderId);
  }
}
