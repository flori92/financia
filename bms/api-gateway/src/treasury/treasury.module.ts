import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { Payment } from '../payments/entities/payment.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { CompaniesModule } from '../companies/companies.module';
import { TreasuryScheduler } from './treasury.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    NotificationsModule,
    CompaniesModule,
  ],
  controllers: [TreasuryController],
  providers: [TreasuryService, TreasuryScheduler],
  exports: [TreasuryService],
})
export class TreasuryModule {}
