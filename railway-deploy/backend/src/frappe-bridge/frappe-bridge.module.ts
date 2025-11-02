import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FrappeApiService } from './services/frappe-api.service';
import { FrappeSyncService } from './services/frappe-sync.service';
import { FrappeBridgeController } from './frappe-bridge.controller';
import { Account } from '../accounting/entities/account.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';

/**
 * Module d'intégration BMS ↔ Frappe/ERPNext
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Account, JournalEntry, Invoice, Payment]),
  ],
  controllers: [FrappeBridgeController],
  providers: [FrappeApiService, FrappeSyncService],
  exports: [FrappeApiService, FrappeSyncService],
})
export class FrappeBridgeModule {}
