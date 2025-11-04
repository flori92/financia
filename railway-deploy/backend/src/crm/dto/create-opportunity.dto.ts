import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { OpportunityStatus } from '../entities/opportunity.entity';

export class CreateOpportunityDto {
  @ApiProperty({ description: 'Titre de l\'opportunité' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Montant de l\'opportunité', default: 0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Probabilité de succès (0-100)', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number;

  @ApiProperty({ description: 'Identifiant du contact associé' })
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({ description: 'Identifiant de l\'étape du pipeline' })
  @IsOptional()
  @IsUUID()
  pipelineStageId?: string;

  @ApiPropertyOptional({ description: 'Description de l\'opportunité' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Date de clôture prévue', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  closeDate?: Date;

  @ApiPropertyOptional({ description: 'Identifiant de l\'utilisateur propriétaire' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Tags associés', type: [String] })
  @IsOptional()
  tagIds?: string[];
}
