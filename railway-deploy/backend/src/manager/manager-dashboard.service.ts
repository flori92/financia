import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../employees/entities/employee.entity';
import { LeaveRequest } from '../employees/entities/leave-request.entity';

@Injectable()
export class ManagerDashboardService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  /**
   * Récupère les métriques du dashboard Manager
   */
  async getDashboardMetrics(userId: string, companyId: string): Promise<any> {
    try {
      const [
        teamSize,
        absences,
        performance,
        projects,
        alerts,
      ] = await Promise.all([
        this.getTeamSizeMetrics(userId, companyId),
        this.getTeamAbsencesMetrics(userId, companyId),
        this.getTeamPerformanceMetrics(userId, companyId),
        this.getProjectsMetrics(userId, companyId),
        this.getManagerAlerts(userId, companyId),
      ]);

      return {
        kpis: {
          teamSize,
          absences,
          performance,
          projects,
        },
        alerts,
        teamMembers: await this.getTeamMembers(userId, companyId),
        upcomingLeaves: await this.getUpcomingLeaves(userId, companyId),
      };
    } catch (error) {
      console.error('[ManagerDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Taille de l'équipe
   */
  private async getTeamSizeMetrics(userId: string, companyId: string): Promise<any> {
    try {
      // Membres actifs de l'équipe
      const teamMembers = await this.employeeRepository.count({
        where: {
          companyId,
          status: EmployeeStatus.ACTIVE,
          managerId: userId,
        },
      });

      // Nouveaux ce mois
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newThisMonth = await this.employeeRepository.count({
        where: {
          companyId,
          status: EmployeeStatus.ACTIVE,
          managerId: userId,
          hireDate: { $gte: startOfMonth } as any,
        },
      });

      return {
        totalMembers: teamMembers,
        newThisMonth,
      };
    } catch (error) {
      return { totalMembers: 0, newThisMonth: 0 };
    }
  }

  /**
   * Absences de l'équipe
   */
  private async getTeamAbsencesMetrics(userId: string, companyId: string): Promise<any> {
    try {
      const now = new Date();

      // Absents aujourd'hui
      const todayAbsences = await this.leaveRequestRepository
        .createQueryBuilder('leave')
        .leftJoin('leave.employee', 'employee')
        .where('employee.manager_id = :userId', { userId })
        .andWhere('employee.company_id = :companyId', { companyId })
        .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
        .andWhere('leave.start_date <= :now', { now })
        .andWhere('leave.end_date >= :now', { now })
        .getCount();

      // Demandes en attente
      const pendingRequests = await this.leaveRequestRepository
        .createQueryBuilder('leave')
        .leftJoin('leave.employee', 'employee')
        .where('employee.manager_id = :userId', { userId })
        .andWhere('employee.company_id = :companyId', { companyId })
        .andWhere('leave.status = :status', { status: LeaveStatus.PENDING })
        .getCount();

      return {
        todayAbsences,
        pendingRequests,
      };
    } catch (error) {
      return { todayAbsences: 0, pendingRequests: 0 };
    }
  }

  /**
   * Performance de l'équipe (simulé)
   */
  private async getTeamPerformanceMetrics(userId: string, companyId: string): Promise<any> {
    try {
      // TODO: Implémenter avec module performance/objectives
      // Pour l'instant, retourner des valeurs simulées
      return {
        averageScore: 0,
        objectivesCompleted: 0,
        objectivesTotal: 0,
        completionRate: 0,
      };
    } catch (error) {
      return { averageScore: 0, objectivesCompleted: 0, objectivesTotal: 0, completionRate: 0 };
    }
  }

  /**
   * Projets en cours (simulé)
   */
  private async getProjectsMetrics(userId: string, companyId: string): Promise<any> {
    try {
      // TODO: Implémenter avec module projets
      // Pour l'instant, retourner des valeurs simulées
      return {
        activeProjects: 0,
        completedThisMonth: 0,
        tasksOverdue: 0,
      };
    } catch (error) {
      return { activeProjects: 0, completedThisMonth: 0, tasksOverdue: 0 };
    }
  }

  /**
   * Alertes manager
   */
  private async getManagerAlerts(userId: string, companyId: string): Promise<any[]> {
    const alerts = [];

    try {
      // Demandes de congé en attente
      const pendingLeaves = await this.leaveRequestRepository
        .createQueryBuilder('leave')
        .leftJoin('leave.employee', 'employee')
        .where('employee.manager_id = :userId', { userId })
        .andWhere('employee.company_id = :companyId', { companyId })
        .andWhere('leave.status = :status', { status: LeaveStatus.PENDING })
        .getCount();

      if (pendingLeaves > 0) {
        alerts.push({
          type: 'warning',
          title: 'Demandes de congé',
          message: `${pendingLeaves} demande(s) à valider`,
        });
      }

      // Absents aujourd'hui
      const todayAbsences = await this.getTeamAbsencesMetrics(userId, companyId);
      if (todayAbsences.todayAbsences > 0) {
        alerts.push({
          type: 'info',
          title: 'Équipe absente',
          message: `${todayAbsences.todayAbsences} membre(s) absent(s) aujourd'hui`,
        });
      }

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Équipe au complet',
          message: 'Pas d\'actions urgentes requises',
        });
      }
    } catch (error) {
      console.error('[ManagerDashboard] Erreur getManagerAlerts:', error);
    }

    return alerts;
  }

  /**
   * Membres de l'équipe
   */
  private async getTeamMembers(userId: string, companyId: string): Promise<any[]> {
    try {
      const members = await this.employeeRepository.find({
        where: {
          companyId,
          status: EmployeeStatus.ACTIVE,
          managerId: userId,
        },
        take: 20,
      });

      return members.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        position: member.position,
        department: member.department,
        email: member.email,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Congés à venir (7 prochains jours)
   */
  private async getUpcomingLeaves(userId: string, companyId: string): Promise<any[]> {
    try {
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const upcomingLeaves = await this.leaveRequestRepository
        .createQueryBuilder('leave')
        .leftJoinAndSelect('leave.employee', 'employee')
        .where('employee.manager_id = :userId', { userId })
        .andWhere('employee.company_id = :companyId', { companyId })
        .andWhere('leave.status = :status', { status: LeaveStatus.APPROVED })
        .andWhere('leave.start_date >= :now', { now })
        .andWhere('leave.start_date <= :in7Days', { in7Days })
        .orderBy('leave.start_date', 'ASC')
        .getMany();

      return upcomingLeaves.map(leave => ({
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
        startDate: leave.startDate,
        endDate: leave.endDate,
        type: leave.leaveType,
      }));
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
        teamSize: { totalMembers: 0, newThisMonth: 0 },
        absences: { todayAbsences: 0, pendingRequests: 0 },
        performance: { averageScore: 0, objectivesCompleted: 0, objectivesTotal: 0, completionRate: 0 },
        projects: { activeProjects: 0, completedThisMonth: 0, tasksOverdue: 0 },
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données de l\'équipe',
        },
      ],
      teamMembers: [],
      upcomingLeaves: [],
    };
  }
}
