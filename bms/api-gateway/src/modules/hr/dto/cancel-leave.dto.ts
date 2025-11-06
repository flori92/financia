import { IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class CancelLeaveDto {
  @IsUUID()
  cancelledBy!: string;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  reason?: string;
}
