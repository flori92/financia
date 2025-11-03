const { getRepository } = require('typeorm');
const { SalesQuote, SalesOrder, SalesClient } = require('./sales.entity');

class SalesDatabaseService {
  
  // ===== CYCLE DE VENTE - TABLEAU DE BORD =====
  
  async getSalesCycleMetrics(companyId) {
    try {
      const quoteRepository = getRepository(SalesQuote);
      const orderRepository = getRepository(SalesOrder);
      
      // Compter par statuts pour chaque étape du cycle
      const [
        totalQuotes,
        sentQuotes,
        acceptedQuotes,
        totalOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders
      ] = await Promise.all([
        quoteRepository.count({ where: { companyId } }),
        quoteRepository.count({ where: { companyId, status: 'sent' } }),
        quoteRepository.count({ where: { companyId, status: 'accepted' } }),
        orderRepository.count({ where: { companyId } }),
        orderRepository.count({ where: { companyId, status: 'confirmed' } }),
        orderRepository.count({ where: { companyId, status: 'processing' } }),
        orderRepository.count({ where: { companyId, status: 'shipped' } }),
        orderRepository.count({ where: { companyId, status: 'delivered' } })
      ]);

      // Calculer les montants totaux
      const [quotesTotal, ordersTotal] = await Promise.all([
        quoteRepository
          .createQueryBuilder('quote')
          .select('SUM(quote.totalAmount)', 'total')
          .where('quote.companyId = :companyId', { companyId })
          .getRawOne(),
        orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.totalAmount)', 'total')
          .where('order.companyId = :companyId', { companyId })
          .getRawOne()
      ]);

      // Récupérer les activités récentes
      const recentQuotes = await quoteRepository
        .createQueryBuilder('quote')
        .where('quote.companyId = :companyId', { companyId })
        .orderBy('quote.createdAt', 'DESC')
        .limit(5)
        .getMany();

      const recentOrders = await orderRepository
        .createQueryBuilder('order')
        .where('order.companyId = :companyId', { companyId })
        .orderBy('order.createdAt', 'DESC')
        .limit(5)
        .getMany();

      return {
        quotes: {
          total: totalQuotes,
          sent: sentQuotes,
          accepted: acceptedQuotes,
          totalAmount: parseFloat(quotesTotal.total) || 0
        },
        orders: {
          total: totalOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          totalAmount: parseFloat(ordersTotal.total) || 0
        },
        recentActivity: {
          quotes: recentQuotes,
          orders: recentOrders
        }
      };
    } catch (error) {
      throw new Error(`Erreur récupération métriques cycle vente: ${error.message}`);
    }
  }

  // ===== DEVIS =====
  
  async getQuotes(companyId, filters = {}) {
    try {
      const quoteRepository = getRepository(SalesQuote);
      const query = quoteRepository.createQueryBuilder('quote')
        .where('quote.companyId = :companyId', { companyId });

      if (filters.status) {
        query.andWhere('quote.status = :status', { status: filters.status });
      }
      if (filters.clientId) {
        query.andWhere('quote.clientId = :clientId', { clientId: filters.clientId });
      }
      if (filters.startDate) {
        query.andWhere('quote.createdAt >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('quote.createdAt <= :endDate', { endDate: filters.endDate });
      }

      query.orderBy('quote.createdAt', 'DESC');

      return await query.getMany();
    } catch (error) {
      throw new Error(`Erreur récupération devis: ${error.message}`);
    }
  }

  async createQuote(quoteData) {
    try {
      const quoteRepository = getRepository(SalesQuote);
      
      // Générer un numéro de devis automatique
      const quoteNumber = await this.generateQuoteNumber(companyId);
      
      const quote = quoteRepository.create({
        ...quoteData,
        quoteNumber,
        status: 'draft'
      });

      return await quoteRepository.save(quote);
    } catch (error) {
      throw new Error(`Erreur création devis: ${error.message}`);
    }
  }

  async updateQuoteStatus(quoteId, status) {
    try {
      const quoteRepository = getRepository(SalesQuote);
      
      await quoteRepository.update(quoteId, { status });
      
      return await quoteRepository.findOne(quoteId);
    } catch (error) {
      throw new Error(`Erreur mise à jour devis: ${error.message}`);
    }
  }

  async convertQuoteToOrder(quoteId, orderData) {
    try {
      const quoteRepository = getRepository(SalesQuote);
      const orderRepository = getRepository(SalesOrder);
      
      // Récupérer le devis
      const quote = await quoteRepository.findOne(quoteId);
      if (!quote) {
        throw new Error('Devis non trouvé');
      }

      // Générer un numéro de commande
      const orderNumber = await this.generateOrderNumber(quote.companyId);
      
      // Créer la commande à partir du devis
      const order = orderRepository.create({
        orderNumber,
        clientId: quote.clientId,
        clientName: quote.clientName,
        totalAmount: quote.totalAmount,
        items: quote.items,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        companyId: quote.companyId,
        ...orderData
      });

      const savedOrder = await orderRepository.save(order);
      
      // Marquer le devis comme accepté
      await quoteRepository.update(quoteId, { status: 'accepted' });

      return savedOrder;
    } catch (error) {
      throw new Error(`Erreur conversion devis en commande: ${error.message}`);
    }
  }

  // ===== COMMANDES =====
  
  async getOrders(companyId, filters = {}) {
    try {
      const orderRepository = getRepository(SalesOrder);
      const query = orderRepository.createQueryBuilder('order')
        .where('order.companyId = :companyId', { companyId });

      if (filters.status) {
        query.andWhere('order.status = :status', { status: filters.status });
      }
      if (filters.clientId) {
        query.andWhere('order.clientId = :clientId', { clientId: filters.clientId });
      }
      if (filters.startDate) {
        query.andWhere('order.createdAt >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        query.andWhere('order.createdAt <= :endDate', { endDate: filters.endDate });
      }

      query.orderBy('order.createdAt', 'DESC');

      return await query.getMany();
    } catch (error) {
      throw new Error(`Erreur récupération commandes: ${error.message}`);
    }
  }

  async createOrder(orderData) {
    try {
      const orderRepository = getRepository(SalesOrder);
      
      // Générer un numéro de commande automatique
      const orderNumber = await this.generateOrderNumber(orderData.companyId);
      
      const order = orderRepository.create({
        ...orderData,
        orderNumber,
        status: 'pending'
      });

      return await orderRepository.save(order);
    } catch (error) {
      throw new Error(`Erreur création commande: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId, status, updateData = {}) {
    try {
      const orderRepository = getRepository(SalesOrder);
      
      const dataToUpdate = { status, ...updateData };
      
      await orderRepository.update(orderId, dataToUpdate);
      
      return await orderRepository.findOne(orderId);
    } catch (error) {
      throw new Error(`Erreur mise à jour commande: ${error.message}`);
    }
  }

  // ===== CLIENTS =====
  
  async getClients(companyId, filters = {}) {
    try {
      const clientRepository = getRepository(SalesClient);
      const query = clientRepository.createQueryBuilder('client')
        .where('client.companyId = :companyId', { companyId });

      if (filters.status) {
        query.andWhere('client.status = :status', { status: filters.status });
      }
      if (filters.type) {
        query.andWhere('client.type = :type', { type: filters.type });
      }

      query.orderBy('client.createdAt', 'DESC');

      return await query.getMany();
    } catch (error) {
      throw new Error(`Erreur récupération clients: ${error.message}`);
    }
  }

  async createClient(clientData) {
    try {
      const clientRepository = getRepository(SalesClient);
      
      const client = clientRepository.create({
        ...clientData,
        totalOrders: 0,
        totalRevenue: 0,
        rating: 0
      });

      return await clientRepository.save(client);
    } catch (error) {
      throw new Error(`Erreur création client: ${error.message}`);
    }
  }

  // ===== UTILITAIRES =====
  
  async generateQuoteNumber(companyId) {
    try {
      const quoteRepository = getRepository(SalesQuote);
      const currentYear = new Date().getFullYear();
      
      const count = await quoteRepository
        .createQueryBuilder('quote')
        .where('quote.companyId = :companyId', { companyId })
        .andWhere('quote.createdAt >= :startDate', { 
          startDate: `${currentYear}-01-01T00:00:00.000Z` 
        })
        .getCount();

      return `DEV-${currentYear}-${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      return `DEV-${new Date().getFullYear()}-001`;
    }
  }

  async generateOrderNumber(companyId) {
    try {
      const orderRepository = getRepository(SalesOrder);
      const currentYear = new Date().getFullYear();
      
      const count = await orderRepository
        .createQueryBuilder('order')
        .where('order.companyId = :companyId', { companyId })
        .andWhere('order.createdAt >= :startDate', { 
          startDate: `${currentYear}-01-01T00:00:00.000Z` 
        })
        .getCount();

      return `CMD-${currentYear}-${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      return `CMD-${new Date().getFullYear()}-001`;
    }
  }

  async getSalesStats(companyId, period = 'month') {
    try {
      const quoteRepository = getRepository(SalesQuote);
      const orderRepository = getRepository(SalesOrder);
      
      let startDate;
      const now = new Date();
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const [quotesCount, ordersCount, quotesTotal, ordersTotal] = await Promise.all([
        quoteRepository
          .createQueryBuilder('quote')
          .where('quote.companyId = :companyId', { companyId })
          .andWhere('quote.createdAt >= :startDate', { startDate })
          .getCount(),
        orderRepository
          .createQueryBuilder('order')
          .where('order.companyId = :companyId', { companyId })
          .andWhere('order.createdAt >= :startDate', { startDate })
          .getCount(),
        quoteRepository
          .createQueryBuilder('quote')
          .select('SUM(quote.totalAmount)', 'total')
          .where('quote.companyId = :companyId', { companyId })
          .andWhere('quote.createdAt >= :startDate', { startDate })
          .getRawOne(),
        orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.totalAmount)', 'total')
          .where('order.companyId = :companyId', { companyId })
          .andWhere('order.createdAt >= :startDate', { startDate })
          .getRawOne()
      ]);

      return {
        period,
        quotes: {
          count: quotesCount,
          totalAmount: parseFloat(quotesTotal.total) || 0
        },
        orders: {
          count: ordersCount,
          totalAmount: parseFloat(ordersTotal.total) || 0
        },
        conversionRate: quotesCount > 0 ? (ordersCount / quotesCount * 100).toFixed(1) : 0
      };
    } catch (error) {
      throw new Error(`Erreur récupération statistiques ventes: ${error.message}`);
    }
  }
}

module.exports = new SalesDatabaseService();
