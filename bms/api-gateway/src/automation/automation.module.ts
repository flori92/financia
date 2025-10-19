import { Module } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { AutomationController } from './automation.controller';

@Module({
  providers: [WorkflowEngineService],
  controllers: [AutomationController],
  exports: [WorkflowEngineService],
})
export class AutomationModule {}
