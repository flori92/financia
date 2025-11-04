import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsDecimal,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeStatus, ContractType, PaymentMethod } from '../entities/employee.entity';

export class CreateEmployeeDto {
  // Informations personnelles
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @MaxLength(50)
  employeeNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  nationalId?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  country?: string;

  // Statut et contrat
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType;

  @IsDate()
  @Type(() => Date)
  hireDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  // Rémunération
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  grossSalary?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  netSalary?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  // Informations bancaires
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  bankAccount?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  bankIban?: string;

  // Mobile Money
  @IsString()
  @IsOptional()
  @MaxLength(50)
  mobileMoneyProvider?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  mobileMoneyPhone?: string;

  // Congés
  @IsNumber()
  @Min(0)
  @IsOptional()
  annualLeaveDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  remainingLeaveDays?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLeaveUpdate?: Date;

  // Sécurité sociale
  @IsString()
  @IsOptional()
  @MaxLength(50)
  socialSecurityNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  pensionFundId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
