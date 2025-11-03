const salesService = require('./sales.service');
const { ApiOperation, ApiResponse, ApiTags } = require('@nestjs/swagger');

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get sales dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'Sales dashboard data retrieved successfully' })
  async getSalesDashboard(@Query('companyId') companyId: string) {
    return this.salesService.getDashboardMetrics(companyId);
  }

  @Get('quotes')
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully' })
  async getQuotes(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.salesService.getQuotes(companyId, status);
  }

  @Post('quotes')
  @ApiOperation({ summary: 'Create new quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  async createQuote(@Body() createQuoteDto: any, @Query('companyId') companyId: string) {
    return this.salesService.createQuote(createQuoteDto, companyId);
  }

  @Put('quotes/:id')
  @ApiOperation({ summary: 'Update quote' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  async updateQuote(@Param('id') id: string, @Body() updateQuoteDto: any) {
    return this.salesService.updateQuote(id, updateQuoteDto);
  }

  @Post('quotes/:id/send')
  @ApiOperation({ summary: 'Send quote to client' })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  async sendQuote(@Param('id') id: string, @Body() sendDto: { email: string; message?: string }) {
    return this.salesService.sendQuote(id, sendDto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all sales orders' })
  @ApiResponse({ status: 200, description: 'Sales orders retrieved successfully' })
  async getOrders(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.salesService.getOrders(companyId, status);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create new sales order' })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  async createOrder(@Body() createOrderDto: any, @Query('companyId') companyId: string) {
    return this.salesService.createOrder(createOrderDto, companyId);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update sales order' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  async updateOrder(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.salesService.updateOrder(id, updateOrderDto);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Get all sales clients' })
  @ApiResponse({ status: 200, description: 'Sales clients retrieved successfully' })
  async getClients(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.salesService.getClients(companyId, status);
  }

  @Post('clients')
  @ApiOperation({ summary: 'Create new sales client' })
  @ApiResponse({ status: 201, description: 'Sales client created successfully' })
  async createClient(@Body() createClientDto: any, @Query('companyId') companyId: string) {
    return this.salesService.createClient(createClientDto, companyId);
  }

  @Put('clients/:id')
  @ApiOperation({ summary: 'Update sales client' })
  @ApiResponse({ status: 200, description: 'Sales client updated successfully' })
  async updateClient(@Param('id') id: string, @Body() updateClientDto: any) {
    return this.salesService.updateClient(id, updateClientDto);
  }
}
