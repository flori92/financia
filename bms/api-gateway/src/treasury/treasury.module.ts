import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [TreasuryController],
  providers: [TreasuryService],
  exports: [TreasuryService],
})
export class TreasuryModule {}
