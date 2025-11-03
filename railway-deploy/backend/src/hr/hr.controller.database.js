const hrService = require('./hr.service.database');

class HRDatabaseController {
  
  // ===== CONGÉS ET ABSENCES =====
  
  async getLeaves(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        status: req.query.status,
        type: req.query.type,
        employeeId: req.query.employeeId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const leaves = await hrService.getLeaves(companyId, filters);
      res.json(leaves);
    } catch (error) {
      console.error('Erreur getLeaves:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createLeave(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const leave = await hrService.createLeave({ ...req.body, companyId });
      res.status(201).json(leave);
    } catch (error) {
      console.error('Erreur createLeave:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateLeaveStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, managerComment, approvedBy } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const leave = await hrService.updateLeaveStatus(id, status, managerComment, approvedBy);
      res.json(leave);
    } catch (error) {
      console.error('Erreur updateLeaveStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getLeaveBalances(req, res) {
    try {
      const { companyId, employeeId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const balances = await hrService.getLeaveBalances(companyId, employeeId);
      res.json(balances);
    } catch (error) {
      console.error('Erreur getLeaveBalances:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== CRA ET TEMPS DE TRAVAIL =====
  
  async getTimesheets(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        status: req.query.status,
        employeeId: req.query.employeeId,
        weekStartDate: req.query.weekStartDate
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const timesheets = await hrService.getTimesheets(companyId, filters);
      res.json(timesheets);
    } catch (error) {
      console.error('Erreur getTimesheets:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createTimesheet(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const timesheet = await hrService.createTimesheet({ ...req.body, companyId });
      res.status(201).json(timesheet);
    } catch (error) {
      console.error('Erreur createTimesheet:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateTimesheetStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, approvedBy, comments } = req.body;

      if (!['submitted', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const timesheet = await hrService.updateTimesheetStatus(id, status, approvedBy, comments);
      res.json(timesheet);
    } catch (error) {
      console.error('Erreur updateTimesheetStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== NOTES DE FRAIS =====
  
  async getExpenses(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        status: req.query.status,
        type: req.query.type,
        employeeId: req.query.employeeId,
        projectId: req.query.projectId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const expenses = await hrService.getExpenses(companyId, filters);
      res.json(expenses);
    } catch (error) {
      console.error('Erreur getExpenses:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createExpense(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const expense = await hrService.createExpense({ ...req.body, companyId });
      res.status(201).json(expense);
    } catch (error) {
      console.error('Erreur createExpense:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateExpenseStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, approvedBy, comments } = req.body;

      if (!['submitted', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const expense = await hrService.updateExpenseStatus(id, status, approvedBy, comments);
      res.json(expense);
    } catch (error) {
      console.error('Erreur updateExpenseStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== UTILITAIRES =====
  
  async getEmployees(req, res) {
    try {
      const { companyId, status } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const employees = await hrService.getEmployees(companyId, status);
      res.json(employees);
    } catch (error) {
      console.error('Erreur getEmployees:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getDashboardMetrics(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const metrics = await hrService.getDashboardMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error('Erreur getDashboardMetrics:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== EXPORT CSV =====
  
  async exportExpenses(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const expenses = await hrService.getExpenses(companyId);
      
      // Génération CSV
      const csvContent = [
        ['Employé', 'Description', 'Montant', 'Type', 'Date', 'Statut', 'Projet'],
        ...expenses.map(expense => [
          expense.employeeName || 'N/A',
          expense.description,
          expense.amount.toString(),
          expense.type,
          expense.date,
          expense.status,
          expense.projectId || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Erreur exportExpenses:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async exportTimesheets(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const timesheets = await hrService.getTimesheets(companyId);
      
      // Génération CSV
      const csvContent = [
        ['Employé', 'Semaine', 'Total Heures', 'Statut', 'Projets'],
        ...timesheets.map(ts => [
          ts.employeeName || 'N/A',
          `${ts.weekStartDate} - ${ts.weekEndDate}`,
          ts.totalHours.toString(),
          ts.status,
          ts.projects ? ts.projects.map(p => p.projectName).join(', ') : 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="timesheets-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Erreur exportTimesheets:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new HRDatabaseController();
