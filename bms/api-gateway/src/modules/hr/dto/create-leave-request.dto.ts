import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { HrLeaveType } from '../entities/hr-leave.entity';

export class CreateLeaveRequestDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  employeeId!: string;

  @IsEnum(HrLeaveType)
  type!: HrLeaveType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  reason?: string;
}
