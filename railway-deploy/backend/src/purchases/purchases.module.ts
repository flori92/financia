import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseReceipt } from './entities/purchase-receipt.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { RFQModule } from '../modules/purchases/rfq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PurchaseReceipt, Invoice]),
    RFQModule
  ],
  providers: [PurchasesService],
  controllers: [PurchasesController],
  exports: [PurchasesService],
})
export class PurchasesModule {}
