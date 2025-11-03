const salesService = require('./sales.service');

class SalesController {
  constructor(salesService) {
    this.salesService = salesService;
  }

  async getSalesDashboard(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.salesService.getDashboardMetrics(companyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getQuotes(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.salesService.getQuotes(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createQuote(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.salesService.createQuote(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateQuote(req, res) {
    try {
      const { id } = req.params;
      const result = await this.salesService.updateQuote(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendQuote(req, res) {
    try {
      const { id } = req.params;
      const result = await this.salesService.sendQuote(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrders(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.salesService.getOrders(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.salesService.createOrder(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const result = await this.salesService.updateOrder(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getClients(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.salesService.getClients(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createClient(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.salesService.createClient(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const result = await this.salesService.updateClient(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SalesController;
