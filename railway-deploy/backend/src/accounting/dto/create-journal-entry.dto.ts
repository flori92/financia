import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JournalEntryLineDto {
  @ApiProperty({
    description: 'ID du compte',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  accountId: string;

  @ApiProperty({
    description: 'Libellé de la ligne',
    example: 'Vente de marchandises',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Montant au débit',
    example: 100000,
    default: 0,
  })
  @IsOptional()
  debit?: number;

  @ApiProperty({
    description: 'Montant au crédit',
    example: 100000,
    default: 0,
  })
  @IsOptional()
  credit?: number;

  @ApiProperty({
    description: 'Référence analytique (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsString()
  analyticReference?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty({
    description: 'Date de l\'écriture comptable',
    example: '2025-10-15',
  })
  @IsDateString()
  entryDate: string;

  @ApiProperty({
    description: 'Référence externe (facture, paiement, etc.)',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: 'Description de l\'écriture',
    example: 'Vente client ACME Corp',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type de journal',
    enum: ['sales', 'purchase', 'bank', 'general'],
    example: 'sales',
  })
  @IsEnum(['sales', 'purchase', 'bank', 'general'])
  journalType: string;

  @ApiProperty({
    description: 'Lignes de l\'écriture (minimum 2)',
    type: [JournalEntryLineDto],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];

  @ApiProperty({
    description: 'ID de la société',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur créateur',
  })
  @IsUUID()
  createdBy: string;
}
