import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { CreditScore } from './entities/credit-score.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditScore, Invoice, Company])],
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
