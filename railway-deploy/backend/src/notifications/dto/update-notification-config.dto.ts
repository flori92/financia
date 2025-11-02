import { PartialType } from '@nestjs/swagger';
import { CreateNotificationConfigDto } from './create-notification-config.dto';

export class UpdateNotificationConfigDto extends PartialType(CreateNotificationConfigDto) {}
