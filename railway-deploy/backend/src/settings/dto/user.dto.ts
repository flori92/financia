import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  TAX_ADMIN = 'tax_admin',
  ACCOUNTANT = 'accountant',
  EXPERT_COMPTABLE = 'expert_comptable',
  BANK_ADMIN = 'bank_admin',
  HR_MANAGER = 'hr_manager',
  MANAGER = 'manager',
  USER = 'user'
}

export enum UserProfile {
  ADMIN = 'admin',
  TAX_ADMIN = 'tax_admin',
  ACCOUNTANT = 'accountant',
  EXPERT_COMPTABLE = 'expert_comptable',
  BANK_ADMIN = 'bank_admin',
  HR_MANAGER = 'hr_manager',
  ENTREPRENEUR = 'entrepreneur',
  MANAGER = 'manager'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export class CreateUserDto {
  @ApiProperty({ description: 'User first name', example: 'Jean' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Dupont' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'User email address', example: 'jean.dupont@company.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'SecurePassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.USER })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional({ description: 'User phone number', example: '+225 07 00 00 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Primary profile (auto-set based on role if not provided)', 
    enum: UserProfile, 
    example: UserProfile.ENTREPRENEUR 
  })
  @IsOptional()
  @IsEnum(UserProfile)
  primaryProfile?: UserProfile;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User first name', example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name', example: 'Dupont' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User email address', example: 'jean.dupont@company.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'User password', example: 'NewSecurePassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'User role', enum: UserRole, example: UserRole.MANAGER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'User active status', example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'User phone number', example: '+225 07 00 00 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Primary profile (auto-updated based on role if not provided)', 
    enum: UserProfile, 
    example: UserProfile.ACCOUNTANT 
  })
  @IsOptional()
  @IsEnum(UserProfile)
  primaryProfile?: UserProfile;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'User active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Company ID' })
  companyId: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  phone?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Last login date' })
  lastLoginAt?: Date;
}

export class UserStatisticsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Number of inactive users' })
  inactiveUsers: number;

  @ApiProperty({ description: 'Users by role' })
  roleStats: Record<string, number>;

  @ApiProperty({ description: 'Recent user logins' })
  recentLogins: Partial<UserResponseDto>[];
}
