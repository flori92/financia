import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';
import { SimpleTestSeedService } from './seeds/simple-test.seed';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Debug: Afficher les variables DB
        console.log('🔍 DATABASE_HOST:', configService.get('DATABASE_HOST'));
        console.log('🔍 DATABASE_PORT:', configService.get('DATABASE_PORT'));
        console.log('🔍 DATABASE_USER:', configService.get('DATABASE_USER'));
        console.log('🔍 DATABASE_NAME:', configService.get('DATABASE_NAME'));
        
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: parseInt(configService.get('DATABASE_PORT', '5432'), 10),
          username: configService.get('DATABASE_USER', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'postgres'),
          database: configService.get('DATABASE_NAME', 'bms_erp'),
          entities: Object.values(entities),
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
    }),
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
