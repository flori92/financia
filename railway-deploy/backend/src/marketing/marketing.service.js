class MarketingService {
  constructor() {
    // Pas d'injection dans cette version simple
  }

  async getDashboardMetrics(companyId) {
    try {
      const mockData = {
        totalCampaigns: 24,
        activeCampaigns: 6,
        totalLeads: 1850,
        conversionRate: 12.5,
        monthlyBudget: 5000000,
        roi: 245,
        emailSubscribers: 3200,
        socialMediaFollowers: 12500,
        topPerformingCampaigns: [
          { name: 'Lancement Produit Q1', leads: 450, conversion: 18.5, roi: 320 },
          { name: 'Soldes Hiver', leads: 380, conversion: 15.2, roi: 280 },
          { name: 'Newsletter Mensuelle', leads: 290, conversion: 8.7, roi: 180 }
        ],
        channelPerformance: [
          { channel: 'Email', leads: 620, conversion: 15.8, cost: 450000 },
          { channel: 'Social Media', leads: 480, conversion: 12.3, cost: 680000 },
          { channel: 'Google Ads', leads: 350, conversion: 18.2, cost: 820000 },
          { channel: 'Content', leads: 400, conversion: 9.5, cost: 320000 }
        ]
      };

      return mockData;
    } catch (error) {
      throw new Error(`Erreur récupération KPIs marketing: ${error.message}`);
    }
  }

  async getCampaigns(companyId, status) {
    try {
      const mockCampaigns = [
        {
          id: "1",
          name: "Lancement Produit Q1 2025",
          type: "multi_channel",
          status: "active",
          startDate: "2025-01-01",
          endDate: "2025-03-31",
          budget: 2500000,
          spent: 1700000,
          leads: 450,
          conversions: 83,
          roi: 320,
          channels: ["email", "social", "google_ads"],
          description: "Campagne lancement nouveau produit"
        },
        {
          id: "2",
          name: "Promotion Soldes Hiver",
          type: "seasonal",
          status: "active",
          startDate: "2024-12-15",
          endDate: "2025-01-31",
          budget: 1800000,
          spent: 810000,
          leads: 380,
          conversions: 58,
          roi: 280,
          channels: ["email", "social"],
          description: "Promotion soldes hiver avec réductions"
        },
        {
          id: "3",
          name: "Newsletter Mensuelle",
          type: "email",
          status: "active",
          startDate: "2025-01-01",
          endDate: "2025-01-31",
          budget: 300000,
          spent: 276000,
          leads: 290,
          conversions: 25,
          roi: 180,
          channels: ["email"],
          description: "Newsletter mensuelle avec actualités"
        }
      ];

      if (status) {
        return mockCampaigns.filter(campaign => campaign.status === status);
      }

      return mockCampaigns;
    } catch (error) {
      throw new Error(`Erreur récupération campagnes: ${error.message}`);
    }
  }

  async createCampaign(createCampaignDto, companyId) {
    try {
      const campaign = {
        id: Date.now().toString(),
        ...createCampaignDto,
        companyId,
        status: 'draft',
        spent: 0,
        leads: 0,
        conversions: 0,
        roi: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return campaign;
    } catch (error) {
      throw new Error(`Erreur création campagne: ${error.message}`);
    }
  }

  async updateCampaign(id, updateCampaignDto) {
    try {
      const campaign = {
        id,
        ...updateCampaignDto,
        updatedAt: new Date().toISOString()
      };

      return campaign;
    } catch (error) {
      throw new Error(`Erreur mise à jour campagne: ${error.message}`);
    }
  }

  async getLeads(companyId, status) {
    try {
      const mockLeads = [
        {
          id: "1",
          firstName: "Alice",
          lastName: "Design",
          email: "alice.design@company.com",
          phone: "+229 97 123 456",
          company: "Design Studio Pro",
          source: "google_ads",
          status: "new",
          score: 85,
          assignedTo: "sales_rep_1",
          createdAt: "2025-01-20",
          lastContact: "2025-01-21"
        },
        {
          id: "2",
          firstName: "Bob",
          lastName: "Developer",
          email: "bob.dev@techcorp.com",
          phone: "+229 98 234 567",
          company: "TechCorp Solutions",
          source: "email",
          status: "contacted",
          score: 72,
          assignedTo: "sales_rep_2",
          createdAt: "2025-01-18",
          lastContact: "2025-01-19"
        },
        {
          id: "3",
          firstName: "Charlie",
          lastName: "Marketing",
          email: "charlie@marketing.com",
          phone: "+229 99 345 678",
          company: "Marketing Agency",
          source: "social",
          status: "qualified",
          score: 90,
          assignedTo: "sales_rep_1",
          createdAt: "2025-01-15",
          lastContact: "2025-01-22"
        }
      ];

      if (status) {
        return mockLeads.filter(lead => lead.status === status);
      }

      return mockLeads;
    } catch (error) {
      throw new Error(`Erreur récupération leads: ${error.message}`);
    }
  }

  async createLead(createLeadDto, companyId) {
    try {
      const lead = {
        id: Date.now().toString(),
        ...createLeadDto,
        companyId,
        status: 'new',
        score: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return lead;
    } catch (error) {
      throw new Error(`Erreur création lead: ${error.message}`);
    }
  }

  async getAnalytics(companyId, period) {
    try {
      const currentPeriod = period || 'last_30_days';
      
      const mockAnalytics = {
        period: currentPeriod,
        totalLeads: 1850,
        totalConversions: 231,
        conversionRate: 12.5,
        totalSpent: 5000000,
        totalRevenue: 12250000,
        roi: 245,
        channelBreakdown: [
          { channel: 'Email', leads: 620, conversions: 98, cost: 450000, revenue: 3430000, roi: 662 },
          { channel: 'Social Media', leads: 480, conversions: 59, cost: 680000, revenue: 2065000, roi: 204 },
          { channel: 'Google Ads', leads: 350, conversions: 64, cost: 820000, revenue: 2240000, roi: 173 },
          { channel: 'Content', leads: 400, conversions: 10, cost: 320000, revenue: 450000, roi: 41 }
        ],
        trendData: [
          { date: '2025-01-01', leads: 45, conversions: 6, cost: 180000 },
          { date: '2025-01-07', leads: 52, conversions: 7, cost: 195000 },
          { date: '2025-01-14', leads: 48, conversions: 5, cost: 175000 },
          { date: '2025-01-21', leads: 61, conversions: 8, cost: 210000 }
        ]
      };

      return mockAnalytics;
    } catch (error) {
      throw new Error(`Erreur récupération analytics: ${error.message}`);
    }
  }
}

module.exports = MarketingService;
