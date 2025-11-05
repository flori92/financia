import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsEmail()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  cc?: string;

  @IsString()
  @IsOptional()
  bcc?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsOptional()
  variables?: Record<string, any>;
}
