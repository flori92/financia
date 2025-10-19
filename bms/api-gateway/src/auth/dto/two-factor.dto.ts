import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class Disable2FADto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
