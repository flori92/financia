import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches, IsUrl } from 'class-validator';

export enum WhatsAppMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export class SendWhatsAppDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +22997123456)',
  })
  to: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(WhatsAppMessageType)
  @IsOptional()
  type?: WhatsAppMessageType;

  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsOptional()
  variables?: Record<string, any>;
}
