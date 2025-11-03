const { getRepository } = require('typeorm');
const { 
  HREmployee, 
  HRLeave, 
  HRLeaveBalance, 
  HRTimesheet, 
  HRExpense 
} = require('./hr.entity');

class HRDatabaseService {
  
  // ===== CONGÉS ET ABSENCES =====
  
  async getLeaves(companyId, filters = {}) {
    try {
      const leaveRepository = getRepository(HRLeave);
      const query = leaveRepository.createQueryBuilder('leave')
        .where('leave.companyId = :companyId', { companyId });

      if (filters.status) {
        query.andWhere('leave.status = :status', { status: filters.status });
      }
      if (filters.type) {
        query.andWhere('leave.type = :type', { type: filters.type });
      }
      if (filters.employeeId) {
        query.andWhere('leave.employeeId = :employeeId', { employeeId: filters.employeeId });
      }
      if (filters.startDate) {
        query.andWhere('leave.startDate >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('leave.endDate <= :endDate', { endDate: filters.endDate });
      }

      query.orderBy('leave.createdAt', 'DESC');

      const leaves = await query.getMany();
      
      // Récupérer les informations des employés
      const employeeRepository = getRepository(HREmployee);
      const employees = await employeeRepository.findByIds(
        [...new Set(leaves.map(leave => leave.employeeId))]
      );

      const employeeMap = employees.reduce((map, emp) => {
        map[emp.id] = `${emp.firstName} ${emp.lastName}`;
        return map;
      }, {});

      return leaves.map(leave => ({
        ...leave,
        employeeName: employeeMap[leave.employeeId] || 'Employé inconnu'
      }));
    } catch (error) {
      throw new Error(`Erreur récupération congés: ${error.message}`);
    }
  }

  async createLeave(leaveData) {
    try {
      const leaveRepository = getRepository(HRLeave);
      
      // Calculer le nombre de jours
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const leave = leaveRepository.create({
        ...leaveData,
        daysCount,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      });

      return await leaveRepository.save(leave);
    } catch (error) {
      throw new Error(`Erreur création congé: ${error.message}`);
    }
  }

  async updateLeaveStatus(leaveId, status, managerComment, approvedBy) {
    try {
      const leaveRepository = getRepository(HRLeave);
      
      const updateData = {
        status,
        processedAt: new Date().toISOString()
      };

      if (managerComment) {
        updateData.managerComment = managerComment;
      }
      if (approvedBy) {
        updateData.approvedBy = approvedBy;
      }

      await leaveRepository.update(leaveId, updateData);
      
      // Si approuvé, mettre à jour le solde de congés
      if (status === 'approved') {
        const leave = await leaveRepository.findOne(leaveId);
        await this.updateLeaveBalance(leave.employeeId, leave.type, leave.daysCount, true);
      }

      return await leaveRepository.findOne(leaveId);
    } catch (error) {
      throw new Error(`Erreur mise à jour congé: ${error.message}`);
    }
  }

  async getLeaveBalances(companyId, employeeId = null) {
    try {
      const balanceRepository = getRepository(HRLeaveBalance);
      const query = balanceRepository.createQueryBuilder('balance')
        .where('balance.companyId = :companyId', { companyId });

      if (employeeId) {
        query.andWhere('balance.employeeId = :employeeId', { employeeId });
      }

      const balances = await query.getMany();
      
      // Récupérer les informations des employés
      const employeeRepository = getRepository(HREmployee);
      const employees = await employeeRepository.findByIds(
        [...new Set(balances.map(balance => balance.employeeId))]
      );

      const employeeMap = employees.reduce((map, emp) => {
        map[emp.id] = `${emp.firstName} ${emp.lastName}`;
        return map;
      }, {});

      return balances.map(balance => ({
        ...balance,
        employeeName: employeeMap[balance.employeeId] || 'Employé inconnu'
      }));
    } catch (error) {
      throw new Error(`Erreur récupération soldes: ${error.message}`);
    }
  }

  async updateLeaveBalance(employeeId, leaveType, days, isUsed = false) {
    try {
      const balanceRepository = getRepository(HRLeaveBalance);
      const currentYear = new Date().getFullYear();
      
      let balance = await balanceRepository.findOne({
        where: {
          employeeId,
          type: leaveType,
          year: currentYear
        }
      });

      if (!balance) {
        // Créer un nouveau solde avec valeurs par défaut
        const defaultDays = {
          'annual': 25,
          'sick': 10,
          'personal': 5,
          'maternity': 90,
          'paternity': 10
        };

        balance = balanceRepository.create({
          employeeId,
          type: leaveType,
          totalDays: defaultDays[leaveType] || 0,
          usedDays: 0,
          remainingDays: defaultDays[leaveType] || 0,
          year: currentYear,
          companyId: 'company-uuid' // À adapter
        });
      }

      if (isUsed) {
        balance.usedDays += days;
      } else {
        // Ajout de jours (rare, mais possible)
        balance.totalDays += days;
      }
      
      balance.remainingDays = balance.totalDays - balance.usedDays;

      return await balanceRepository.save(balance);
    } catch (error) {
      throw new Error(`Erreur mise à jour solde: ${error.message}`);
    }
  }

  // ===== CRA ET TEMPS DE TRAVAIL =====
  
  async getTimesheets(companyId, filters = {}) {
    try {
      const timesheetRepository = getRepository(HRTimesheet);
      const query = timesheetRepository.createQueryBuilder('timesheet')
        .where('timesheet.companyId = :companyId', { companyId });

      if (filters.status) {
        query.andWhere('timesheet.status = :status', { status: filters.status });
      }
      if (filters.employeeId) {
        query.andWhere('timesheet.employeeId = :employeeId', { employeeId: filters.employeeId });
      }
      if (filters.weekStartDate) {
        query.andWhere('timesheet.weekStartDate = :weekStartDate', { weekStartDate: filters.weekStartDate });
      }

      query.orderBy('timesheet.weekStartDate', 'DESC');

      const timesheets = await query.getMany();
      
      // Récupérer les informations des employés
      const employeeRepository = getRepository(HREmployee);
      const employees = await employeeRepository.findByIds(
        [...new Set(timesheets.map(ts => ts.employeeId))]
      );

      const employeeMap = employees.reduce((map, emp) => {
        map[emp.id] = `${emp.firstName} ${emp.lastName}`;
        return map;
      }, {});

      return timesheets.map(ts => ({
        ...ts,
        employeeName: employeeMap[ts.employeeId] || 'Employé inconnu'
      }));
    } catch (error) {
      throw new Error(`Erreur récupération CRA: ${error.message}`);
    }
  }

  async createTimesheet(timesheetData) {
    try {
      const timesheetRepository = getRepository(HRTimesheet);
      
      // Calculer le total des heures
      let totalHours = 0;
      if (timesheetData.projects) {
        totalHours = timesheetData.projects.reduce((sum, project) => {
          return sum + (project.total || 0);
        }, 0);
      }
      
      const timesheet = timesheetRepository.create({
        ...timesheetData,
        totalHours,
        status: 'draft'
      });

      return await timesheetRepository.save(timesheet);
    } catch (error) {
      throw new Error(`Erreur création CRA: ${error.message}`);
    }
  }

  async updateTimesheetStatus(timesheetId, status, approvedBy, comments = null) {
    try {
      const timesheetRepository = getRepository(HRTimesheet);
      
      const updateData = {
        status
      };

      if (status === 'submitted') {
        updateData.submittedAt = new Date().toISOString();
      }
      
      if (status === 'approved') {
        updateData.approvedAt = new Date().toISOString();
        updateData.approvedBy = approvedBy;
      }
      
      if (comments) {
        updateData.comments = comments;
      }

      await timesheetRepository.update(timesheetId, updateData);
      
      return await timesheetRepository.findOne(timesheetId);
    } catch (error) {
      throw new Error(`Erreur mise à jour CRA: ${error.message}`);
    }
  }

  // ===== NOTES DE FRAIS =====
  
  async getExpenses(companyId, filters = {}) {
    try {
      const expenseRepository = getRepository(HRExpense);
      const query = expenseRepository.createQueryBuilder('expense')
        .where('expense.companyId = :companyId', { companyId });

      if (filters.status) {
        query.andWhere('expense.status = :status', { status: filters.status });
      }
      if (filters.type) {
        query.andWhere('expense.type = :type', { type: filters.type });
      }
      if (filters.employeeId) {
        query.andWhere('expense.employeeId = :employeeId', { employeeId: filters.employeeId });
      }
      if (filters.projectId) {
        query.andWhere('expense.projectId = :projectId', { projectId: filters.projectId });
      }
      if (filters.startDate) {
        query.andWhere('expense.date >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('expense.date <= :endDate', { endDate: filters.endDate });
      }

      query.orderBy('expense.date', 'DESC');

      const expenses = await query.getMany();
      
      // Récupérer les informations des employés
      const employeeRepository = getRepository(HREmployee);
      const employees = await employeeRepository.findByIds(
        [...new Set(expenses.map(expense => expense.employeeId))]
      );

      const employeeMap = employees.reduce((map, emp) => {
        map[emp.id] = `${emp.firstName} ${emp.lastName}`;
        return map;
      }, {});

      return expenses.map(expense => ({
        ...expense,
        employeeName: employeeMap[expense.employeeId] || 'Employé inconnu'
      }));
    } catch (error) {
      throw new Error(`Erreur récupération notes de frais: ${error.message}`);
    }
  }

  async createExpense(expenseData) {
    try {
      const expenseRepository = getRepository(HRExpense);
      
      const expense = expenseRepository.create({
        ...expenseData,
        status: 'draft'
      });

      return await expenseRepository.save(expense);
    } catch (error) {
      throw new Error(`Erreur création note de frais: ${error.message}`);
    }
  }

  async updateExpenseStatus(expenseId, status, approvedBy, comments = null) {
    try {
      const expenseRepository = getRepository(HRExpense);
      
      const updateData = {
        status
      };

      if (status === 'submitted') {
        updateData.submittedAt = new Date().toISOString();
      }
      
      if (status === 'approved') {
        updateData.approvedAt = new Date().toISOString();
        updateData.approvedBy = approvedBy;
      }
      
      if (comments) {
        updateData.comments = comments;
      }

      await expenseRepository.update(expenseId, updateData);
      
      return await expenseRepository.findOne(expenseId);
    } catch (error) {
      throw new Error(`Erreur mise à jour note de frais: ${error.message}`);
    }
  }

  // ===== UTILITAIRES =====
  
  async getEmployees(companyId, status = null) {
    try {
      const employeeRepository = getRepository(HREmployee);
      const query = employeeRepository.createQueryBuilder('employee')
        .where('employee.companyId = :companyId', { companyId });

      if (status) {
        query.andWhere('employee.status = :status', { status });
      }

      query.orderBy('employee.lastName', 'ASC');

      return await query.getMany();
    } catch (error) {
      throw new Error(`Erreur récupération employés: ${error.message}`);
    }
  }

  async getDashboardMetrics(companyId) {
    try {
      const [totalEmployees, pendingLeaves, submittedExpenses, pendingTimesheets] = await Promise.all([
        getRepository(HREmployee).count({ where: { companyId } }),
        getRepository(HRLeave).count({ where: { companyId, status: 'pending' } }),
        getRepository(HRExpense).count({ where: { companyId, status: 'submitted' } }),
        getRepository(HRTimesheet).count({ where: { companyId, status: 'submitted' } })
      ]);

      return {
        totalEmployees,
        pendingLeaves,
        submittedExpenses,
        pendingTimesheets
      };
    } catch (error) {
      throw new Error(`Erreur récupération KPIs: ${error.message}`);
    }
  }
}

module.exports = new HRDatabaseService();
