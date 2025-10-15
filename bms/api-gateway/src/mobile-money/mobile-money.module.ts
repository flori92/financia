import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MobileMoneyController } from './mobile-money.controller';
import { MobileMoneyService } from './mobile-money.service';
import { MobileMoneyTransaction } from './entities/mobile-money-transaction.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { KkiapayProvider } from './providers/kkiapay.provider';
import { FedaPayProvider } from './providers/fedapay.provider';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MobileMoneyTransaction, Invoice, Payment]),
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [MobileMoneyController],
  providers: [MobileMoneyService, KkiapayProvider, FedaPayProvider],
  exports: [MobileMoneyService],
})
export class MobileMoneyModule {}
