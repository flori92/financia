import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { DirectDebit } from '../entities/direct-debit.entity';

/**
 * Service de gestion des prélèvements automatiques
 */
@Injectable()
export class DirectDebitService {
  constructor(
    @InjectRepository(DirectDebit)
    private directDebitRepository: Repository<DirectDebit>,
  ) {}

  /**
   * Créer un nouveau prélèvement automatique
   */
  async create(data: Partial<DirectDebit>): Promise<DirectDebit> {
    // Calculer la prochaine date d'exécution
    const nextExecutionDate = this.calculateNextExecutionDate(
      data.startDate,
      data.frequency,
      data.dayOfMonth,
    );

    const directDebit = this.directDebitRepository.create({
      ...data,
      nextExecutionDate,
      status: 'active',
    });

    return this.directDebitRepository.save(directDebit);
  }

  /**
   * Récupérer tous les prélèvements d'une entreprise
   */
  async findAll(companyId: string, status?: string): Promise<DirectDebit[]> {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    return this.directDebitRepository.find({
      where,
      order: { nextExecutionDate: 'ASC' },
    });
  }

  /**
   * Récupérer un prélèvement par ID
   */
  async findOne(id: string): Promise<DirectDebit> {
    const directDebit = await this.directDebitRepository.findOne({ where: { id } });
    if (!directDebit) {
      throw new NotFoundException('Prélèvement non trouvé');
    }
    return directDebit;
  }

  /**
   * Mettre à jour un prélèvement
   */
  async update(id: string, data: Partial<DirectDebit>): Promise<DirectDebit> {
    const directDebit = await this.findOne(id);
    Object.assign(directDebit, data);

    // Recalculer la prochaine date si nécessaire
    if (data.frequency || data.dayOfMonth || data.startDate) {
      directDebit.nextExecutionDate = this.calculateNextExecutionDate(
        directDebit.startDate,
        directDebit.frequency,
        directDebit.dayOfMonth,
      );
    }

    return this.directDebitRepository.save(directDebit);
  }

  /**
   * Suspendre un prélèvement
   */
  async suspend(id: string): Promise<DirectDebit> {
    const directDebit = await this.findOne(id);
    directDebit.status = 'suspended';
    return this.directDebitRepository.save(directDebit);
  }

  /**
   * Réactiver un prélèvement
   */
  async reactivate(id: string): Promise<DirectDebit> {
    const directDebit = await this.findOne(id);
    directDebit.status = 'active';
    directDebit.nextExecutionDate = this.calculateNextExecutionDate(
      new Date(),
      directDebit.frequency,
      directDebit.dayOfMonth,
    );
    return this.directDebitRepository.save(directDebit);
  }

  /**
   * Annuler un prélèvement
   */
  async cancel(id: string): Promise<DirectDebit> {
    const directDebit = await this.findOne(id);
    directDebit.status = 'cancelled';
    directDebit.nextExecutionDate = null;
    return this.directDebitRepository.save(directDebit);
  }

  /**
   * Récupérer les prélèvements à exécuter pour une date donnée
   */
  async getDirectDebitsForDate(
    companyId: string,
    date: Date,
  ): Promise<DirectDebit[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.directDebitRepository.find({
      where: {
        companyId,
        status: 'active',
        nextExecutionDate: Between(startOfDay, endOfDay),
      },
    });
  }

  /**
   * Marquer un prélèvement comme exécuté
   */
  async markAsExecuted(id: string): Promise<DirectDebit> {
    const directDebit = await this.findOne(id);
    
    directDebit.lastExecutionDate = new Date();
    
    // Calculer la prochaine date d'exécution
    if (directDebit.frequency !== 'one-time') {
      directDebit.nextExecutionDate = this.calculateNextExecutionDate(
        directDebit.lastExecutionDate,
        directDebit.frequency,
        directDebit.dayOfMonth,
      );

      // Vérifier si on dépasse la date de fin
      if (directDebit.endDate && directDebit.nextExecutionDate > directDebit.endDate) {
        directDebit.status = 'completed';
        directDebit.nextExecutionDate = null;
      }
    } else {
      // Prélèvement unique
      directDebit.status = 'completed';
      directDebit.nextExecutionDate = null;
    }

    return this.directDebitRepository.save(directDebit);
  }

  /**
   * Récupérer les prélèvements à venir (prochains X jours)
   */
  async getUpcomingDirectDebits(
    companyId: string,
    days: number = 30,
  ): Promise<DirectDebit[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    futureDate.setHours(23, 59, 59, 999);

    return this.directDebitRepository.find({
      where: {
        companyId,
        status: 'active',
        nextExecutionDate: Between(today, futureDate),
      },
      order: { nextExecutionDate: 'ASC' },
    });
  }

  /**
   * Calculer le montant total des prélèvements pour une période
   */
  async getTotalForPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const directDebits = await this.directDebitRepository.find({
      where: {
        companyId,
        status: 'active',
        nextExecutionDate: Between(startDate, endDate),
      },
    });

    return directDebits.reduce((sum, dd) => sum + Number(dd.amount || 0), 0);
  }

  /**
   * Calculer la prochaine date d'exécution
   */
  private calculateNextExecutionDate(
    startDate: Date,
    frequency: string,
    dayOfMonth?: number,
  ): Date {
    const next = new Date(startDate);
    
    switch (frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
      
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
      
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
      
      case 'one-time':
        return startDate;
    }

    return next;
  }

  /**
   * Récupérer les statistiques des prélèvements
   */
  async getStatistics(companyId: string): Promise<{
    total: number;
    active: number;
    suspended: number;
    monthlyAmount: number;
    upcomingCount: number;
  }> {
    const all = await this.findAll(companyId);
    const active = all.filter(dd => dd.status === 'active');
    const suspended = all.filter(dd => dd.status === 'suspended');
    
    // Calculer le montant mensuel approximatif
    let monthlyAmount = 0;
    for (const dd of active) {
      if (dd.frequency === 'monthly') {
        monthlyAmount += Number(dd.amount || 0);
      } else if (dd.frequency === 'quarterly') {
        monthlyAmount += Number(dd.amount || 0) / 3;
      } else if (dd.frequency === 'yearly') {
        monthlyAmount += Number(dd.amount || 0) / 12;
      }
    }

    const upcoming = await this.getUpcomingDirectDebits(companyId, 7);

    return {
      total: all.length,
      active: active.length,
      suspended: suspended.length,
      monthlyAmount,
      upcomingCount: upcoming.length,
    };
  }
}
