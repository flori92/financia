import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { MobileMoneyTransaction } from '../mobile-money/entities/mobile-money-transaction.entity';
import { BankTransaction } from '../banking/entities/bank-transaction.entity';
import { AuditModule } from '../audit/audit.module';
import { AccountingModule } from '../accounting/accounting.module';

// Payment Providers
import { StripeService } from './providers/stripe.service';
import { PayPalService } from './providers/paypal.service';

/**
 * Module de gestion des paiements
 * - Enregistrement des paiements (cash, bank transfer, mobile money, etc.)
 * - Allocation des paiements aux factures
 * - Rapprochement et réconciliation
 * - Intégrations: Stripe, PayPal, SEPA
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment, 
      PaymentAllocation, 
      MobileMoneyTransaction, 
      BankTransaction
    ]), 
    AuditModule, 
    AccountingModule
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PayPalService,
  ],
  exports: [
    PaymentsService,
    StripeService,
    PayPalService,
  ],
})
export class PaymentsModule {}
