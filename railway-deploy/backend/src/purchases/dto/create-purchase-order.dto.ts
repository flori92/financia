import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min, MaxLength, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

class PurchaseOrderItem {
  @IsString()
  @MaxLength(100)
  productId: string;

  @IsString()
  @MaxLength(255)
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  unit?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @MaxLength(100)
  supplierId: string;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItem)
  items: PurchaseOrderItem[];

  @IsString()
  @MaxLength(255)
  @IsOptional()
  reference?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  shippingAddress?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  currency?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}
