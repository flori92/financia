import { IsString, IsOptional, MaxLength, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum WarehouseType {
  MAIN = 'main',
  SECONDARY = 'secondary',
  TEMPORARY = 'temporary'
}

class WarehouseLocation {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;
}

export class CreateWarehouseDto {
  @IsString()
  @MaxLength(255)
  name: string;

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
  @MaxLength(50)
  @IsOptional()
  phone?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  email?: string;

  @IsEnum(WarehouseType)
  @IsOptional()
  type?: WarehouseType;

  @IsNumber()
  @IsOptional()
  totalCapacity?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseLocation)
  @IsOptional()
  locations?: WarehouseLocation[];

  @IsString()
  @MaxLength(50)
  @IsOptional()
  manager?: string;
}
