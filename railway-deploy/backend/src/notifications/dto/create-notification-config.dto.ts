import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsEmail } from 'class-validator';

export class CreateNotificationConfigDto {
  @IsString()
  companyId: string;

  // Email Configuration
  @IsOptional()
  @IsEnum(['console', 'smtp', 'sendgrid'])
  emailProvider?: 'console' | 'smtp' | 'sendgrid';

  @IsOptional()
  @IsString()
  smtpHost?: string;

  @IsOptional()
  @IsNumber()
  smtpPort?: number;

  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @IsOptional()
  @IsString()
  smtpUser?: string;

  @IsOptional()
  @IsString()
  smtpPass?: string;

  @IsOptional()
  @IsString()
  smtpFrom?: string;

  @IsOptional()
  @IsString()
  sendgridApiKey?: string;

  @IsOptional()
  @IsString()
  sendgridFrom?: string;

  // SMS Configuration
  @IsOptional()
  @IsEnum(['console', 'twilio'])
  smsProvider?: 'console' | 'twilio';

  @IsOptional()
  @IsString()
  twilioAccountSid?: string;

  @IsOptional()
  @IsString()
  twilioAuthToken?: string;

  @IsOptional()
  @IsString()
  twilioPhoneNumber?: string;

  // WhatsApp Configuration
  @IsOptional()
  @IsEnum(['console', 'twilio', 'meta'])
  whatsappProvider?: 'console' | 'twilio' | 'meta';

  @IsOptional()
  @IsString()
  twilioWhatsAppNumber?: string;

  @IsOptional()
  @IsString()
  metaAccessToken?: string;

  @IsOptional()
  @IsString()
  metaPhoneNumberId?: string;

  // General Settings
  @IsOptional()
  @IsString()
  frontendUrl?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
