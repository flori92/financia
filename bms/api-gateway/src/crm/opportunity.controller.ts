import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OpportunityService } from './opportunity.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { Opportunity } from './entities/opportunity.entity';
import { PipelineStage, PipelineStageType } from './entities/pipeline-stage.entity';

/**
 * Contrôleur pour la gestion des opportunités CRM
 */
@ApiTags('CRM - Opportunities')
@Controller('crm/opportunities')
@ApiBearerAuth()
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  // ============================================
  // GESTION DES OPPORTUNITÉS
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle opportunité' })
  @ApiResponse({
    status: 201,
    description: 'Opportunité créée avec succès',
    type: Opportunity,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async createOpportunity(
    @Body() createOpportunityDto: CreateOpportunityDto,
  ): Promise<Opportunity> {
    return this.opportunityService.createOpportunity(createOpportunityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les opportunités' })
  @ApiResponse({
    status: 200,
    description: 'Liste des opportunités',
    type: [Opportunity],
  })
  async findAllOpportunities(@Query('companyId') companyId: string): Promise<Opportunity[]> {
    return this.opportunityService.findAllOpportunities(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une opportunité par ID' })
  @ApiResponse({
    status: 200,
    description: 'Opportunité trouvée',
    type: Opportunity,
  })
  @ApiResponse({ status: 404, description: 'Opportunité non trouvée' })
  async findOpportunityById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Opportunity> {
    return this.opportunityService.findOpportunityById(id, companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une opportunité' })
  @ApiResponse({
    status: 200,
    description: 'Opportunité mise à jour avec succès',
    type: Opportunity,
  })
  @ApiResponse({ status: 404, description: 'Opportunité non trouvée' })
  async updateOpportunity(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @Query('companyId') companyId: string,
  ): Promise<Opportunity> {
    return this.opportunityService.updateOpportunity(id, updateOpportunityDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une opportunité' })
  @ApiResponse({ status: 204, description: 'Opportunité supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Opportunité non trouvée' })
  async deleteOpportunity(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    return this.opportunityService.deleteOpportunity(id, companyId);
  }

  // ============================================
  // GESTION DU PIPELINE
  // ============================================

  @Post(':id/move/:stageId')
  @ApiOperation({ summary: 'Déplacer une opportunité vers une autre étape' })
  @ApiResponse({
    status: 200,
    description: 'Opportunité déplacée avec succès',
    type: Opportunity,
  })
  @ApiResponse({ status: 404, description: 'Opportunité ou étape non trouvée' })
  async moveOpportunityToStage(
    @Param('id') opportunityId: string,
    @Param('stageId') newStageId: string,
    @Query('companyId') companyId: string,
  ): Promise<Opportunity> {
    return this.opportunityService.moveOpportunityToStage(opportunityId, newStageId, companyId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Changer le statut d\'une opportunité' })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
    type: Opportunity,
  })
  async updateOpportunityStatus(
    @Param('id') opportunityId: string,
    @Body() body: { status: string },
    @Query('companyId') companyId: string,
  ): Promise<Opportunity> {
    return this.opportunityService.updateOpportunityStatus(
      opportunityId,
      body.status as any,
      companyId,
    );
  }

  @Get('pipeline/overview')
  @ApiOperation({ summary: 'Vue d\'ensemble du pipeline' })
  @ApiResponse({
    status: 200,
    description: 'Vue d\'ensemble du pipeline',
    schema: {
      type: 'object',
      properties: {
        stages: { type: 'array', items: { $ref: '#/components/schemas/PipelineStage' } },
        opportunitiesByStage: { type: 'object' },
        totalValue: { type: 'number' },
        averageDealSize: { type: 'number' },
        conversionRate: { type: 'number' },
      },
    },
  })
  async getPipelineOverview(@Query('companyId') companyId: string) {
    return this.opportunityService.getPipelineOverview(companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des opportunités' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des opportunités',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: { type: 'object' },
        totalValue: { type: 'number' },
        averageDealSize: { type: 'number' },
        conversionRate: { type: 'number' },
      },
    },
  })
  async getOpportunityStats(@Query('companyId') companyId: string) {
    return this.opportunityService.getOpportunityStats(companyId);
  }

  // ============================================
  // GESTION DES ÉTAPES DU PIPELINE
  // ============================================

  @Post('pipeline/stages')
  @ApiOperation({ summary: 'Créer une nouvelle étape de pipeline' })
  @ApiResponse({
    status: 201,
    description: 'Étape créée avec succès',
    type: PipelineStage,
  })
  async createPipelineStage(
    @Body() body: {
      name: string;
      type: PipelineStageType;
      order: number;
      probability: number;
      companyId: string;
    },
  ): Promise<PipelineStage> {
    return this.opportunityService.createPipelineStage(
      body.name,
      body.type,
      body.order,
      body.probability,
      body.companyId,
    );
  }

  @Get('pipeline/stages')
  @ApiOperation({ summary: 'Récupérer les étapes du pipeline' })
  @ApiResponse({
    status: 200,
    description: 'Liste des étapes du pipeline',
    type: [PipelineStage],
  })
  async getPipelineStages(@Query('companyId') companyId: string): Promise<PipelineStage[]> {
    return this.opportunityService.getDefaultPipelineStages(companyId);
  }

  @Put('pipeline/stages/:stageId')
  @ApiOperation({ summary: 'Mettre à jour une étape du pipeline' })
  @ApiResponse({
    status: 200,
    description: 'Étape mise à jour avec succès',
    type: PipelineStage,
  })
  @ApiResponse({ status: 404, description: 'Étape non trouvée' })
  async updatePipelineStage(
    @Param('stageId') stageId: string,
    @Body() updates: Partial<PipelineStage>,
    @Query('companyId') companyId: string,
  ): Promise<PipelineStage> {
    return this.opportunityService.updatePipelineStage(stageId, updates, companyId);
  }

  @Delete('pipeline/stages/:stageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une étape du pipeline' })
  @ApiResponse({ status: 204, description: 'Étape supprimée avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer une étape contenant des opportunités' })
  async deletePipelineStage(
    @Param('stageId') stageId: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    return this.opportunityService.deletePipelineStage(stageId, companyId);
  }
}
