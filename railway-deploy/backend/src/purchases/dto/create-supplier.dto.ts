import { IsString, IsOptional, MaxLength, IsEmail, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLACKLISTED = 'blacklisted'
}

export class CreateSupplierDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  code?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  address?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  country?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  postalCode?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  taxId?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  registrationNumber?: string;

  @IsEnum(SupplierStatus)
  @IsOptional()
  status?: SupplierStatus;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  website?: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  paymentTerms?: number; // en jours

  @IsString()
  @MaxLength(50)
  @IsOptional()
  currency?: string;
}
