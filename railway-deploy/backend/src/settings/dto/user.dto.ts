import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  MANAGER = 'manager',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'Jean Dupont' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email address', example: 'jean.dupont@company.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'SecurePassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

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
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User full name', example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  name?: string;

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

  @ApiPropertyOptional({ description: 'User status', enum: UserStatus, example: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ description: 'User phone number', example: '+225 07 00 00 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'User status', enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ description: 'Company ID' })
  companyId: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  phone?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Last login date' })
  lastLogin?: string;
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
