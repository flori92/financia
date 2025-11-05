import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
}

export class BulkCommunicationDto {
  @IsEnum(CommunicationType)
  @IsNotEmpty()
  type: CommunicationType;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  recipients: string[];

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  variables?: Record<string, any>;
}
