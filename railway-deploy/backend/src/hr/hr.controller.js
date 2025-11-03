const hrService = require('./hr.service');

class HRController {
  constructor(hrService) {
    this.hrService = hrService;
  }

  async getHRDashboard(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.hrService.getDashboardMetrics(companyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEmployees(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.hrService.getEmployees(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEmployee(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.hrService.createEmployee(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const result = await this.hrService.updateEmployee(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPayroll(req, res) {
    try {
      const { companyId, month } = req.query;
      const result = await this.hrService.getPayroll(companyId, month);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generatePayroll(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.hrService.generatePayroll(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLeaves(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.hrService.getLeaves(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createLeave(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.hrService.createLeave(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async approveLeave(req, res) {
    try {
      const { id } = req.params;
      const result = await this.hrService.approveLeave(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = HRController;
