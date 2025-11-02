import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'Nom de l\'immobilisation' })
  name: string;

  @ApiProperty({ description: 'Catégorie de l\'immobilisation' })
  category: string;

  @ApiProperty({ description: "Valeur d'acquisition" })
  acquisitionValue: number;

  @ApiProperty({ description: 'Valeur résiduelle' })
  residualValue: number;

  @ApiProperty({ description: 'Date d\'acquisition' })
  acquisitionDate: string;

  @ApiProperty({ description: 'Statut', enum: ['en_service', 'amortis', 'en_cours'], default: 'en_service' })
  status?: 'en_service' | 'amortis' | 'en_cours';

  @ApiProperty({ description: 'Lieu de stockage', required: false })
  location?: string;

  @ApiProperty({ description: 'ID de la société' })
  companyId: string;
}
