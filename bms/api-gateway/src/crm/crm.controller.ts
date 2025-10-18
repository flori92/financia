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
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FilterContactsDto } from './dto/filter-contacts.dto';
import { Contact } from './entities/contact.entity';

/**
 * Contrôleur pour la gestion CRM (Contacts, Opportunités, Activités)
 */
@ApiTags('CRM')
@Controller('crm')
@ApiBearerAuth()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

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

  @Get('contacts/stats')
  @ApiOperation({ summary: 'Obtenir les statistiques des contacts' })
  @ApiQuery({ name: 'companyId', required: true, description: 'ID de la société' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des contacts',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byType: { type: 'object' },
        byStatus: { type: 'object' },
        recentActivity: { type: 'number' },
      },
    },
  })
  async getContactStats(@Query('companyId') companyId: string) {
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
}
