const { Injectable } = require('@nestjs/common');
const { Repository } = require('typeorm');

@Injectable()
export class HRService {
  constructor(
    @InjectRepository(HREmployee)
    private employeesRepository: Repository<HREmployee>,
    @InjectRepository(HRPayroll)
    private payrollRepository: Repository<HRPayroll>,
    @InjectRepository(HRLeave)
    private leavesRepository: Repository<HRLeave>,
  ) {}

  async getDashboardMetrics(companyId: string) {
    try {
      const mockData = {
        totalEmployees: 45,
        activeEmployees: 42,
        newEmployees: 3,
        monthlyPayroll: 12500000,
        pendingLeaveRequests: 8,
        openPositions: 5,
        employeeSatisfaction: 4.2,
        turnoverRate: 8.5,
        departmentBreakdown: [
          { department: 'Ventes', employees: 12, avgSalary: 350000 },
          { department: 'Tech', employees: 8, avgSalary: 450000 },
          { department: 'Marketing', employees: 6, avgSalary: 320000 },
          { department: 'RH', employees: 4, avgSalary: 380000 },
          { department: 'Opérations', employees: 15, avgSalary: 280000 }
        ],
        upcomingBirthdays: [
          { name: 'Jean Dupont', department: 'Tech', date: '2025-01-15' },
          { name: 'Marie Claire', department: 'Ventes', date: '2025-01-18' }
        ]
      };

      return mockData;
    } catch (error) {
      throw new Error(`Erreur récupération KPIs RH: ${error.message}`);
    }
  }

  async getEmployees(companyId: string, status?: string) {
    try {
      const mockEmployees = [
        {
          id: "1",
          firstName: "Jean",
          lastName: "Dupont",
          email: "jean.dupont@company.com",
          phone: "+229 97 123 456",
          position: "Développeur Senior",
          department: "Tech",
          salary: 450000,
          hireDate: "2023-03-15",
          status: "active",
          contractType: "CDI",
          address: "Cotonou, Bénin"
        },
        {
          id: "2",
          firstName: "Marie",
          lastName: "Claire",
          email: "marie.claire@company.com",
          phone: "+229 98 234 567",
          position: "Chef de Vente",
          department: "Ventes",
          salary: 380000,
          hireDate: "2022-08-20",
          status: "active",
          contractType: "CDI",
          address: "Porto-Novo, Bénin"
        },
        {
          id: "3",
          firstName: "Paul",
          lastName: "Martin",
          email: "paul.martin@company.com",
          phone: "+229 99 345 678",
          position: "Stagiaire Marketing",
          department: "Marketing",
          salary: 150000,
          hireDate: "2024-12-01",
          status: "active",
          contractType: "Stage",
          address: "Abomey-Calavi, Bénin"
        }
      ];

      if (status) {
        return mockEmployees.filter(emp => emp.status === status);
      }

      return mockEmployees;
    } catch (error) {
      throw new Error(`Erreur récupération employés: ${error.message}`);
    }
  }

  async createEmployee(createEmployeeDto: any, companyId: string) {
    try {
      const employee = {
        id: Date.now().toString(),
        ...createEmployeeDto,
        companyId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return employee;
    } catch (error) {
      throw new Error(`Erreur création employé: ${error.message}`);
    }
  }

  async updateEmployee(id: string, updateEmployeeDto: any) {
    try {
      const employee = {
        id,
        ...updateEmployeeDto,
        updatedAt: new Date().toISOString()
      };

      return employee;
    } catch (error) {
      throw new Error(`Erreur mise à jour employé: ${error.message}`);
    }
  }

  async getPayroll(companyId: string, month?: string) {
    try {
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      
      const mockPayroll = {
        month: currentMonth,
        totalEmployees: 42,
        totalGrossSalary: 14500000,
        totalNetSalary: 12500000,
        totalDeductions: 2000000,
        details: [
          {
            employeeId: "1",
            employeeName: "Jean Dupont",
            grossSalary: 450000,
            deductions: {
              socialSecurity: 45000,
              taxes: 67500,
              other: 22500
            },
            netSalary: 315000
          },
          {
            employeeId: "2",
            employeeName: "Marie Claire",
            grossSalary: 380000,
            deductions: {
              socialSecurity: 38000,
              taxes: 57000,
              other: 19000
            },
            netSalary: 266000
          }
        ]
      };

      return mockPayroll;
    } catch (error) {
      throw new Error(`Erreur récupération paie: ${error.message}`);
    }
  }

  async generatePayroll(generateDto: { month: string; employeeIds?: string[] }, companyId: string) {
    try {
      const result = {
        success: true,
        month: generateDto.month,
        generatedAt: new Date().toISOString(),
        employeesProcessed: generateDto.employeeIds?.length || 42,
        totalAmount: 12500000,
        downloadUrl: `/api/v1/hr/payroll/download/${generateDto.month}.pdf`
      };

      return result;
    } catch (error) {
      throw new Error(`Erreur génération paie: ${error.message}`);
    }
  }

  async getLeaves(companyId: string, status?: string) {
    try {
      const mockLeaves = [
        {
          id: "1",
          employeeId: "1",
          employeeName: "Jean Dupont",
          type: "annual",
          startDate: "2025-01-15",
          endDate: "2025-01-17",
          daysCount: 3,
          reason: "Vacances familiales",
          status: "pending",
          requestedAt: "2025-01-10",
          managerComment: null
        },
        {
          id: "2",
          employeeId: "2",
          employeeName: "Marie Claire",
          type: "sick",
          startDate: "2025-01-08",
          endDate: "2025-01-09",
          daysCount: 2,
          reason: "Maladie",
          status: "approved",
          requestedAt: "2025-01-07",
          managerComment: "Certificat médical fourni"
        },
        {
          id: "3",
          employeeId: "3",
          employeeName: "Paul Martin",
          type: "personal",
          startDate: "2025-01-20",
          endDate: "2025-01-20",
          daysCount: 1,
          reason: "Rendez-vous personnel",
          status: "pending",
          requestedAt: "2025-01-18",
          managerComment: null
        }
      ];

      if (status) {
        return mockLeaves.filter(leave => leave.status === status);
      }

      return mockLeaves;
    } catch (error) {
      throw new Error(`Erreur récupération congés: ${error.message}`);
    }
  }

  async createLeave(createLeaveDto: any, companyId: string) {
    try {
      const leave = {
        id: Date.now().toString(),
        ...createLeaveDto,
        status: 'pending',
        companyId,
        requestedAt: new Date().toISOString(),
        managerComment: null
      };

      return leave;
    } catch (error) {
      throw new Error(`Erreur création demande congé: ${error.message}`);
    }
  }

  async approveLeave(id: string, approveDto: { approved: boolean; comment?: string }) {
    try {
      const leave = {
        id,
        status: approveDto.approved ? 'approved' : 'rejected',
        managerComment: approveDto.comment,
        processedAt: new Date().toISOString()
      };

      return leave;
    } catch (error) {
      throw new Error(`Erreur approbation congé: ${error.message}`);
    }
  }
}
