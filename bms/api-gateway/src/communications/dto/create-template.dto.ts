import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
}

export enum TemplateCategory {
  INVOICE = 'invoice',
  REMINDER = 'reminder',
  WELCOME = 'welcome',
  PAYMENT = 'payment',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  OTHER = 'other',
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TemplateType)
  @IsNotEmpty()
  type: TemplateType;

  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
