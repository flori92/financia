import { IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class ApproveLeaveDto {
  @IsUUID()
  approverId!: string;

  @IsOptional()
  @MaxLength(1000)
  @IsString()
  comment?: string;
}
