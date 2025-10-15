import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+22997123456', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'BJ', default: 'BJ' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: 'simple', enum: ['simple', 'intermediate', 'expert'] })
  @IsOptional()
  @IsIn(['simple', 'intermediate', 'expert'])
  uxLevel?: 'simple' | 'intermediate' | 'expert';
}
