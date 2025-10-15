import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { AuditModule } from '../audit/audit.module';

/**
 * Module de gestion des paiements
 * - Enregistrement des paiements (cash, bank transfer, mobile money, etc.)
 * - Allocation des paiements aux factures
 * - Rapprochement et réconciliation
 */
@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentAllocation]), AuditModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
