import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowEngineService } from './workflow-engine.service';

@ApiTags('automation')
@ApiBearerAuth()
@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly workflowEngine: WorkflowEngineService) {}

  @Post('rules')
  async createRule(@Body() rule: any) {
    return this.workflowEngine.createRule(rule);
  }

  @Get('rules')
  async getRules() {
    return this.workflowEngine.getRules();
  }

  @Get('rules/:id')
  async getRule(@Param('id') id: string) {
    return this.workflowEngine.getRule(id);
  }

  @Put('rules/:id')
  async updateRule(@Param('id') id: string, @Body() updates: any) {
    return this.workflowEngine.updateRule(id, updates);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    await this.workflowEngine.deleteRule(id);
    return { message: 'Rule deleted' };
  }

  @Post('execute')
  async executeWorkflow(@Body() body: { trigger: string; data: any }) {
    await this.workflowEngine.executeWorkflow(body.trigger, body.data);
    return { message: 'Workflow executed' };
  }
}
