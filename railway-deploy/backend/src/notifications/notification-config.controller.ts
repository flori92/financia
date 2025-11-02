import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationConfigService } from './notification-config.service';
import { CreateNotificationConfigDto } from './dto/create-notification-config.dto';
import { UpdateNotificationConfigDto } from './dto/update-notification-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';

@ApiTags('notification-config')
@Controller('notification-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationConfigController {
  constructor(private readonly configService: NotificationConfigService) {}

  @Get()
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Récupérer la configuration des notifications' })
  @ApiResponse({ status: 200, description: 'Configuration récupérée' })
  async getConfig(@CompanyId() companyId: string) {
    const config = await this.configService.findByCompanyId(companyId);
    
    // Mask sensitive data for security
    const maskedConfig = { ...config };
    if (maskedConfig.smtpPass) maskedConfig.smtpPass = '***';
    if (maskedConfig.sendgridApiKey) maskedConfig.sendgridApiKey = '***';
    if (maskedConfig.twilioAuthToken) maskedConfig.twilioAuthToken = '***';
    if (maskedConfig.metaAccessToken) maskedConfig.metaAccessToken = '***';
    
    return maskedConfig;
  }

  @Post()
  @RequirePermissions('settings:create')
  @ApiOperation({ summary: 'Créer une configuration de notifications' })
  @ApiResponse({ status: 201, description: 'Configuration créée' })
  async create(@Body() createConfigDto: CreateNotificationConfigDto) {
    return this.configService.create(createConfigDto);
  }

  @Put()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Mettre à jour la configuration des notifications' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour' })
  async update(
    @CompanyId() companyId: string,
    @Body() updateConfigDto: UpdateNotificationConfigDto,
  ) {
    return this.configService.update(companyId, updateConfigDto);
  }

  @Post('test/email')
  @RequirePermissions('settings:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tester la configuration email' })
  @ApiResponse({ status: 200, description: 'Test effectué' })
  async testEmail(@CompanyId() companyId: string) {
    return this.configService.testEmailConfig(companyId);
  }

  @Post('test/whatsapp')
  @RequirePermissions('settings:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tester la configuration WhatsApp' })
  @ApiResponse({ status: 200, description: 'Test effectué' })
  async testWhatsApp(@CompanyId() companyId: string) {
    return this.configService.testWhatsAppConfig(companyId);
  }

  @Post('test/sms')
  @RequirePermissions('settings:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tester la configuration SMS' })
  @ApiResponse({ status: 200, description: 'Test effectué' })
  async testSms(@CompanyId() companyId: string) {
    return this.configService.testSmsConfig(companyId);
  }
}
