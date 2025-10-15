import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * DTO pour allouer un paiement à une facture
 */
export class AllocatePaymentDto {
  @ApiProperty({
    description: 'ID de la facture à payer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  invoiceId: string;

  @ApiProperty({
    description: 'Montant à allouer',
    example: 50000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Remarques sur l\'allocation',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
