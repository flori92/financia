import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRFQDto {
  @ApiProperty({ description: 'Titre de l\'appel d\'offres' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description détaillée' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Budget estimatif' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ description: 'Spécifications techniques' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ description: 'Date limite de réponse' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
