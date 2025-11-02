import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { RemindersService } from './services/reminders.service';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { AuditModule } from '../audit/audit.module';
import { AccountingModule } from '../accounting/accounting.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]), 
    AuditModule, 
    AccountingModule,
    NotificationsModule
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, RemindersService],
  exports: [InvoicesService, RemindersService],
})
export class InvoicesModule {}
