import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateMatchDto {
    @ApiProperty({
        description: 'Whether to approve or reject the match',
        type: Boolean
    })
    @IsBoolean()
    approved: boolean;
}