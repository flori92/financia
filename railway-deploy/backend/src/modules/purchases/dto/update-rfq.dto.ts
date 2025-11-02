import { PartialType } from '@nestjs/swagger';
import { CreateRFQDto } from './create-rfq.dto';

export class UpdateRFQDto extends PartialType(CreateRFQDto) {}
