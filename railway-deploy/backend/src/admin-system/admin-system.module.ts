import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSystemController } from './admin-system.controller';
import { AdminSystemDashboardService } from './admin-system-dashboard.service';
import { User } from '../auth/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, JournalEntry]),
  ],
  controllers: [AdminSystemController],
  providers: [AdminSystemDashboardService],
  exports: [AdminSystemDashboardService],
})
export class AdminSystemModule {}
