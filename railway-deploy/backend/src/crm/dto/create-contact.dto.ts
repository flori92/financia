import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ContactType } from '../entities/contact.entity';

export class CreateContactDto {
  @ApiProperty({ enum: ContactType, example: ContactType.CLIENT })
  @IsEnum(ContactType)
  type: ContactType;

  @ApiProperty({ description: 'Identifiant de la société' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiPropertyOptional({ description: "Nom de l'entreprise" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional({ description: 'Prénom du contact' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Nom du contact' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Poste/Fonction' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  position?: string;

  @ApiPropertyOptional({ description: 'Adresse e-mail', example: 'contact@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ description: 'Numéro de mobile' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  mobile?: string;

  @ApiPropertyOptional({ description: 'Site web' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'Adresse' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Complément d\'adresse' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'Ville' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ description: 'Code postal' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Pays (code ISO2)', default: 'BJ' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ description: 'Identifiant fiscal' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  taxId?: string;

  @ApiPropertyOptional({ description: 'Numéro TVA' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  vatNumber?: string;

  @ApiPropertyOptional({ description: 'Prochaine relance', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: Date;

  @ApiPropertyOptional({ description: 'Score (0-100)', default: 0 })
  @IsOptional()
  @IsNumber()
  leadScore?: number;

  @ApiPropertyOptional({ description: 'Notes internes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Identifiant utilisateur assigné' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Source du contact' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Tags associés', type: [String] })
  @IsOptional()
  @IsArray()
  tagIds?: string[];
}
