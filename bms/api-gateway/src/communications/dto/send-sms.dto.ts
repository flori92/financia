import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class SendSmsDto {
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

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsOptional()
  variables?: Record<string, any>;
}
