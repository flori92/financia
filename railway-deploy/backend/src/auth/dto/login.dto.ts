import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}
