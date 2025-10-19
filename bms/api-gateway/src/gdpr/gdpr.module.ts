import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdprService } from './gdpr.service';
import { GdprController } from './gdpr.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [GdprService],
  controllers: [GdprController],
  exports: [GdprService],
})
export class GdprModule {}
