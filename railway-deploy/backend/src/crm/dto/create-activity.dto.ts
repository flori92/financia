import { IsString, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, ActivityStatus } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, description: 'Type d\'activité' })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ description: 'Titre de l\'activité' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description détaillée' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID du contact associé' })
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({ description: 'Date d\'échéance' })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({ enum: ActivityStatus, description: 'Statut de l\'activité' })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ description: 'Notes additionnelles' })
  @IsString()
  @IsOptional()
  notes?: string;
}
