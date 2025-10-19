import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounting/entities/account.entity';
import { CostAccountingService } from './services/cost-accounting.service';
import { BreakevenService } from './services/breakeven.service';
import { ControllingController } from './controlling.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [CostAccountingService, BreakevenService],
  controllers: [ControllingController],
  exports: [CostAccountingService, BreakevenService],
})
export class ControllingModule {}
