import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankingController } from './banking.controller';
import { BankingService } from './banking.service';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Payment } from '../payments/entities/payment.entity';

/**
 * Module de gestion bancaire
 * - Gestion des comptes bancaires
 * - Import de relevés CSV
 * - Rapprochement semi-automatique
 */
@Module({
  imports: [TypeOrmModule.forFeature([BankTransaction, BankAccount, Payment])],
  controllers: [BankingController],
  providers: [BankingService],
  exports: [BankingService],
})
export class BankingModule {}
