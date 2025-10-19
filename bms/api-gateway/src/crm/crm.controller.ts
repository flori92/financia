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
  ApiQuery,
} from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CrmImportService } from './crm-import.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FilterContactsDto } from './dto/filter-contacts.dto';
import { ImportContactsDto } from './dto/import-contacts.dto';
import { ExportContactsDto } from './dto/export-contacts.dto';
import { Contact } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { LeadScoringService } from './lead-scoring.service';
import { FormalizationService } from './formalization.service';

/**
 * Contrôleur pour la gestion CRM (Contacts, Opportunités, Activités)
 */
@ApiTags('CRM')
@Controller('crm')
@ApiBearerAuth()
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly crmImportService: CrmImportService,
    private readonly leadScoringService: LeadScoringService,
    private readonly formalizationService: FormalizationService,
  ) {}

  // ============================================
  // GESTION DES CONTACTS
  // ============================================

  @Post('contacts')
  @ApiOperation({ summary: 'Créer un nouveau contact' })
  @ApiResponse({
    status: 201,
    description: 'Contact créé avec succès',
    type: Contact,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou email déjà existant',
  })
  async createContact(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.crmService.createContact(createContactDto);
  }

  @Post('contacts/import')
  @ApiOperation({ summary: 'Importer des contacts via un fichier CSV' })
  @ApiResponse({
    status: 200,
    description: 'Résultat de l\'import avec statistiques',
    schema: {
      type: 'object',
      properties: {
        importId: { type: 'string', format: 'uuid' },
        status: { type: 'string' },
        totalRows: { type: 'number' },
        successCount: { type: 'number' },
        skippedCount: { type: 'number' },
        errorCount: { type: 'number' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'CSV invalide' })
  async importContacts(@Body() importDto: ImportContactsDto) {
    return this.crmImportService.importContacts(importDto);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Récupérer tous les contacts avec filtres' })
  @ApiQuery({ name: 'companyId', required: true, description: 'ID de la société' })
  @ApiResponse({
    status: 200,
    description: 'Liste des contacts',
    schema: {
      type: 'object',
      properties: {
        contacts: { type: 'array', items: { $ref: '#/components/schemas/Contact' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findAllContacts(@Query() filterDto: FilterContactsDto) {
    return this.crmService.findAllContacts(filterDto);
  }

  @Post('contacts/export')
  @ApiOperation({ summary: 'Exporter les contacts filtrés vers un CSV' })
  @ApiResponse({
    status: 200,
    description: 'Fichier CSV encodé en base64',
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        mimeType: { type: 'string' },
        base64Data: { type: 'string' },
        rowCount: { type: 'number' },
      },
    },
  })
  async exportContacts(@Body() exportDto: ExportContactsDto) {
    return this.crmImportService.exportContacts(exportDto);
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Récupérer un contact par ID' })
  @ApiResponse({
    status: 200,
    description: 'Contact trouvé',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: 'Contact non trouvé' })
  async findContactById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Contact> {
    return this.crmService.findContactById(id, companyId);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  @ApiResponse({
    status: 200,
    description: 'Contact mis à jour avec succès',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: 'Contact non trouvé' })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou email déjà existant',
  })
  async updateContact(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Query('companyId') companyId: string,
  ): Promise<Contact> {
    return this.crmService.updateContact(id, updateContactDto, companyId);
  }

  @Delete('contacts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un contact' })
  @ApiResponse({ status: 204, description: 'Contact supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Contact non trouvé' })
  async deleteContact(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<void> {
    return this.crmService.deleteContact(id, companyId);
  }

  @Post('contacts/:id/archive')
  @ApiOperation({ summary: 'Archiver un contact' })
  @ApiResponse({
    status: 200,
    description: 'Contact archivé avec succès',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: 'Contact non trouvé' })
  async archiveContact(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ): Promise<Contact> {
    return this.crmService.archiveContact(id, companyId);
  }

  @Post('contacts/merge')
  @ApiOperation({ summary: 'Fusionner plusieurs contacts' })
  @ApiResponse({
    status: 200,
    description: 'Contacts fusionnés avec succès',
    type: Contact,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async mergeContacts(
    @Body() body: {
      primaryContactId: string;
      secondaryContactIds: string[];
      companyId: string;
    },
  ): Promise<Contact> {
    return this.crmService.mergeContacts(
      body.primaryContactId,
      body.secondaryContactIds,
      body.companyId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques CRM globales' })
  @ApiQuery({ name: 'companyId', required: true, description: 'ID de la société' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques CRM',
    schema: {
      type: 'object',
      properties: {
        totalContacts: { type: 'number' },
        activeOpportunities: { type: 'number' },
        totalValue: { type: 'number' },
        recentActivity: { type: 'number' },
        byType: { type: 'object' },
        byStatus: { type: 'object' },
      },
    },
  })
  async getCrmStats(@Query('companyId') companyId: string) {
    return this.crmService.getContactStats(companyId);
  }

  // ============================================
  // GESTION DES TAGS
  // ============================================

  @Post('tags')
  @ApiOperation({ summary: 'Créer un nouveau tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag créé avec succès',
    type: Tag,
  })
  async createTag(
    @Body() body: { name: string; color?: string; companyId: string },
  ): Promise<Tag> {
    return this.crmService.createTag(body.name, body.color, body.companyId);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Récupérer tous les tags' })
  @ApiQuery({ name: 'companyId', required: true, description: 'ID de la société' })
  @ApiResponse({
    status: 200,
    description: 'Liste des tags',
    type: [Tag],
  })
  async findAllTags(@Query('companyId') companyId: string): Promise<Tag[]> {
    return this.crmService.findAllTags(companyId);
  }

  // ============================================
  // SCORING DES LEADS
  // ============================================

  @Post('contacts/:id/calculate-score')
  @ApiOperation({ summary: 'Calculer le score d\'un lead' })
  @ApiResponse({
    status: 200,
    description: 'Score calculé',
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        category: { type: 'string' },
      },
    },
  })
  async calculateLeadScore(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    const score = await this.leadScoringService.calculateScore(id, companyId);
    const category = this.leadScoringService.getScoreCategory(score);
    return { score, category };
  }

  @Post('leads/calculate-all-scores')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recalculer tous les scores' })
  @ApiResponse({ status: 200, description: 'Scores recalculés' })
  async calculateAllScores(@Query('companyId') companyId: string) {
    await this.leadScoringService.calculateAllScores(companyId);
    return { message: 'Scores recalculés avec succès' };
  }

  @Get('leads/hot')
  @ApiOperation({ summary: 'Obtenir les leads chauds (score >= 70)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Liste des leads chauds',
    type: [Contact],
  })
  async getHotLeads(
    @Query('companyId') companyId: string,
    @Query('minScore') minScore?: number,
  ) {
    return this.leadScoringService.getHotLeads(companyId, minScore);
  }

  // ============================================
  // FORMALISATION (NIF, RCCM)
  // ============================================

  @Get('contacts/:id/formalization-status')
  @ApiOperation({ summary: 'Vérifier le statut de formalisation' })
  @ApiResponse({
    status: 200,
    description: 'Statut de formalisation',
    schema: {
      type: 'object',
      properties: {
        isFormal: { type: 'boolean' },
        hasNIF: { type: 'boolean' },
        hasRCCM: { type: 'boolean' },
        hasVAT: { type: 'boolean' },
        completionRate: { type: 'number' },
        missingSteps: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async checkFormalizationStatus(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.formalizationService.checkFormalizationStatus(id, companyId);
  }

  @Post('contacts/:id/register-nif')
  @ApiOperation({ summary: 'Enregistrer le NIF d\'un contact' })
  @ApiResponse({
    status: 200,
    description: 'NIF enregistré',
    type: Contact,
  })
  @ApiResponse({ status: 400, description: 'Format NIF invalide' })
  async registerNIF(
    @Param('id') id: string,
    @Body() body: { nif: string; companyId: string },
  ) {
    return this.formalizationService.registerNIF(id, body.companyId, body.nif);
  }

  @Post('contacts/:id/register-rccm')
  @ApiOperation({ summary: 'Enregistrer le RCCM d\'un contact' })
  @ApiResponse({
    status: 200,
    description: 'RCCM enregistré',
    type: Contact,
  })
  async registerRCCM(
    @Param('id') id: string,
    @Body() body: { rccm: string; companyId: string },
  ) {
    return this.formalizationService.registerRCCM(id, body.companyId, body.rccm);
  }

  @Get('formalization/informal-contacts')
  @ApiOperation({ summary: 'Obtenir les contacts non formalisés' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Liste des contacts informels',
    type: [Contact],
  })
  async getInformalContacts(@Query('companyId') companyId: string) {
    return this.formalizationService.getInformalContacts(companyId);
  }

  @Get('formalization/report')
  @ApiOperation({ summary: 'Rapport de formalisation' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Statistiques de formalisation',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        formal: { type: 'number' },
        informal: { type: 'number' },
        withNIF: { type: 'number' },
        withRCCM: { type: 'number' },
        withVAT: { type: 'number' },
        formalizationRate: { type: 'number' },
      },
    },
  })
  async getFormalizationReport(@Query('companyId') companyId: string) {
    return this.formalizationService.getFormalizationReport(companyId);
  }
}
