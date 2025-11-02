import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RFQ } from './entities/rfq.entity';
import { RFQResponse } from './entities/rfq-response.entity';
import { RFQService } from './rfq.service';
import { RFQController } from './rfq.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RFQ, RFQResponse])],
  controllers: [RFQController],
  providers: [RFQService],
  exports: [RFQService],
})
export class RFQModule {}
