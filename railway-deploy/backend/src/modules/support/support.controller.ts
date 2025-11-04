import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TicketingService } from './ticketing.service';
import { KnowledgeBaseService } from './knowledge-base.service';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(
    private readonly ticketingService: TicketingService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
  ) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Créer un ticket' })
  async createTicket(@Body() data: any) {
    return this.ticketingService.createTicket(data);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Liste des tickets' })
  async getTickets(@Query('companyId') companyId: string) {
    return [];
  }

  @Put('tickets/:id')
  @ApiOperation({ summary: 'Mettre à jour un ticket' })
  async updateTicket(@Param('id') id: string, @Body() data: any) {
    return this.ticketingService.updateTicket(id, data);
  }

  @Post('tickets/:id/escalate')
  @ApiOperation({ summary: 'Escalader un ticket' })
  async escalateTicket(@Param('id') id: string) {
    return this.ticketingService.escalate(id);
  }

  @Post('tickets/:id/resolve')
  @ApiOperation({ summary: 'Résoudre un ticket' })
  async resolveTicket(@Param('id') id: string, @Body() data: any) {
    return this.ticketingService.resolveTicket(id, data.resolution);
  }

  @Get('tickets/:id/sla')
  @ApiOperation({ summary: 'Vérifier le SLA' })
  async checkSLA(@Param('id') id: string) {
    return this.ticketingService.checkSLA(id);
  }

  @Post('kb/articles')
  @ApiOperation({ summary: 'Créer un article' })
  async createArticle(@Body() data: any) {
    return this.knowledgeBaseService.createArticle(data);
  }

  @Get('kb/articles')
  @ApiOperation({ summary: 'Rechercher des articles' })
  async searchArticles(@Query('q') query: string) {
    return this.knowledgeBaseService.searchArticles(query);
  }

  @Post('kb/articles/:id/publish')
  @ApiOperation({ summary: 'Publier un article' })
  async publishArticle(@Param('id') id: string) {
    return this.knowledgeBaseService.publishArticle(id);
  }
}
