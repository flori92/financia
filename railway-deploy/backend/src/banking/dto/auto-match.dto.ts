import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class AutoMatchDto {
  @ApiProperty({ description: 'ID de la société' })
  companyId: string;

  @ApiPropertyOptional({ description: 'Seuil de confiance (0-1)', default: 0.8 })
  threshold?: number;

  @ApiPropertyOptional({ description: 'Nombre max de transactions à traiter', default: 100 })
  limit?: number;
}
