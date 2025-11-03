import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('CRM')
@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('contacts')
  @ApiOperation({ summary: 'Créer un nouveau contact' })
  @ApiResponse({ status: 201, description: 'Contact créé avec succès' })
  async createContact(@Body() createContactDto: CreateContactDto, @Query('companyId') companyId: string) {
    const contact = await this.crmService.createContact(createContactDto, companyId);
    return {
      success: true,
      data: contact,
      message: 'Contact créé avec succès'
    };
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Lister tous les contacts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des contacts' })
  async findAllContacts(
    @Query('companyId') companyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.crmService.findAllContacts(companyId, {
      page,
      limit,
      search,
      type,
      status,
    });
    return {
      success: true,
      ...result,
    };
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Obtenir un contact par ID' })
  @ApiParam({ name: 'id', description: 'ID du contact' })
  @ApiResponse({ status: 200, description: 'Détails du contact' })
  async findContactById(@Param('id') id: string, @Query('companyId') companyId: string) {
    const contact = await this.crmService.findContactById(id, companyId);
    if (!contact) {
      return {
        success: false,
        message: 'Contact non trouvé'
      };
    }
    return {
      success: true,
      data: contact,
    };
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  @ApiParam({ name: 'id', description: 'ID du contact' })
  @ApiResponse({ status: 200, description: 'Contact mis à jour' })
  async updateContact(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateContactDto>,
    @Query('companyId') companyId: string,
  ) {
    const contact = await this.crmService.updateContact(id, updateData, companyId);
    return {
      success: true,
      data: contact,
      message: 'Contact mis à jour avec succès'
    };
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Archiver un contact' })
  @ApiParam({ name: 'id', description: 'ID du contact' })
  @ApiResponse({ status: 200, description: 'Contact archivé' })
  async deleteContact(@Param('id') id: string, @Query('companyId') companyId: string) {
    await this.crmService.deleteContact(id, companyId);
    return {
      success: true,
      message: 'Contact archivé avec succès'
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques CRM' })
  @ApiResponse({ status: 200, description: 'Statistiques CRM' })
  async getStats(@Query('companyId') companyId: string) {
    const stats = await this.crmService.getContactsStats(companyId);
    return {
      success: true,
      data: stats,
    };
  }
}
