import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesClient } from './entities/sales-client.entity';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('clients')
  async findAll(@Query('companyId') companyId: string) {
    return this.salesService.findAll(companyId);
  }

  @Get('clients/stats')
  async getStats(@Query('companyId') companyId: string) {
    return this.salesService.getClientStats(companyId);
  }

  @Get('clients/:id')
  async findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.salesService.findOne(id, companyId);
  }

  @Post('clients')
  async create(@Body() createClientDto: Partial<SalesClient>, @Query('companyId') companyId: string) {
    return this.salesService.create(createClientDto, companyId);
  }

  @Put('clients/:id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: Partial<SalesClient>,
    @Query('companyId') companyId: string,
  ) {
    return this.salesService.update(id, updateClientDto, companyId);
  }

  @Delete('clients/:id')
  async remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.salesService.remove(id, companyId);
  }
}
