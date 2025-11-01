import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BudgetService } from './budget.service';

@ApiTags('Budget')
@Controller('budget')
export class BudgetController {
  constructor(private service: BudgetService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/update-variances')
  updateVariances(@Param('id') id: string) {
    return this.service.updateVariances(id);
  }

  @Get('alerts/:companyId')
  getAlerts(@Param('companyId') companyId: string, @Query('threshold') threshold?: number) {
    return this.service.getAlerts(companyId, threshold);
  }

  @Post('revisions')
  @ApiOperation({ summary: 'Créer une révision budgétaire' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyId: { type: 'string' },
        year: { type: 'number', example: 2025 },
        scenario: { type: 'string', example: 'optimiste' },
        adjustmentRate: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Révision créée avec succès' })
  async createRevision(
    @Body() data: {
      companyId: string;
      year: number;
      scenario: string;
      adjustmentRate: number;
    },
  ) {
    return this.service.createRevision(data);
  }

  @Post('new')
  @ApiOperation({ summary: 'Créer un nouveau budget prévisionnel' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyId: { type: 'string' },
        year: { type: 'number', example: 2025 },
        name: { type: 'string', example: 'Budget 2025' },
        description: { type: 'string', example: 'Budget prévisionnel pour 2025' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Budget créé avec succès' })
  async createNewBudget(
    @Body() data: {
      companyId: string;
      year: number;
      name: string;
      description: string;
    },
  ) {
    return this.service.createNewBudget(data);
  }
}
