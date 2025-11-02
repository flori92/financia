import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceItemDto {
  @ApiProperty({ example: 'Consultation juridique' })
  @IsString()
  itemName: string;

  @ApiProperty({ example: 'Consultation pour création SARL', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'heure', default: 'unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  taxPercent?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-company-id' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'sales', enum: ['sales', 'purchase'] })
  @IsIn(['sales', 'purchase'])
  invoiceType: 'sales' | 'purchase';

  @ApiProperty({ example: '2024-10-14', required: false })
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @ApiProperty({ example: '2024-11-14', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 'Entreprise ABC SARL' })
  @IsString()
  partyName: string;

  @ApiProperty({ example: '+22997123456', required: false })
  @IsOptional()
  @IsString()
  partyPhone?: string;

  @ApiProperty({ example: 'contact@abc.com', required: false })
  @IsOptional()
  @IsString()
  partyEmail?: string;

  @ApiProperty({ example: 'XOF', default: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    type: [InvoiceItemDto],
    example: [
      {
        itemName: 'Consultation',
        quantity: 1,
        unitPrice: 50000,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ example: 'mtn', enum: ['mtn', 'moov', 'orange', 'wave'], required: false })
  @IsOptional()
  @IsIn(['mtn', 'moov', 'orange', 'wave'])
  mobileMoneyProvider?: 'mtn' | 'moov' | 'orange' | 'wave';

  @ApiProperty({ example: 'whatsapp', enum: ['whatsapp', 'sms', 'email', 'print'], required: false })
  @IsOptional()
  @IsIn(['whatsapp', 'sms', 'email', 'print'])
  deliveryMethod?: 'whatsapp' | 'sms' | 'email' | 'print';

  @ApiProperty({ description: 'Générer automatiquement l\'écriture comptable correspondante', required: false, default: false })
  @IsOptional()
  autoPostJournal?: boolean;

  @ApiProperty({ description: 'Type de produit pour l\'auto-posting (706 services, 707 marchandises)', required: false, enum: ['goods','services'] })
  @IsOptional()
  @IsIn(['goods','services'])
  autoServiceType?: 'goods' | 'services';
}
