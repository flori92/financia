import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnifiedDashboardService } from './services/unified-dashboard.service';
import { DashboardPreloadService } from './services/dashboard-preload.service';
import { DashboardController } from './dashboard.controller';
import { DashboardGateway } from './dashboard.gateway';
import { AccountingModule } from '../accounting/accounting.module';
import { CrmModule } from '../crm/crm.module';
import { TreasuryModule } from '../treasury/treasury.module';
import { CommonModule } from '../common/common.module';
import { CompaniesModule } from '../companies/companies.module';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    CommonModule,
    AccountingModule,
    CrmModule,
    TreasuryModule,
    CompaniesModule,
    TypeOrmModule.forFeature([Company]),
  ],
  controllers: [DashboardController],
  providers: [
    UnifiedDashboardService,
    DashboardPreloadService,
    DashboardGateway,
  ],
  exports: [UnifiedDashboardService],
})
export class DashboardModule {}

