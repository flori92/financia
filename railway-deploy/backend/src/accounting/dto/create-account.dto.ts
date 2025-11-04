import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Numéro du compte (ex: 411, 512, 601)',
    example: '411',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  accountNumber: string;

  @ApiProperty({
    description: 'Nom du compte',
    example: 'Clients',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  accountName: string;

  @ApiProperty({
    description: 'Type de compte',
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    example: 'asset',
  })
  @IsEnum(['asset', 'liability', 'equity', 'revenue', 'expense'])
  accountType: string;

  @ApiProperty({
    description: 'Classe SYSCOHADA (1-8)',
    example: 4,
    minimum: 1,
    maximum: 8,
  })
  @IsInt()
  @Min(1)
  @Max(8)
  syscohadaClass: number;

  @ApiProperty({
    description: 'ID du compte parent (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: 'Description du compte',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Le compte est-il actif?',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Devise du compte',
    default: 'XOF',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({
    description: 'ID de la société',
  })
  @IsUUID()
  companyId: string;
}
