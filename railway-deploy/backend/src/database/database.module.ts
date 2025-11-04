import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';
import { SimpleTestSeedService } from './seeds/simple-test.seed';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    // Pas de forRootAsync ici - déjà configuré dans app.module.ts
    TypeOrmModule.forFeature([
      ...Object.values(entities),
      require('../accounting/entities/journal-entry.entity').JournalEntry,
      require('../accounting/entities/journal-entry-line.entity').JournalEntryLine,
      require('../accounting/entities/account.entity').Account,
      require('../invoices/entities/invoice.entity').Invoice,
      require('../payments/entities/payment.entity').Payment,
      require('../mobile-money/entities/mobile-money-transaction.entity').MobileMoneyTransaction,
    ]),
  ],
  controllers: [SeedController],
  providers: [SimpleTestSeedService],
  exports: [SimpleTestSeedService],
})
export class DatabaseModule {}
