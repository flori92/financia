import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async findExpenses(companyId: string, filters?: {
    status?: string;
  }): Promise<Expense[]> {
    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.companyId = :companyId', { companyId });

    if (filters?.status && filters.status !== 'all') {
      queryBuilder.andWhere('expense.status = :status', { status: filters.status });
    }

    return queryBuilder
      .orderBy('expense.date', 'DESC')
      .getMany();
  }

  async createExpense(expenseData: Partial<Expense>, companyId: string): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...expenseData,
      companyId,
      id: undefined, // Laisser la base générer l'ID
      status: 'draft',
      submittedAt: null,
      approvedAt: null,
      approvedBy: null,
    });
    return this.expenseRepository.save(expense);
  }

  async updateExpense(id: string, expenseData: Partial<Expense>, companyId: string): Promise<Expense> {
    await this.expenseRepository.update({ id, companyId }, expenseData);
    return this.expenseRepository.findOne({ where: { id, companyId } });
  }

  async submitExpense(id: string, companyId: string): Promise<Expense> {
    await this.expenseRepository.update({ id, companyId }, {
      status: 'submitted',
      submittedAt: new Date(),
    });
    return this.expenseRepository.findOne({ where: { id, companyId } });
  }

  async approveExpense(id: string, approvedBy: string, companyId: string): Promise<Expense> {
    await this.expenseRepository.update({ id, companyId }, {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
    });
    return this.expenseRepository.findOne({ where: { id, companyId } });
  }

  async rejectExpense(id: string, companyId: string): Promise<Expense> {
    await this.expenseRepository.update({ id, companyId }, {
      status: 'rejected',
      approvedAt: new Date(),
    });
    return this.expenseRepository.findOne({ where: { id, companyId } });
  }

  async deleteExpense(id: string, companyId: string): Promise<void> {
    await this.expenseRepository.delete({ id, companyId });
  }

  async getExpenseStats(companyId: string) {
    const expenses = await this.findExpenses(companyId);
    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      totalExpenses: expenses.length,
      totalAmount,
      draftCount: expenses.filter(e => e.status === 'draft').length,
      submittedCount: expenses.filter(e => e.status === 'submitted').length,
      approvedCount: expenses.filter(e => e.status === 'approved').length,
      rejectedCount: expenses.filter(e => e.status === 'rejected').length,
      recentExpenses: expenses.slice(0, 5),
    };
  }
}
