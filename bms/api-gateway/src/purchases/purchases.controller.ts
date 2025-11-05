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
    return this.suppliersRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
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

  @Post('orders')
  createOrder(@Body() data: any) {
    return this.service.createOrder(data);
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
