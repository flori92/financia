import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentAllocationDto {
  @ApiProperty({
    description: 'ID de la facture à payer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  invoiceId: string;

  @ApiProperty({
    description: 'Montant alloué à cette facture',
    example: 50000,
  })
  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @ApiProperty({
    description: 'Remarques sur l\'allocation',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Date du paiement',
    example: '2025-10-15',
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    description: 'Montant total du paiement',
    example: 100000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Devise',
    default: 'XOF',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({
    description: 'Mode de paiement',
    enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'card'],
    example: 'mobile_money',
  })
  @IsEnum(['cash', 'bank_transfer', 'mobile_money', 'check', 'card'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Référence du paiement (numéro de transaction, chèque, etc.)',
    required: false,
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: 'Type de transaction',
    enum: ['customer', 'supplier'],
    example: 'customer',
  })
  @IsEnum(['customer', 'supplier'])
  partyType: string;

  @ApiProperty({
    description: 'ID du client ou fournisseur',
  })
  @IsUUID()
  partyId: string;

  @ApiProperty({
    description: 'Nom du client/fournisseur (facultatif, utile pour les libellés comptables)',
    required: false,
  })
  @IsOptional()
  @IsString()
  partyName?: string;

  @ApiProperty({
    description: 'ID de la société',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Allocations du paiement aux factures',
    type: [PaymentAllocationDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];

  @ApiProperty({
    description: 'Remarques sur le paiement',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur créateur',
  })
  @IsUUID()
  createdBy: string;

  @ApiProperty({
    description: 'Générer automatiquement l\'écriture comptable correspondante',
    required: false,
    default: false,
  })
  @IsOptional()
  autoPostJournal?: boolean;
}
