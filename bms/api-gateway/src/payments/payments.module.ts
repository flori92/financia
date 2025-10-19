import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { AuditModule } from '../audit/audit.module';
import { AccountingModule } from '../accounting/accounting.module';

// Payment Providers
import { StripeService } from './providers/stripe.service';
import { PayPalService } from './providers/paypal.service';
import { SepaService } from './providers/sepa.service';

/**
 * Module de gestion des paiements
 * - Enregistrement des paiements (cash, bank transfer, mobile money, etc.)
 * - Allocation des paiements aux factures
 * - Rapprochement et réconciliation
 * - Intégrations: Stripe, PayPal, SEPA
 */
@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentAllocation]), AuditModule, AccountingModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PayPalService,
    SepaService,
  ],
  exports: [
    PaymentsService,
    StripeService,
    PayPalService,
    SepaService,
  ],
})
export class PaymentsModule {}
