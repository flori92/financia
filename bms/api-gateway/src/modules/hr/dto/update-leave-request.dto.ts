import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { HrLeaveType } from '../entities/hr-leave.entity';

export class UpdateLeaveRequestDto {
  @IsUUID()
  companyId!: string;

  @IsOptional()
  @IsEnum(HrLeaveType)
  type?: HrLeaveType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  reason?: string;

  @IsOptional()
  @MaxLength(1000)
  @IsString()
  notes?: string;
}
