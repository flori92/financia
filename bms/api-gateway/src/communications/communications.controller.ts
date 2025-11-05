import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { GetCompany } from '../common/decorators/get-company.decorator';
import { EmailsService } from './services/emails.service';
import { SmsService } from './services/sms.service';
import { WhatsAppService } from './services/whatsapp.service';
import { TemplatesService } from './services/templates.service';
import { CommunicationsService } from './communications.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendWhatsAppDto } from './dto/send-whatsapp.dto';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/create-template.dto';
import { BulkCommunicationDto } from './dto/bulk-communication.dto';

@ApiTags('Communications')
@Controller('api/v1/communications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CommunicationsController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly smsService: SmsService,
    private readonly whatsAppService: WhatsAppService,
    private readonly templatesService: TemplatesService,
    private readonly communicationsService: CommunicationsService,
  ) {}

  // ==================== EMAILS ====================

  @Get('emails')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get all emails' })
  async getEmails(
    @GetCompany() companyId: string,
    @Query('folder') folder?: string,
  ) {
    return this.emailsService.findAll(companyId, folder);
  }

  @Post('emails')
  @RequirePermissions('communications:write')
  @ApiOperation({ summary: 'Send email' })
  async sendEmail(
    @GetCompany() companyId: string,
    @GetUser() userId: string,
    @Body() emailData: SendEmailDto,
  ) {
    return this.emailsService.sendEmail(companyId, userId, emailData);
  }

  @Get('emails/:id')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get email by ID' })
  async getEmail(
    @GetCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.emailsService.findOne(companyId, id);
  }

  // ==================== SMS ====================

  @Get('sms')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get all SMS messages' })
  async getSmsMessages(
    @GetCompany() companyId: string,
  ) {
    return this.smsService.findAll(companyId);
  }

  @Post('sms')
  @RequirePermissions('communications:write')
  @ApiOperation({ summary: 'Send SMS' })
  async sendSms(
    @GetCompany() companyId: string,
    @GetUser() userId: string,
    @Body() smsData: SendSmsDto,
  ) {
    return this.smsService.sendSms(companyId, userId, smsData);
  }

  // ==================== WHATSAPP ====================

  @Get('whatsapp')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get WhatsApp conversations' })
  async getWhatsAppConversations(
    @GetCompany() companyId: string,
  ) {
    return this.whatsAppService.findAll(companyId);
  }

  @Post('whatsapp')
  @RequirePermissions('communications:write')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  async sendWhatsApp(
    @GetCompany() companyId: string,
    @GetUser() userId: string,
    @Body() whatsAppData: SendWhatsAppDto,
  ) {
    return this.whatsAppService.sendMessage(companyId, userId, whatsAppData);
  }

  // ==================== TEMPLATES ====================

  @Get('templates')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get all communication templates' })
  async getTemplates(
    @GetCompany() companyId: string,
    @Query('type') type?: string,
  ) {
    return this.templatesService.findAll(companyId, type);
  }

  @Post('templates')
  @RequirePermissions('communications:write')
  @ApiOperation({ summary: 'Create communication template' })
  async createTemplate(
    @GetCompany() companyId: string,
    @GetUser() userId: string,
    @Body() templateData: CreateTemplateDto,
  ) {
    return this.templatesService.create(companyId, userId, templateData);
  }

  @Get('templates/:id')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(
    @GetCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(companyId, id);
  }

  @Put('templates/:id')
  @RequirePermissions('communications:write')
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @GetCompany() companyId: string,
    @Param('id') id: string,
    @Body() templateData: UpdateTemplateDto,
  ) {
    return this.templatesService.update(companyId, id, templateData);
  }

  @Delete('templates/:id')
  @RequirePermissions('communications:delete')
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(
    @GetCompany() companyId: string,
    @Param('id') id: string,
  ) {
    await this.templatesService.delete(companyId, id);
    return { success: true, message: 'Template deleted' };
  }

  // ==================== BULK & STATS ====================

  @Post('bulk')
  @RequirePermissions('communications:write')
  @ApiOperation({ summary: 'Send bulk communications' })
  async sendBulk(
    @GetCompany() companyId: string,
    @GetUser() userId: string,
    @Body() bulkData: BulkCommunicationDto,
  ) {
    return this.communicationsService.sendBulkCommunication(companyId, userId, bulkData);
  }

  @Get('stats')
  @RequirePermissions('communications:read')
  @ApiOperation({ summary: 'Get communication statistics' })
  async getStats(
    @GetCompany() companyId: string,
  ) {
    return this.communicationsService.getCommunicationStats(companyId);
  }
}