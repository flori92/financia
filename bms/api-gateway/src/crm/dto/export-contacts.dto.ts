import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactStatus, ContactType } from '../entities/contact.entity';

export class ExportContactsDto {
  @ApiPropertyOptional({ description: 'Identifiant société', example: 'uuid' })
  @IsString()
  companyId: string;

  @ApiPropertyOptional({ description: 'Recherche texte (nom, email, société)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContactType })
  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Identifiant commercial assigné' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Tags filtrés', type: [String] })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Séparateur CSV souhaité', example: ';' })
  @IsOptional()
  @IsString()
  delimiter?: string;
}
