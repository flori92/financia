import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { DirectDebitService } from './services/direct-debit.service';
import { Payment } from '../payments/entities/payment.entity';
import { DirectDebit } from './entities/direct-debit.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { CompaniesModule } from '../companies/companies.module';
import { TreasuryScheduler } from './treasury.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, DirectDebit]),
    NotificationsModule,
    CompaniesModule,
  ],
  controllers: [TreasuryController],
  providers: [TreasuryService, DirectDebitService, TreasuryScheduler],
  exports: [TreasuryService, DirectDebitService],
})
export class TreasuryModule {}
