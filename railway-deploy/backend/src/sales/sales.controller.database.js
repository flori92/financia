const salesService = require('./sales.service.database');

class SalesDatabaseController {
  
  // ===== CYCLE DE VENTE - TABLEAU DE BORD =====
  
  async getSalesCycleMetrics(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const metrics = await salesService.getSalesCycleMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error('Erreur getSalesCycleMetrics:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== DEVIS =====
  
  async getQuotes(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        status: req.query.status,
        clientId: req.query.clientId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const quotes = await salesService.getQuotes(companyId, filters);
      res.json(quotes);
    } catch (error) {
      console.error('Erreur getQuotes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createQuote(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const quote = await salesService.createQuote({ ...req.body, companyId });
      res.status(201).json(quote);
    } catch (error) {
      console.error('Erreur createQuote:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateQuoteStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'sent', 'accepted', 'rejected', 'expired'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const quote = await salesService.updateQuoteStatus(id, status);
      res.json(quote);
    } catch (error) {
      console.error('Erreur updateQuoteStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async convertQuoteToOrder(req, res) {
    try {
      const { id } = req.params;
      const orderData = req.body;

      const order = await salesService.convertQuoteToOrder(id, orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Erreur convertQuoteToOrder:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== COMMANDES =====
  
  async getOrders(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        status: req.query.status,
        clientId: req.query.clientId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const orders = await salesService.getOrders(companyId, filters);
      res.json(orders);
    } catch (error) {
      console.error('Erreur getOrders:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const order = await salesService.createOrder({ ...req.body, companyId });
      res.status(201).json(order);
    } catch (error) {
      console.error('Erreur createOrder:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, trackingNumber, expectedDeliveryDate } = req.body;

      if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      const updateData = {};
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (expectedDeliveryDate) updateData.expectedDeliveryDate = expectedDeliveryDate;

      const order = await salesService.updateOrderStatus(id, status, updateData);
      res.json(order);
    } catch (error) {
      console.error('Erreur updateOrderStatus:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== CLIENTS =====
  
  async getClients(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        status: req.query.status,
        type: req.query.type
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const clients = await salesService.getClients(companyId, filters);
      res.json(clients);
    } catch (error) {
      console.error('Erreur getClients:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createClient(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const client = await salesService.createClient({ ...req.body, companyId });
      res.status(201).json(client);
    } catch (error) {
      console.error('Erreur createClient:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== STATISTIQUES =====
  
  async getSalesStats(req, res) {
    try {
      const { companyId, period = 'month' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const stats = await salesService.getSalesStats(companyId, period);
      res.json(stats);
    } catch (error) {
      console.error('Erreur getSalesStats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // ===== EXPORT CSV =====
  
  async exportQuotes(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const quotes = await salesService.getQuotes(companyId);
      
      // Génération CSV
      const csvContent = [
        ['Numéro', 'Client', 'Montant', 'Statut', 'Date de création', 'Validité'],
        ...quotes.map(quote => [
          quote.quoteNumber,
          quote.clientName,
          quote.totalAmount.toString(),
          quote.status,
          new Date(quote.createdAt).toLocaleDateString('fr-FR'),
          quote.validUntil || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="quotes-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Erreur exportQuotes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async exportOrders(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const orders = await salesService.getOrders(companyId);
      
      // Génération CSV
      const csvContent = [
        ['Numéro', 'Client', 'Montant', 'Statut', 'Date de commande', 'Livraison prévue', 'Suivi'],
        ...orders.map(order => [
          order.orderNumber,
          order.clientName,
          order.totalAmount.toString(),
          order.status,
          new Date(order.createdAt).toLocaleDateString('fr-FR'),
          order.expectedDeliveryDate || 'N/A',
          order.trackingNumber || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Erreur exportOrders:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SalesDatabaseController();
