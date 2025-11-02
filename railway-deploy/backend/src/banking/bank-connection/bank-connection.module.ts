import { Module } from '@nestjs/common';
import { BankConnectionService } from './services/bank-connection.service';
import { BankConnectionController } from './controllers/bank-connection.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankConnection } from './entities/bank-connection.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([BankConnection])
    ],
    controllers: [BankConnectionController],
    providers: [BankConnectionService],
    exports: [BankConnectionService]
})
export class BankConnectionModule {}