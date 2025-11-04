import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NifController } from './nif.controller';
import { NifService } from './nif.service';
import { NifRequest } from './entities/nif-request.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NifRequest, Company])],
  controllers: [NifController],
  providers: [NifService],
  exports: [NifService],
})
export class NifModule {}
