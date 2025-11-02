import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle société' })
  @ApiResponse({ status: 201, description: 'Société créée avec succès' })
  async create(@Body() companyData: any) {
    return this.companiesService.create(companyData);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les sociétés' })
  @ApiResponse({ status: 200, description: 'Liste des sociétés' })
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une société par ID' })
  @ApiResponse({ status: 200, description: 'Société trouvée' })
  @ApiResponse({ status: 404, description: 'Société non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id/treasury-settings')
  @ApiOperation({ summary: 'Mettre à jour les seuils de trésorerie' })
  @ApiResponse({ status: 200, description: 'Seuils mis à jour' })
  @ApiResponse({ status: 404, description: 'Société non trouvée' })
  async updateTreasurySettings(
    @Param('id') id: string,
    @Body() settings: { treasuryCriticalThreshold: number; treasuryWarningThreshold: number },
  ) {
    return this.companiesService.updateTreasurySettings(id, settings);
  }
}
