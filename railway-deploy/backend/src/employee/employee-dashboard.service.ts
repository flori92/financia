import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveRequest, LeaveStatus } from '../employees/entities/leave-request.entity';
import { Timesheet } from '../employees/entities/timesheet.entity';

@Injectable()
export class EmployeeDashboardService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Timesheet)
    private readonly timesheetRepository: Repository<Timesheet>,
  ) {}

  /**
   * Récupère les métriques du dashboard Employé
   */
  async getDashboardMetrics(userId: string, companyId: string): Promise<any> {
    try {
      const [
        employeeInfo,
        leaves,
        payroll,
        tasks,
        alerts,
      ] = await Promise.all([
        this.getEmployeeInfo(userId, companyId),
        this.getLeavesMetrics(userId, companyId),
        this.getPayrollMetrics(userId, companyId),
        this.getTasksMetrics(userId, companyId),
        this.getEmployeeAlerts(userId, companyId),
      ]);

      return {
        kpis: {
          employeeInfo,
          leaves,
          payroll,
          tasks,
        },
        alerts,
        upcomingLeaves: await this.getUpcomingLeaves(userId, companyId),
        recentPayslips: await this.getRecentPayslips(userId, companyId),
      };
    } catch (error) {
      console.error('[EmployeeDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Informations employé
   */
  private async getEmployeeInfo(userId: string, companyId: string): Promise<any> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { userId, companyId },
      });

      if (!employee) {
        return {
          name: 'Non trouvé',
          position: '-',
          department: '-',
          hireDate: null,
          seniorityDays: 0,
        };
      }

      const now = new Date();
      const hireDate = new Date(employee.hireDate);
      const seniorityDays = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position || 'Non défini',
        department: employee.department || 'Non défini',
        hireDate: employee.hireDate,
        seniorityDays,
      };
    } catch (error) {
      return {
        name: 'Erreur',
        position: '-',
        department: '-',
        hireDate: null,
        seniorityDays: 0,
      };
    }
  }

  /**
   * Congés de l'employé
   */
  private async getLeavesMetrics(userId: string, companyId: string): Promise<any> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { userId, companyId },
      });

      if (!employee) {
        return { balance: 0, used: 0, pending: 0, approved: 0 };
      }

      // Solde de congés (simulé, à adapter selon votre logique)
      const balance = 25; // 25 jours par défaut (TODO: ajouter leaveBalance à Employee entity)

      // Congés utilisés cette année
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const usedLeaves = await this.leaveRequestRepository.find({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.APPROVED,
          startDate: { $gte: startOfYear } as any,
        },
      });

      let usedDays = 0;
      usedLeaves.forEach(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        usedDays += days;
      });

      // Demandes en attente
      const pending = await this.leaveRequestRepository.count({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.PENDING_MANAGER,
        },
      });

      // Congés approuvés à venir
      const approved = await this.leaveRequestRepository.count({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.APPROVED,
          startDate: { $gte: now } as any,
        },
      });

      return {
        balance,
        used: usedDays,
        remaining: balance - usedDays,
        pending,
        approved,
      };
    } catch (error) {
      return { balance: 0, used: 0, remaining: 0, pending: 0, approved: 0 };
    }
  }

  /**
   * Métriques paie
   */
  private async getPayrollMetrics(userId: string, companyId: string): Promise<any> {
    try {
      // TODO: Intégrer avec module Payroll quand il sera créé
      return { lastSalary: 0, ytdGross: 0, ytdNet: 0, slipsCount: 0 };
    } catch (error) {
      return { lastSalary: 0, ytdGross: 0, ytdNet: 0, slipsCount: 0 };
    }
  }

  /**
   * Tâches et objectifs (simulé)
   */
  private async getTasksMetrics(userId: string, companyId: string): Promise<any> {
    try {
      // TODO: Implémenter avec module tâches/objectifs
      return {
        tasksTotal: 0,
        tasksCompleted: 0,
        tasksOverdue: 0,
        objectivesProgress: 0,
      };
    } catch (error) {
      return { tasksTotal: 0, tasksCompleted: 0, tasksOverdue: 0, objectivesProgress: 0 };
    }
  }

  /**
   * Alertes employé
   */
  private async getEmployeeAlerts(userId: string, companyId: string): Promise<any[]> {
    const alerts = [];

    try {
      const employee = await this.employeeRepository.findOne({
        where: { userId, companyId },
      });

      if (!employee) {
        return [{
          type: 'danger',
          title: 'Profil non trouvé',
          message: 'Impossible de charger votre profil employé',
        }];
      }

      // Demandes de congé en attente
      const pendingLeaves = await this.leaveRequestRepository.count({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.PENDING_MANAGER,
        },
      });

      if (pendingLeaves > 0) {
        alerts.push({
          type: 'info',
          title: 'Demandes en cours',
          message: `${pendingLeaves} demande(s) de congé en attente de validation`,
        });
      }

      // Solde de congés faible
      const leaves = await this.getLeavesMetrics(userId, companyId);
      if (leaves.remaining < 5 && leaves.remaining > 0) {
        alerts.push({
          type: 'warning',
          title: 'Solde de congés faible',
          message: `Il vous reste ${leaves.remaining} jour(s) de congé`,
        });
      }

      // TODO: Intégrer avec module Payroll pour fiche de paie

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Bienvenue',
          message: 'Aucune action requise pour le moment',
        });
      }
    } catch (error) {
      console.error('[EmployeeDashboard] Erreur getEmployeeAlerts:', error);
    }

    return alerts;
  }

  /**
   * Congés à venir
   */
  private async getUpcomingLeaves(userId: string, companyId: string): Promise<any[]> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { userId, companyId },
      });

      if (!employee) return [];

      const now = new Date();

      const upcomingLeaves = await this.leaveRequestRepository.find({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.APPROVED,
          startDate: { $gte: now } as any,
        },
        order: { startDate: 'ASC' },
        take: 5,
      });

      return upcomingLeaves.map(leave => ({
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: leave.leaveType,
        days: Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Fiches de paie récentes
   */
  private async getRecentPayslips(userId: string, companyId: string): Promise<any[]> {
    try {
      // TODO: Intégrer avec module Payroll
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Métriques par défaut en cas d'erreur
   */
  private getDefaultMetrics(): any {
    return {
      kpis: {
        employeeInfo: {
          name: 'Chargement...',
          position: '-',
          department: '-',
          hireDate: null,
          seniorityDays: 0,
        },
        leaves: { balance: 0, used: 0, remaining: 0, pending: 0, approved: 0 },
        payroll: { lastSalary: 0, ytdGross: 0, ytdNet: 0, slipsCount: 0 },
        tasks: { tasksTotal: 0, tasksCompleted: 0, tasksOverdue: 0, objectivesProgress: 0 },
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger vos données',
        },
      ],
      upcomingLeaves: [],
      recentPayslips: [],
    };
  }
}
