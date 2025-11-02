import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { AuditModule } from '../audit/audit.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem]), AuditModule, AccountingModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
