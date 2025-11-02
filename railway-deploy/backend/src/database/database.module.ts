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
        const dbHost = configService.get('DATABASE_HOST', 'localhost');
        const dbPort = parseInt(configService.get('DATABASE_PORT', '5432'), 10);
        const dbUser = configService.get('DATABASE_USER', 'postgres');
        const dbPassword = configService.get('DATABASE_PASSWORD', 'postgres');
        const dbName = configService.get('DATABASE_NAME', 'bms_erp');
        
        // Forcer DSN complet pour éviter les problèmes de configuration
        const databaseUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
        
        console.log('🔧 TypeORM config:', { dbHost, dbPort, dbUser, dbName });
        console.log('🔗 Database connection: postgres://****:****@', dbHost, ':', dbPort, '/', dbName);
        
        return {
          type: 'postgres',
          url: databaseUrl,
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
