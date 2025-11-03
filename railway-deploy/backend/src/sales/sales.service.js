class SalesService {
  constructor() {
    // Pas d'injection dans cette version simple
  }

  async getDashboardMetrics(companyId) {
    try {
      // Simuler les données KPIs
      const mockData = {
        totalRevenue: 45000000,
        monthlyRevenue: 12500000,
        ordersCount: 156,
        clientsCount: 89,
        conversionRate: 23.5,
        averageOrderValue: 288461,
        topProducts: [
          { name: 'Produit A', revenue: 8500000, units: 45 },
          { name: 'Produit B', revenue: 6200000, units: 38 },
          { name: 'Produit C', revenue: 4800000, units: 52 }
        ],
        recentOrders: [
          { id: '1', orderNumber: 'CMD-2025-001', clientName: 'SARL Tech Solutions', amount: 2500000, status: 'confirmed' },
          { id: '2', orderNumber: 'CMD-2025-002', clientName: 'EURL Commerce Plus', amount: 1800000, status: 'processing' },
          { id: '3', orderNumber: 'CMD-2025-003', clientName: 'SA Industries Modernes', amount: 3200000, status: 'shipped' }
        ]
      };

      return mockData;
    } catch (error) {
      throw new Error(`Erreur récupération KPIs ventes: ${error.message}`);
    }
  }

  async getQuotes(companyId, status) {
    try {
      // Simuler les données devis
      const mockQuotes = [
        {
          id: "1",
          quoteNumber: "DEV-2025-001",
          clientName: "SARL Tech Solutions",
          clientId: "client1",
          totalAmount: 2500000,
          status: "sent",
          validUntil: "2025-02-15",
          createdAt: "2025-01-15",
          updatedAt: "2025-01-15",
          items: [
            { description: "Produit A", quantity: 10, unitPrice: 150000, total: 1500000 },
            { description: "Service B", quantity: 1, unitPrice: 1000000, total: 1000000 }
          ]
        },
        {
          id: "2",
          quoteNumber: "DEV-2025-002",
          clientName: "EURL Commerce Plus",
          clientId: "client2",
          totalAmount: 1800000,
          status: "accepted",
          validUntil: "2025-02-20",
          createdAt: "2025-01-18",
          updatedAt: "2025-01-20",
          items: [
            { description: "Produit C", quantity: 5, unitPrice: 360000, total: 1800000 }
          ]
        },
        {
          id: "3",
          quoteNumber: "DEV-2025-003",
          clientName: "SA Industries Modernes",
          clientId: "client3",
          totalAmount: 3200000,
          status: "draft",
          validUntil: "2025-02-25",
          createdAt: "2025-01-22",
          updatedAt: "2025-01-22",
          items: [
            { description: "Produit D", quantity: 8, unitPrice: 400000, total: 3200000 }
          ]
        }
      ];

      if (status) {
        return mockQuotes.filter(quote => quote.status === status);
      }

      return mockQuotes;
    } catch (error) {
      throw new Error(`Erreur récupération devis: ${error.message}`);
    }
  }

  async createQuote(createQuoteDto, companyId) {
    try {
      const quote = {
        id: Date.now().toString(),
        quoteNumber: `DEV-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        clientId: createQuoteDto.clientId,
        totalAmount: createQuoteDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        status: 'draft',
        validUntil: createQuoteDto.validUntil,
        items: createQuoteDto.items,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simuler récupération nom client
      const mockClients = [
        { id: "client1", name: "SARL Tech Solutions" },
        { id: "client2", name: "EURL Commerce Plus" },
        { id: "client3", name: "SA Industries Modernes" }
      ];

      const client = mockClients.find(c => c.id === createQuoteDto.clientId);
      quote.clientName = client?.name || "Client inconnu";

      return quote;
    } catch (error) {
      throw new Error(`Erreur création devis: ${error.message}`);
    }
  }

  async updateQuote(id, updateQuoteDto) {
    try {
      const quote = {
        id,
        ...updateQuoteDto,
        updatedAt: new Date().toISOString()
      };

      return quote;
    } catch (error) {
      throw new Error(`Erreur mise à jour devis: ${error.message}`);
    }
  }

  async sendQuote(id, sendDto) {
    try {
      // Simuler envoi email
      const result = {
        success: true,
        message: "Devis envoyé avec succès",
        quoteId: id,
        sentTo: sendDto.email,
        sentAt: new Date().toISOString()
      };

      return result;
    } catch (error) {
      throw new Error(`Erreur envoi devis: ${error.message}`);
    }
  }

  async getOrders(companyId, status) {
    try {
      const mockOrders = [
        {
          id: "1",
          orderNumber: "CMD-2025-001",
          clientName: "SARL Tech Solutions",
          clientId: "client1",
          totalAmount: 2500000,
          status: "confirmed",
          orderDate: "2025-01-15",
          expectedDeliveryDate: "2025-01-25",
          trackingNumber: "TRK-123456789",
          createdAt: "2025-01-15",
          updatedAt: "2025-01-16",
          items: [
            { description: "Produit A", quantity: 10, unitPrice: 150000, total: 1500000 },
            { description: "Service B", quantity: 1, unitPrice: 1000000, total: 1000000 }
          ]
        },
        {
          id: "2",
          orderNumber: "CMD-2025-002",
          clientName: "EURL Commerce Plus",
          clientId: "client2",
          totalAmount: 1800000,
          status: "processing",
          orderDate: "2025-01-18",
          expectedDeliveryDate: "2025-01-28",
          createdAt: "2025-01-18",
          updatedAt: "2025-01-19",
          items: [
            { description: "Produit C", quantity: 5, unitPrice: 360000, total: 1800000 }
          ]
        },
        {
          id: "3",
          orderNumber: "CMD-2025-003",
          clientName: "SA Industries Modernes",
          clientId: "client3",
          totalAmount: 3200000,
          status: "shipped",
          orderDate: "2025-01-20",
          expectedDeliveryDate: "2025-01-30",
          trackingNumber: "TRK-987654321",
          createdAt: "2025-01-20",
          updatedAt: "2025-01-22",
          items: [
            { description: "Produit D", quantity: 8, unitPrice: 400000, total: 3200000 }
          ]
        }
      ];

      if (status) {
        return mockOrders.filter(order => order.status === status);
      }

      return mockOrders;
    } catch (error) {
      throw new Error(`Erreur récupération commandes: ${error.message}`);
    }
  }

  async createOrder(createOrderDto, companyId) {
    try {
      const order = {
        id: Date.now().toString(),
        orderNumber: `CMD-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        clientId: createOrderDto.clientId,
        totalAmount: createOrderDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: createOrderDto.expectedDeliveryDate,
        items: createOrderDto.items,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simuler récupération nom client
      const mockClients = [
        { id: "client1", name: "SARL Tech Solutions" },
        { id: "client2", name: "EURL Commerce Plus" },
        { id: "client3", name: "SA Industries Modernes" }
      ];

      const client = mockClients.find(c => c.id === createOrderDto.clientId);
      order.clientName = client?.name || "Client inconnu";

      return order;
    } catch (error) {
      throw new Error(`Erreur création commande: ${error.message}`);
    }
  }

  async updateOrder(id, updateOrderDto) {
    try {
      const order = {
        id,
        ...updateOrderDto,
        updatedAt: new Date().toISOString()
      };

      return order;
    } catch (error) {
      throw new Error(`Erreur mise à jour commande: ${error.message}`);
    }
  }

  async getClients(companyId, status) {
    try {
      const mockClients = [
        {
          id: "1",
          name: "Jean Dupont",
          company: "SARL Tech Solutions",
          email: "jean.dupont@techsolutions.com",
          phone: "+229 97 123 456",
          address: "Cotonou, Quartier des Affaires",
          type: "company",
          status: "active",
          totalOrders: 12,
          totalRevenue: 15000000,
          lastOrderDate: "2025-01-20",
          createdAt: "2024-06-15",
          rating: 5
        },
        {
          id: "2",
          name: "Marie Claire",
          company: "EURL Commerce Plus",
          email: "marie.claire@commerceplus.com",
          phone: "+229 98 234 567",
          address: "Porto-Novo, Centre Commercial",
          type: "company",
          status: "active",
          totalOrders: 8,
          totalRevenue: 9500000,
          lastOrderDate: "2025-01-18",
          createdAt: "2024-08-20",
          rating: 4
        },
        {
          id: "3",
          name: "Paul Martin",
          email: "paul.martin@email.com",
          phone: "+229 99 345 678",
          address: "Abomey-Calavi, Résidence les Palmiers",
          type: "individual",
          status: "prospect",
          totalOrders: 0,
          totalRevenue: 0,
          createdAt: "2025-01-10",
          rating: 0
        }
      ];

      if (status) {
        return mockClients.filter(client => client.status === status);
      }

      return mockClients;
    } catch (error) {
      throw new Error(`Erreur récupération clients: ${error.message}`);
    }
  }

  async createClient(createClientDto, companyId) {
    try {
      const client = {
        id: Date.now().toString(),
        ...createClientDto,
        totalOrders: 0,
        totalRevenue: 0,
        status: 'prospect',
        rating: 0,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return client;
    } catch (error) {
      throw new Error(`Erreur création client: ${error.message}`);
    }
  }

  async updateClient(id, updateClientDto) {
    try {
      const client = {
        id,
        ...updateClientDto,
        updatedAt: new Date().toISOString()
      };

      return client;
    } catch (error) {
      throw new Error(`Erreur mise à jour client: ${error.message}`);
    }
  }
}

module.exports = SalesService;
