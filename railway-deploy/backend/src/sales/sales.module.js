const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { SalesController } = require('./sales.controller');
const { SalesService } = require('./sales.service');
const { SalesQuote, SalesOrder, SalesClient } = require('./sales.entity');

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesQuote, SalesOrder, SalesClient])
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService]
})
export class SalesModule {}
