import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationConfig } from '../entities/notification-config.entity';
import { CreateNotificationConfigDto } from '../dto/create-notification-config.dto';
import { UpdateNotificationConfigDto } from '../dto/update-notification-config.dto';

@Injectable()
export class NotificationConfigService {
  constructor(
    @InjectRepository(NotificationConfig)
    private configRepo: Repository<NotificationConfig>,
  ) {}

  async findByCompanyId(companyId: string): Promise<NotificationConfig> {
    const config = await this.configRepo.findOne({ where: { companyId } });
    if (!config) {
      // Create default config if not exists
      return this.createDefaultConfig(companyId);
    }
    return config;
  }

  async create(createConfigDto: CreateNotificationConfigDto): Promise<NotificationConfig> {
    const config = this.configRepo.create(createConfigDto);
    return this.configRepo.save(config);
  }

  async update(companyId: string, updateConfigDto: UpdateNotificationConfigDto): Promise<NotificationConfig> {
    const config = await this.findByCompanyId(companyId);
    
    // Mask sensitive data in logs
    const maskedDto = { ...updateConfigDto };
    if (maskedDto.smtpPass) maskedDto.smtpPass = '***';
    if (maskedDto.sendgridApiKey) maskedDto.sendgridApiKey = '***';
    if (maskedDto.twilioAuthToken) maskedDto.twilioAuthToken = '***';
    if (maskedDto.metaAccessToken) maskedDto.metaAccessToken = '***';
    
    console.log('Updating notification config:', maskedDto);
    
    Object.assign(config, updateConfigDto);
    return this.configRepo.save(config);
  }

  async testEmailConfig(companyId: string): Promise<{ success: boolean; message: string }> {
    const config = await this.findByCompanyId(companyId);
    
    try {
      if (!config.emailProvider || config.emailProvider === 'console') {
        return { success: true, message: 'Mode console activé - Messages affichés dans les logs' };
      }

      if (config.emailProvider === 'smtp') {
        if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
          return { success: false, message: 'Configuration SMTP incomplète' };
        }
        // TODO: Test SMTP connection
        return { success: true, message: 'Configuration SMTP valide' };
      }

      if (config.emailProvider === 'sendgrid') {
        if (!config.sendgridApiKey) {
          return { success: false, message: 'Clé API SendGrid manquante' };
        }
        // TODO: Test SendGrid API
        return { success: true, message: 'Configuration SendGrid valide' };
      }

      return { success: false, message: 'Provider non reconnu' };
    } catch (error) {
      return { success: false, message: `Erreur de test: ${error.message}` };
    }
  }

  async testWhatsAppConfig(companyId: string): Promise<{ success: boolean; message: string }> {
    const config = await this.findByCompanyId(companyId);
    
    try {
      if (!config.whatsappProvider || config.whatsappProvider === 'console') {
        return { success: true, message: 'Mode console activé - Messages affichés dans les logs' };
      }

      if (config.whatsappProvider === 'twilio') {
        if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioWhatsAppNumber) {
          return { success: false, message: 'Configuration Twilio WhatsApp incomplète' };
        }
        return { success: true, message: 'Configuration Twilio WhatsApp valide' };
      }

      if (config.whatsappProvider === 'meta') {
        if (!config.metaAccessToken || !config.metaPhoneNumberId) {
          return { success: false, message: 'Configuration Meta WhatsApp incomplète' };
        }
        return { success: true, message: 'Configuration Meta WhatsApp valide' };
      }

      return { success: false, message: 'Provider non reconnu' };
    } catch (error) {
      return { success: false, message: `Erreur de test: ${error.message}` };
    }
  }

  async testSmsConfig(companyId: string): Promise<{ success: boolean; message: string }> {
    const config = await this.findByCompanyId(companyId);
    
    try {
      if (!config.smsProvider || config.smsProvider === 'console') {
        return { success: true, message: 'Mode console activé - Messages affichés dans les logs' };
      }

      if (config.smsProvider === 'twilio') {
        if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
          return { success: false, message: 'Configuration Twilio SMS incomplète' };
        }
        return { success: true, message: 'Configuration Twilio SMS valide' };
      }

      return { success: false, message: 'Provider non reconnu' };
    } catch (error) {
      return { success: false, message: `Erreur de test: ${error.message}` };
    }
  }

  private async createDefaultConfig(companyId: string): Promise<NotificationConfig> {
    const defaultConfig = this.configRepo.create({
      companyId,
      emailProvider: 'console',
      smsProvider: 'console',
      whatsappProvider: 'console',
      smtpPort: 587,
      smtpSecure: false,
      smtpFrom: '"BMS" <noreply@bms.com>',
      sendgridFrom: 'noreply@bms.com',
      frontendUrl: 'https://app.bms.com',
      enabled: true,
    });
    
    return this.configRepo.save(defaultConfig);
  }

  async delete(companyId: string): Promise<void> {
    const config = await this.findByCompanyId(companyId);
    await this.configRepo.remove(config);
  }
}
