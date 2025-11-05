import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus, ContractType } from '../employees/entities/employee.entity';
import { LeaveRequest, LeaveStatus } from '../employees/entities/leave-request.entity';

@Injectable()
export class HrManagerDashboardService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  /**
   * Récupère les métriques du dashboard RH Manager
   */
  async getDashboardMetrics(companyId: string): Promise<any> {
    try {
      const [
        workforce,
        absences,
        payrollCosts,
        turnover,
        recruitments,
        alerts,
      ] = await Promise.all([
        this.getWorkforceMetrics(companyId),
        this.getAbsencesMetrics(companyId),
        this.getPayrollCostsMetrics(companyId),
        this.getTurnoverMetrics(companyId),
        this.getRecruitmentsMetrics(companyId),
        this.getHrAlerts(companyId),
      ]);

      return {
        kpis: {
          workforce,
          absences,
          payrollCosts,
          turnover,
          recruitments,
        },
        alerts,
        departmentBreakdown: await this.getDepartmentBreakdown(companyId),
        evolutionChart: await this.getEvolutionChart(companyId),
        topPositions: await this.getTopPositions(companyId),
      };
    } catch (error) {
      console.error('[HrManagerDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Effectifs (actifs, CDI/CDD, nouveaux ce mois)
   */
  private async getWorkforceMetrics(companyId: string): Promise<any> {
    try {
      // Total employés actifs
      const totalActive = await this.employeeRepository.count({
        where: { 
          companyId,
          status: EmployeeStatus.ACTIVE,
        },
      });

      // Par type de contrat
      const cdi = await this.employeeRepository.count({
        where: { 
          companyId,
          status: EmployeeStatus.ACTIVE,
          contractType: ContractType.PERMANENT,
        },
      });

      const cdd = await this.employeeRepository.count({
        where: { 
          companyId,
          status: EmployeeStatus.ACTIVE,
          contractType: ContractType.FIXED_TERM,
        },
      });

      // Nouveaux ce mois
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newThisMonth = await this.employeeRepository.count({
        where: { 
          companyId,
          status: EmployeeStatus.ACTIVE,
          hireDate: { $gte: startOfMonth } as any,
        },
      });

      return {
        totalActive,
        cdi,
        cdd,
        newThisMonth,
        cdiPercentage: totalActive > 0 ? Math.round((cdi / totalActive) * 100) : 0,
      };
    } catch (error) {
      return { totalActive: 0, cdi: 0, cdd: 0, newThisMonth: 0, cdiPercentage: 0 };
    }
  }

  /**
   * Absences (en cours, en attente de validation)
   */
  private async getAbsencesMetrics(companyId: string): Promise<any> {
    try {
      const now = new Date();

      // Absences en cours (aujourd'hui)
      const currentAbsences = await this.leaveRequestRepository.count({
        where: {
          status: LeaveStatus.APPROVED,
          startDate: { $lte: now } as any,
          endDate: { $gte: now } as any,
        },
      });

      // En attente de validation
      const pendingRequests = await this.leaveRequestRepository.count({
        where: {
          status: LeaveStatus.PENDING_MANAGER,
        },
      });

      // Total jours d'absence ce mois
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthAbsences = await this.leaveRequestRepository.find({
        where: {
          status: LeaveStatus.APPROVED,
          startDate: { $gte: startOfMonth, $lte: endOfMonth } as any,
        },
      });

      let totalDays = 0;
      monthAbsences.forEach(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDays += days;
      });

      return {
        currentAbsences,
        pendingRequests,
        totalDaysThisMonth: totalDays,
      };
    } catch (error) {
      return { currentAbsences: 0, pendingRequests: 0, totalDaysThisMonth: 0 };
    }
  }

  /**
   * Masse salariale (mois en cours vs précédent)
   */
  private async getPayrollCostsMetrics(companyId: string): Promise<any> {
    try {
      // TODO: Intégrer avec module Payroll quand il sera créé
      return { currentMonth: 0, previousMonth: 0, variation: 0, trend: 'stable' };
    } catch (error) {
      return { currentMonth: 0, previousMonth: 0, variation: 0, trend: 'stable' };
    }
  }

  /**
   * Turnover (départs ce mois, taux annuel)
   */
  private async getTurnoverMetrics(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Départs ce mois
      const departuresThisMonth = await this.employeeRepository.count({
        where: { 
          companyId,
          status: EmployeeStatus.TERMINATED,
          endDate: { $gte: startOfMonth } as any,
        },
      });

      // Départs cette année
      const departuresThisYear = await this.employeeRepository.count({
        where: { 
          companyId,
          status: EmployeeStatus.TERMINATED,
          endDate: { $gte: startOfYear } as any,
        },
      });

      // Effectif moyen
      const totalActive = await this.employeeRepository.count({
        where: { companyId, status: EmployeeStatus.ACTIVE },
      });

      // Taux de turnover annuel
      const monthsElapsed = now.getMonth() + 1;
      const annualizedDepartures = (departuresThisYear / monthsElapsed) * 12;
      const turnoverRate = totalActive > 0 
        ? (annualizedDepartures / totalActive) * 100 
        : 0;

      return {
        departuresThisMonth,
        departuresThisYear,
        turnoverRate: Math.round(turnoverRate * 10) / 10,
        status: turnoverRate > 15 ? 'high' : turnoverRate > 10 ? 'moderate' : 'low',
      };
    } catch (error) {
      return { departuresThisMonth: 0, departuresThisYear: 0, turnoverRate: 0, status: 'low' };
    }
  }

  /**
   * Recrutements (postes ouverts, candidats)
   */
  private async getRecruitmentsMetrics(companyId: string): Promise<any> {
    try {
      // TODO: Implémenter avec module recrutement
      // Pour l'instant, retourner des valeurs simulées
      return {
        openPositions: 0,
        candidates: 0,
        interviews: 0,
        hiredThisMonth: 0,
      };
    } catch (error) {
      return { openPositions: 0, candidates: 0, interviews: 0, hiredThisMonth: 0 };
    }
  }

  /**
   * Alertes RH
   */
  private async getHrAlerts(companyId: string): Promise<any[]> {
    const alerts = [];

    try {
      // Demandes de congé en attente
      const pendingLeaves = await this.leaveRequestRepository.count({
        where: { status: LeaveStatus.PENDING_MANAGER },
      });

      if (pendingLeaves > 0) {
        alerts.push({
          type: 'warning',
          title: 'Demandes en attente',
          message: `${pendingLeaves} demande(s) de congé à valider`,
        });
      }

      // Contrats CDD arrivant à terme (30 jours)
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiringContracts = await this.employeeRepository.count({
        where: {
          companyId,
          status: EmployeeStatus.ACTIVE,
          contractType: ContractType.FIXED_TERM,
          // TODO: Ajouter contractEndDate à Employee entity
        },
      });

      if (expiringContracts > 0) {
        alerts.push({
          type: 'danger',
          title: 'Contrats CDD à renouveler',
          message: `${expiringContracts} contrat(s) arrive(nt) à terme dans 30 jours`,
        });
      }

      // Turnover élevé
      const turnover = await this.getTurnoverMetrics(companyId);
      if (turnover.turnoverRate > 15) {
        alerts.push({
          type: 'danger',
          title: 'Turnover élevé',
          message: `Taux de ${turnover.turnoverRate}% - Investigation recommandée`,
        });
      }

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'RH saine',
          message: 'Tous les indicateurs RH sont au vert',
        });
      }
    } catch (error) {
      console.error('[HrManagerDashboard] Erreur getHrAlerts:', error);
    }

    return alerts;
  }

  /**
   * Répartition par département
   */
  private async getDepartmentBreakdown(companyId: string): Promise<any[]> {
    try {
      const employees = await this.employeeRepository.find({
        where: { companyId, status: EmployeeStatus.ACTIVE },
      });

      const departmentMap = new Map<string, number>();
      employees.forEach(emp => {
        const dept = emp.department || 'Non défini';
        departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
      });

      const breakdown = Array.from(departmentMap.entries()).map(([name, count]) => ({
        department: name,
        count,
        percentage: employees.length > 0 ? Math.round((count / employees.length) * 100) : 0,
      }));

      return breakdown.sort((a, b) => b.count - a.count);
    } catch (error) {
      return [];
    }
  }

  /**
   * Graphique évolution effectifs (12 mois)
   */
  private async getEvolutionChart(companyId: string): Promise<any[]> {
    const chart = [];
    const now = new Date();

    try {
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const monthStr = month.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

        // Effectif à la fin du mois
        const workforce = await this.employeeRepository.count({
          where: {
            companyId,
            status: EmployeeStatus.ACTIVE,
            hireDate: { $lte: endOfMonth } as any,
          },
        });

        // Embauches du mois
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const hires = await this.employeeRepository.count({
          where: {
            companyId,
            hireDate: { $gte: startOfMonth, $lte: endOfMonth } as any,
          },
        });

        // Départs du mois
        const departures = await this.employeeRepository.count({
          where: {
            companyId,
            status: EmployeeStatus.TERMINATED,
            endDate: { $gte: startOfMonth, $lte: endOfMonth } as any,
          },
        });

        chart.push({
          month: monthStr,
          workforce,
          hires,
          departures,
        });
      }
    } catch (error) {
      console.error('[HrManagerDashboard] Erreur getEvolutionChart:', error);
    }

    return chart;
  }

  /**
   * Top postes/fonctions
   */
  private async getTopPositions(companyId: string): Promise<any[]> {
    try {
      const employees = await this.employeeRepository.find({
        where: { companyId, status: EmployeeStatus.ACTIVE },
      });

      const positionMap = new Map<string, number>();
      employees.forEach(emp => {
        const position = emp.position || 'Non défini';
        positionMap.set(position, (positionMap.get(position) || 0) + 1);
      });

      const positions = Array.from(positionMap.entries())
        .map(([position, count]) => ({ position, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return positions;
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
        workforce: { totalActive: 0, cdi: 0, cdd: 0, newThisMonth: 0, cdiPercentage: 0 },
        absences: { currentAbsences: 0, pendingRequests: 0, totalDaysThisMonth: 0 },
        payrollCosts: { currentMonth: 0, previousMonth: 0, variation: 0, trend: 'stable' },
        turnover: { departuresThisMonth: 0, departuresThisYear: 0, turnoverRate: 0, status: 'low' },
        recruitments: { openPositions: 0, candidates: 0, interviews: 0, hiredThisMonth: 0 },
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données RH',
        },
      ],
      departmentBreakdown: [],
      evolutionChart: [],
      topPositions: [],
    };
  }
}
