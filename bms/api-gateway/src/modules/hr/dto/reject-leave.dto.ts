import { IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class RejectLeaveDto {
  @IsUUID()
  approverId!: string;

  @IsOptional()
  @MaxLength(1000)
  @IsString()
  comment?: string;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  reason?: string;
}
