import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactStatus, ContactType } from '../entities/contact.entity';

export class ImportContactsDto {
  @ApiProperty({ description: 'Identifiant de la société pour laquelle importer les contacts' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Contenu CSV des contacts', example: 'email;firstName\nfoo@bar.com;Jean' })
  @IsString()
  csvContent: string;

  @ApiPropertyOptional({ description: 'Nom du fichier d\'origine', example: 'contacts.csv' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'Délimiteur à utiliser (auto si non fourni)', example: ';' })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiPropertyOptional({ description: 'Identifiant utilisateur ayant déclenché l\'import' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Type par défaut si absent dans le CSV',
    enum: ContactType,
    default: ContactType.PROSPECT,
  })
  @IsOptional()
  @IsEnum(ContactType)
  defaultType?: ContactType;

  @ApiPropertyOptional({
    description: 'Statut par défaut si absent dans le CSV',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ContactStatus)
  defaultStatus?: ContactStatus;
}
