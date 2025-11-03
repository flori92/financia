import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";

export interface CommunicationMessage {
  id: string;
  type: "email" | "sms" | "whatsapp";
  recipient: string;
  subject?: string;
  content: string;
  status: "sent" | "delivered" | "read" | "failed";
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  cost?: number;
  campaignId?: string;
  templateId?: string;
  metadata?: {
    openRate?: number;
    clickRate?: number;
    responseRate?: number;
  };
}

export interface CommunicationCampaign {
  id: string;
  name: string;
  type: "email" | "sms" | "whatsapp" | "multi";
  status: "draft" | "active" | "completed" | "paused";
  targetAudience: number;
  sent: number;
  delivered: number;
  read: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  cost: number;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
  description?: string;
}

export interface CommunicationMetrics {
  totalMessages: number;
  totalCost: number;
  averageDeliveryTime: number;
  successRate: number;
  campaigns: CommunicationCampaign[];
  messages: CommunicationMessage[];
  channelBreakdown: Array<{
    channel: string;
    messages: number;
    cost: number;
    successRate: number;
  }>;
  performanceTrend: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
    cost: number;
  }>;
  alerts: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    campaignId?: string;
  }>;
}

export class CommunicationsService {
  /**
   * Récupère les métriques de communications
   */
  static async getCommunicationsMetrics(
    companyId?: string, 
    period?: string, 
    channel?: string
  ): Promise<CommunicationMetrics> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiGet(`/api/v1/communications/metrics`, { 
        companyId: cid, 
        period: period || '7',
        channel: channel || 'all'
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des métriques de communications:', error);
      return this.getMockMetrics();
    }
  }

