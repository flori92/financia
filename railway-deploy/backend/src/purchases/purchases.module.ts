import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseReceipt } from './entities/purchase-receipt.entity';
import { Supplier } from './entities/supplier.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseReceipt, Supplier, Invoice])],
  providers: [PurchasesService],
  controllers: [PurchasesController],
  exports: [PurchasesService],
})
export class PurchasesModule {}
