import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartReconciliationDto {
    @ApiPropertyOptional({ type: 'object' })
    @IsOptional()
    dateRange?: {
        @IsDateString()
        start: Date;

        @IsDateString()
        end: Date;
    };
}