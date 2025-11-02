import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationConfigService } from './notification-config.service';
import { NotificationConfigController } from './notification-config.controller';
import { NotificationConfig } from './entities/notification-config.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NotificationConfig])
  ],
  providers: [NotificationsService, NotificationConfigService],
  controllers: [NotificationConfigController],
  exports: [NotificationsService, NotificationConfigService],
})
export class NotificationsModule {}
