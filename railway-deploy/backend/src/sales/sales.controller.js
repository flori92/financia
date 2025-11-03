// Sales Controller - JavaScript/Node.js Express.js
const salesService = require('./sales.service');
const salesDatabaseService = require('./sales.service.database');

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

  // ===== NOUVELLES ROUTES DATABASE =====
  
  async getSalesCycleMetrics(req, res) {
    try {
      const { companyId, period } = req.query;
      const result = await salesDatabaseService.getSalesCycleMetrics(companyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getQuotesDatabase(req, res) {
    try {
      const { companyId, status, clientId, startDate, endDate } = req.query;
      const filters = { status, clientId, startDate, endDate };
      const result = await salesDatabaseService.getQuotes(companyId, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createQuoteDatabase(req, res) {
    try {
      const result = await salesDatabaseService.createQuote(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateQuoteStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await salesDatabaseService.updateQuoteStatus(id, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async convertQuoteToOrder(req, res) {
    try {
      const { id } = req.params;
      const result = await salesDatabaseService.convertQuoteToOrder(id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrdersDatabase(req, res) {
    try {
      const { companyId, status, clientId, startDate, endDate } = req.query;
      const filters = { status, clientId, startDate, endDate };
      const result = await salesDatabaseService.getOrders(companyId, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createOrderDatabase(req, res) {
    try {
      const result = await salesDatabaseService.createOrder(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, trackingNumber, expectedDeliveryDate } = req.body;
      const updateData = { trackingNumber, expectedDeliveryDate };
      const result = await salesDatabaseService.updateOrderStatus(id, status, updateData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getClientsDatabase(req, res) {
    try {
      const { companyId, status, type } = req.query;
      const filters = { status, type };
      const result = await salesDatabaseService.getClients(companyId, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createClientDatabase(req, res) {
    try {
      const result = await salesDatabaseService.createClient(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSalesStats(req, res) {
    try {
      const { companyId, period } = req.query;
      const result = await salesDatabaseService.getSalesStats(companyId, period);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportQuotes(req, res) {
    try {
      await salesDatabaseService.exportQuotes(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportOrders(req, res) {
    try {
      await salesDatabaseService.exportOrders(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ===== ROUTES EXISTANTES =====

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
