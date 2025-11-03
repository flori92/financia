const inventoryService = require('./inventory.service');

class InventoryController {
  
  async getProducts(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        search: req.query.search,
        category: req.query.category,
        status: req.query.status
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const products = await inventoryService.getProducts(companyId, filters);
      res.json(products);
    } catch (error) {
      console.error('Erreur getProducts:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createProduct(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const product = await inventoryService.createProduct({ ...req.body, companyId });
      res.status(201).json(product);
    } catch (error) {
      console.error('Erreur createProduct:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      
      const product = await inventoryService.updateProduct(id, req.body);
      res.json(product);
    } catch (error) {
      console.error('Erreur updateProduct:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const success = await inventoryService.deleteProduct(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Produit non trouvé' });
      }
    } catch (error) {
      console.error('Erreur deleteProduct:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMovements(req, res) {
    try {
      const { companyId } = req.query;
      const filters = {
        productId: req.query.productId,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const movements = await inventoryService.getMovements(companyId, filters);
      res.json(movements);
    } catch (error) {
      console.error('Erreur getMovements:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createMovement(req, res) {
    try {
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const movement = await inventoryService.createMovement({ ...req.body, companyId });
      res.status(201).json(movement);
    } catch (error) {
      console.error('Erreur createMovement:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getDashboardMetrics(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const metrics = await inventoryService.getDashboardMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error('Erreur getDashboardMetrics:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCategories(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const categories = await inventoryService.getCategories(companyId);
      res.json(categories);
    } catch (error) {
      console.error('Erreur getCategories:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async exportProducts(req, res) {
    try {
      const { companyId } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId requis' });
      }

      const products = await inventoryService.getProducts(companyId);
      
      // Génération CSV
      const csvContent = [
        ['Nom', 'SKU', 'Catégorie', 'Quantité', 'Quantité Min', 'Prix Unitaire', 'Valeur Totale', 'Emplacement', 'Statut', 'Fournisseur'],
        ...products.map(product => [
          product.name,
          product.sku,
          product.category,
          product.quantity.toString(),
          product.minQuantity.toString(),
          product.unitPrice.toString(),
          (product.quantity * product.unitPrice).toString(),
          product.location,
          product.status,
          product.supplier || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Erreur exportProducts:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new InventoryController();
