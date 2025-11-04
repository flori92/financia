import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import { Expense } from './entities/expense.entity';

@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('expenses')
  async findExpenses(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ) {
    return this.hrService.findExpenses(companyId, { status });
  }

  @Get('expenses/stats')
  async getExpenseStats(@Query('companyId') companyId: string) {
    return this.hrService.getExpenseStats(companyId);
  }

  @Get('expenses/:id')
  async findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.hrService.findExpenses(companyId).then(expenses => 
      expenses.find(e => e.id === id)
    );
  }

  @Post('expenses')
  async create(@Body() createExpenseDto: Partial<Expense>, @Query('companyId') companyId: string) {
    return this.hrService.createExpense(createExpenseDto, companyId);
  }

  @Put('expenses/:id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: Partial<Expense>,
    @Query('companyId') companyId: string,
  ) {
    return this.hrService.updateExpense(id, updateExpenseDto, companyId);
  }

  @Post('expenses/:id/submit')
  async submit(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.hrService.submitExpense(id, companyId);
  }

  @Post('expenses/:id/approve')
  async approve(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
    @Query('companyId') companyId: string,
  ) {
    return this.hrService.approveExpense(id, approvedBy, companyId);
  }

  @Post('expenses/:id/reject')
  async reject(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.hrService.rejectExpense(id, companyId);
  }

  @Delete('expenses/:id')
  async remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.hrService.deleteExpense(id, companyId);
  }
}
