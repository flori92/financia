import { IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class DateRangeDto {
  start: Date;
  end: Date;
}

import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateRangeDto {
    @ApiPropertyOptional()
    start: Date;

    @ApiPropertyOptional()
    end: Date;
}

export class StartReconciliationDto {
    @ApiPropertyOptional({ type: () => DateRangeDto })
    @IsOptional()
    dateRange?: DateRangeDto;
}
