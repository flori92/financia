import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Product } from './entities/product.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  async findAll(
    @Query('companyId') companyId: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.inventoryService.findAll(companyId, { search, category, status });
  }

  @Get('products/stats')
  async getStats(@Query('companyId') companyId: string) {
    return this.inventoryService.getInventoryStats(companyId);
  }

  @Get('products/:id')
  async findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.inventoryService.findOne(id, companyId);
  }

  @Post('products')
  async create(@Body() createProductDto: Partial<Product>, @Query('companyId') companyId: string) {
    return this.inventoryService.create(createProductDto, companyId);
  }

  @Put('products/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<Product>,
    @Query('companyId') companyId: string,
  ) {
    return this.inventoryService.update(id, updateProductDto, companyId);
  }

  @Delete('products/:id')
  async remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.inventoryService.remove(id, companyId);
  }

  @Post('products/update-stock')
  async updateStockLevels(@Query('companyId') companyId: string) {
    return this.inventoryService.updateStockLevels(companyId);
  }
}
