import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitLeaveDto {
  @IsOptional()
  @MaxLength(1000)
  @IsString()
  notes?: string;
}
