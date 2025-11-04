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

  /**
   * Créer une révision budgétaire
   */
  async createRevision(data: {
    companyId: string;
    year: number;
    scenario: string;
    adjustmentRate: number;
  }) {
    // Récupérer le budget actuel de l'année
    const existingBudgets = await this.budgetRepo.find({
      where: { companyId: data.companyId, fiscalYear: data.year },
      relations: ['lines'],
    });

    if (existingBudgets.length === 0) {
      throw new NotFoundException(`Aucun budget trouvé pour l'année ${data.year}`);
    }

    // Créer une nouvelle version basée sur la révision
    const baseBudget = existingBudgets[0];
    const startDate = new Date(data.year, 0, 1);
    const endDate = new Date(data.year, 11, 31);
    
    const revisionBudget = this.budgetRepo.create({
      companyId: data.companyId,
      fiscalYear: data.year,
      name: `${baseBudget.name} - Révision ${data.scenario}`,
      startDate,
      endDate,
      totalAmount: 0,
      consumedAmount: 0,
      version: (baseBudget.version || 1) + 1,
      status: 'draft',
    });

    const savedBudget = await this.budgetRepo.save(revisionBudget);

    // Copier les lignes avec ajustement
    const adjustmentFactor = 1 + (data.adjustmentRate / 100);
    for (const line of baseBudget.lines) {
      const revisedLine = this.lineRepo.create({
        budget: savedBudget,
        accountNumber: line.accountNumber,
        accountName: line.accountName,
        month: line.month,
        plannedAmount: line.plannedAmount * adjustmentFactor,
        actualAmount: line.actualAmount,
        variance: 0,
      });
      await this.lineRepo.save(revisedLine);
    }

    return this.findOne(savedBudget.id);
  }

  /**
   * Créer un nouveau budget prévisionnel
   */
  async createNewBudget(data: {
    companyId: string;
    year: number;
    name: string;
    description?: string;
  }) {
    const startDate = new Date(data.year, 0, 1);
    const endDate = new Date(data.year, 11, 31);
    
    const budget = this.budgetRepo.create({
      companyId: data.companyId,
      fiscalYear: data.year,
      name: data.name,
      startDate,
      endDate,
      totalAmount: 0,
      consumedAmount: 0,
      status: 'draft',
      version: 1,
    });

    const savedBudget = await this.budgetRepo.save(budget);

    // Créer des lignes de budget par défaut (exemple: 12 mois)
    const defaultAccounts = [
      { number: '607000', name: 'Achats' },
      { number: '621000', name: 'Personnel' },
      { number: '622000', name: 'Services' },
      { number: '707000', name: 'Ventes' },
    ];

    for (let month = 1; month <= 12; month++) {
      for (const account of defaultAccounts) {
        const line = this.lineRepo.create({
          budget: savedBudget,
          accountNumber: account.number,
          accountName: account.name,
          month,
          plannedAmount: 0,
          actualAmount: 0,
          variance: 0,
        });
        await this.lineRepo.save(line);
      }
    }

    return this.findOne(savedBudget.id);
  }
}
