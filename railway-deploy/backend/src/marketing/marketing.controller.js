const marketingService = require('./marketing.service');

class MarketingController {
  constructor(marketingService) {
    this.marketingService = marketingService;
  }

  async getMarketingDashboard(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.marketingService.getDashboardMetrics(companyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCampaigns(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.marketingService.getCampaigns(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCampaign(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.marketingService.createCampaign(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const result = await this.marketingService.updateCampaign(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLeads(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.marketingService.getLeads(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createLead(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.marketingService.createLead(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAnalytics(req, res) {
    try {
      const { companyId, period } = req.query;
      const result = await this.marketingService.getAnalytics(companyId, period);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MarketingController;
