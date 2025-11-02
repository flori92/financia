import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ImportCsvDto {
  @ApiProperty({
    description: 'Contenu du fichier CSV (base64 ou texte brut)',
    example: 'Date,Montant,Libellé,Référence\n2025-01-15,50000,Virement client ABC,REF-001',
  })
  @IsString()
  @IsNotEmpty()
  csvContent: string;

  @ApiProperty({
    description: 'ID de la société',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    description: 'Format du CSV (colonnes attendues)',
    required: false,
    enum: ['standard', 'ecobank', 'orabank', 'boa'],
    default: 'standard',
  })
  @IsOptional()
  @IsString()
  format?: string;
}

export class ReconcileDto {
  @ApiProperty({
    description: 'ID de la transaction bancaire',
  })
  @IsString()
  @IsNotEmpty()
  bankTransactionId: string;

  @ApiProperty({
    description: 'ID du paiement à rapprocher',
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur effectuant le rapprochement',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