  /**
   * Crée une nouvelle campagne de communication
   */
  static async createCampaign(
    campaignData: Omit<CommunicationCampaign, 'id' | 'sent' | 'delivered' | 'read' | 'openRate' | 'clickRate' | 'responseRate' | 'cost' | 'createdAt'>,
    companyId?: string
  ): Promise<CommunicationCampaign> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/communications/campaigns`, {
        ...campaignData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error);
      throw error;
    }
  }

  /**
   * Met à jour une campagne
   */
  static async updateCampaign(
    id: string, 
    campaignData: Partial<CommunicationCampaign>, 
    companyId?: string
  ): Promise<CommunicationCampaign> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPut(`/api/v1/communications/campaigns/${id}`, {
        ...campaignData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la campagne:', error);
      throw error;
    }
  }

  /**
   * Lance une campagne
   */
  static async launchCampaign(id: string, companyId?: string): Promise<{ success: boolean; message: string }> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/communications/campaigns/${id}/launch`, {
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du lancement de la campagne:', error);
      throw error;
    }
  }

  /**
   * Met en pause une campagne
   */
  static async pauseCampaign(id: string, companyId?: string): Promise<{ success: boolean; message: string }> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/communications/campaigns/${id}/pause`, {
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise en pause de la campagne:', error);
      throw error;
    }
  }

  /**
   * Supprime une campagne
   */
  static async deleteCampaign(id: string, companyId?: string): Promise<void> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      await apiDelete(`/api/v1/communications/campaigns/${id}`, { companyId: cid });
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error);
      throw error;
    }
  }

  /**
   * Envoie un message unique
   */
  static async sendMessage(
    messageData: Omit<CommunicationMessage, 'id' | 'status' | 'sentAt' | 'deliveredAt' | 'readAt' | 'cost'>,
    companyId?: string
  ): Promise<CommunicationMessage> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/communications/messages`, {
        ...messageData,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  /**
   * Exporte les données de communications en CSV
   */
  static async exportCommunicationsData(
    companyId?: string, 
    period?: string, 
    channel?: string
  ): Promise<Blob> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/communications/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bms_token')}`,
        },
        body: JSON.stringify({ companyId: cid, period, channel }),
      });

      if (!response.ok) {
        throw new Error(`Erreur d'export: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Erreur lors de l\'export des données de communications:', error);
      throw error;
    }
  }

  /**
   * Génère une campagne avec IA
   */
  static async generateAICampaign(
    prompt: string,
    targetAudience: number,
    companyId?: string
  ): Promise<Partial<CommunicationCampaign>> {
    const cid = companyId || getCompanyId();
    if (!cid) {
      throw new Error('Aucune société sélectionnée');
    }

    try {
      const response = await apiPost(`/api/v1/communications/ai/generate`, {
        prompt,
        targetAudience,
        companyId: cid
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération IA de campagne:', error);
      throw error;
    }
  }

  /**
   * Analyse les performances de communication
   */
  static analyzePerformance(metrics: CommunicationMetrics): {
    overallScore: number;
    recommendations: string[];
    bestChannel: string;
    worstChannel: string;
  } {
    // Calcul du score global (0-100)
    const deliveryScore = metrics.successRate;
    const costEfficiency = Math.max(0, 100 - (metrics.totalCost / metrics.totalMessages * 100));
    const readRate = metrics.messages.length > 0 
      ? metrics.messages.filter(m => m.status === 'read').length / metrics.messages.length * 100
      : 0;
    
    const overallScore = Math.round((deliveryScore + costEfficiency + readRate) / 3);

    // Recommandations
    const recommendations: string[] = [];
    
    if (metrics.successRate < 90) {
      recommendations.push('Améliorer la qualité des contacts pour augmenter le taux de livraison');
    }
    if (metrics.averageDeliveryTime > 5) {
      recommendations.push('Optimiser les paramètres d\'envoi pour réduire le temps de livraison');
    }
    
    const bestChannel = metrics.channelBreakdown.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
    
    const worstChannel = metrics.channelBreakdown.reduce((worst, current) => 
      current.successRate < worst.successRate ? current : worst
    );

    return {
      overallScore,
      recommendations,
      bestChannel: bestChannel.channel,
      worstChannel: worstChannel.channel
    };
  }

  /**
   * Calcule les tendances de performance
   */
  static calculateTrends(trendData: CommunicationMetrics['performanceTrend']): {
    sentTrend: number;
    deliveredTrend: number;
    readTrend: number;
    costTrend: number;
  } {
    if (trendData.length < 2) {
      return {
        sentTrend: 0,
        deliveredTrend: 0,
        readTrend: 0,
        costTrend: 0
      };
    }

    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];

    const sentTrend = ((latest.sent - previous.sent) / previous.sent) * 100;
    const deliveredTrend = ((latest.delivered - previous.delivered) / previous.delivered) * 100;
    const readTrend = ((latest.read - previous.read) / previous.read) * 100;
    const costTrend = ((latest.cost - previous.cost) / previous.cost) * 100;

    return {
      sentTrend: Math.round(sentTrend * 10) / 10,
      deliveredTrend: Math.round(deliveredTrend * 10) / 10,
      readTrend: Math.round(readTrend * 10) / 10,
      costTrend: Math.round(costTrend * 10) / 10,
    };
  }

  /**
   * Données mockées pour fallback
   */
  private static getMockMetrics(): CommunicationMetrics {
    return {
      totalMessages: 15420,
      totalCost: 285000,
      averageDeliveryTime: 2.3,
      successRate: 94.5,
      campaigns: [
        {
          id: "1",
          name: "Newsletter Mensuelle",
          type: "email",
          status: "completed",
          targetAudience: 5000,
          sent: 5000,
          delivered: 4850,
          read: 2900,
          openRate: 58.0,
          clickRate: 12.5,
          responseRate: 3.2,
          cost: 45000,
          createdAt: "2024-10-25T10:00:00Z",
          completedAt: "2024-10-25T11:30:00Z",
          description: "Informations mensuelles aux clients"
        },
        {
          id: "2",
          name: "Promotion Flash",
          type: "sms",
          status: "active",
          targetAudience: 2000,
          sent: 1800,
          delivered: 1750,
          read: 1400,
          openRate: 77.8,
          clickRate: 25.3,
          responseRate: 8.5,
          cost: 72000,
          createdAt: "2024-11-01T09:00:00Z",
          scheduledAt: "2024-11-01T10:00:00Z",
          description: "Offre spéciale limitée"
        },
        {
          id: "3",
          name: "Rappels Paiements",
          type: "whatsapp",
          status: "active",
          targetAudience: 500,
          sent: 450,
          delivered: 445,
          read: 420,
          openRate: 93.3,
          clickRate: 15.2,
          responseRate: 12.8,
          cost: 35000,
          createdAt: "2024-11-02T14:00:00Z",
          description: "Rappels automatiques de paiements"
        }
      ],
      messages: [
        {
          id: "1",
          type: "email",
          recipient: "client1@example.com",
          subject: "Newsletter Novembre",
          content: "Découvrez nos nouveautés...",
          status: "read",
          sentAt: "2024-11-03T10:30:00Z",
          deliveredAt: "2024-11-03T10:31:00Z",
          readAt: "2024-11-03T14:20:00Z",
          cost: 15,
          campaignId: "1",
          metadata: {
            openRate: 58.0,
            clickRate: 12.5,
            responseRate: 3.2
          }
        },
        {
          id: "2",
          type: "sms",
          recipient: "+22912345678",
          content: "Promotion flash -20% aujourd'hui!",
          status: "delivered",
          sentAt: "2024-11-03T11:15:00Z",
          deliveredAt: "2024-11-03T11:16:00Z",
          cost: 40,
          campaignId: "2"
        }
      ],
      channelBreakdown: [
        { channel: "Email", messages: 8500, cost: 127500, successRate: 95.2 },
        { channel: "SMS", messages: 4200, cost: 105000, successRate: 93.8 },
        { channel: "WhatsApp", messages: 2720, cost: 52500, successRate: 94.1 }
      ],
      performanceTrend: [
        { date: "Lun", sent: 2200, delivered: 2100, read: 1800, cost: 42000 },
        { date: "Mar", sent: 2400, delivered: 2280, read: 1950, cost: 45000 },
        { date: "Mer", sent: 2100, delivered: 2000, read: 1700, cost: 38000 },
        { date: "Jeu", sent: 2600, delivered: 2480, read: 2100, cost: 48000 },
        { date: "Ven", sent: 2300, delivered: 2200, read: 1850, cost: 44000 },
        { date: "Sam", sent: 1800, delivered: 1720, read: 1450, cost: 34000 },
        { date: "Dim", sent: 2000, delivered: 1900, read: 1600, cost: 38000 }
      ],
      alerts: [
        {
          type: "warning",
          title: "Taux d'ouverture faible",
          message: "La campagne 'Newsletter Mensuelle' a un taux d'ouverture inférieur à la moyenne",
          campaignId: "1"
        },
        {
          type: "info",
          title: "Performance SMS excellente",
          message: "Les SMS ont un taux de lecture de 77.8% cette semaine"
        }
      ]
    };
  }

  /**
   * Valide les données de communications
   */
  static validateMetrics(metrics: CommunicationMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof metrics.totalMessages !== 'number' || metrics.totalMessages < 0) {
      errors.push('Le nombre total de messages est invalide');
    }
    if (typeof metrics.totalCost !== 'number' || metrics.totalCost < 0) {
      errors.push('Le coût total est invalide');
    }
    if (typeof metrics.successRate !== 'number' || metrics.successRate < 0 || metrics.successRate > 100) {
      errors.push('Le taux de succès est invalide');
    }
    if (!Array.isArray(metrics.campaigns)) {
      errors.push('La liste des campagnes est invalide');
    }
    if (!Array.isArray(metrics.channelBreakdown)) {
      errors.push('La ventilation par canal est invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formate le montant en FCFA
   */
  static formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  /**
   * Détermine le statut d'une campagne
   */
  static getCampaignStatus(status: CommunicationCampaign['status']): string {
    switch (status) {
      case "draft": return "Brouillon";
      case "active": return "Active";
      case "completed": return "Terminée";
      case "paused": return "En pause";
      default: return "Inconnu";
    }
  }

  /**
   * Formate le type de communication
   */
  static getCommunicationType(type: CommunicationMessage['type']): string {
    switch (type) {
      case "email": return "Email";
      case "sms": return "SMS";
      case "whatsapp": return "WhatsApp";
      default: return "Inconnu";
    }
  }
}
