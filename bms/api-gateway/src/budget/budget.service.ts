import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetLine } from './entities/budget-line.entity';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(BudgetLine) private lineRepo: Repository<BudgetLine>,
  ) {}

  async create(data: any) {
    const budget = this.budgetRepo.create(data);
    return this.budgetRepo.save(budget);
  }

  async findAll(companyId: string) {
    return this.budgetRepo.find({ where: { companyId }, relations: ['lines'] });
  }

  async findOne(id: string) {
    const budget = await this.budgetRepo.findOne({ where: { id }, relations: ['lines'] });
    if (!budget) throw new NotFoundException('Budget non trouvé');
    return budget;
  }

  async updateVariances(budgetId: string) {
    const budget = await this.findOne(budgetId);
    for (const line of budget.lines) {
      line.variance = line.actualAmount - line.plannedAmount;
      await this.lineRepo.save(line);
    }
    return this.findOne(budgetId);
  }

  async getAlerts(companyId: string, threshold = 90) {
    const budgets = await this.findAll(companyId);
    const alerts = [];
    for (const budget of budgets) {
      const consumption = (budget.consumedAmount / budget.totalAmount) * 100;
      if (consumption >= threshold) {
        alerts.push({
          budgetId: budget.id,
          budgetName: budget.name,
          consumption,
          message: `Budget ${budget.name} consommé à ${consumption.toFixed(1)}%`,
        });
      }
    }
    return alerts;
  }
}
