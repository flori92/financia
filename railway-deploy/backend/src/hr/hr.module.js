const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { HRController } = require('./hr.controller');
const { HRService } = require('./hr.service');
const { HREmployee, HRPayroll, HRLeave } = require('./hr.entity');

@Module({
  imports: [
    TypeOrmModule.forFeature([HREmployee, HRPayroll, HRLeave])
  ],
  controllers: [HRController],
  providers: [HRService],
  exports: [HRService]
})
export class HRModule {}
