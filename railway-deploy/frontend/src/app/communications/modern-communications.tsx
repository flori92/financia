"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernLayout } from "@/components/modern/ModernLayout";
import { DashboardCard } from "@/components/modern/DashboardCard";
import { SmartChart } from "@/components/modern/SmartChart";
import { SmartTable } from "@/components/modern/SmartTable";
import { SmartAlert, useSmartAlert } from "@/components/modern/SmartAlert";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye,
  Clock,
  Target,
  Zap,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";

interface CommunicationMessage {
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

interface CommunicationCampaign {
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

interface CommunicationMetrics {
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

export default function ModernCommunicationsPage() {
  const [data, setData] = useState<CommunicationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const { showSuccess, showError, showWarning, showInfo, showCritical } = useSmartAlert();

  useEffect(() => {
    loadCommunicationsData();
  }, [selectedPeriod, selectedChannel]);

  const loadCommunicationsData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: CommunicationMetrics = {
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

      setData(mockData);
      
      // Alertes intelligentes basées sur les métriques
      if (mockData.successRate < 90) {
        showCritical(
          "Taux de livraison critique",
          `Le taux de livraison est de ${mockData.successRate}% seulement`,
          [
            {
              label: "Analyser les échecs",
              onClick: () => showInfo("Analyse", "Diagnostic des problèmes de livraison")
            }
          ]
        );
      } else if (mockData.successRate < 95) {
        showWarning(
          "Performance à surveiller",
          `Taux de livraison: ${mockData.successRate}%`
        );
      } else {
        showSuccess(
          "Performance excellente",
          `Taux de livraison: ${mockData.successRate}%`
        );
      }
    } catch (error) {
      showError("Erreur", "Impossible de charger les données de communication");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunicationsData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <Send className="w-4 h-4 text-blue-600" />;
      case "delivered": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "read": return <Eye className="w-4 h-4 text-purple-600" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent": return "Envoyé";
      case "delivered": return "Livré";
      case "read": return "Lu";
      case "failed": return "Échec";
      default: return "Inconnu";
    }
  };

  const campaignColumns = [
    {
      key: "name" as const,
      title: "Campagne",
      sortable: true,
      filterable: true
    },
    {
      key: "type" as const,
      title: "Type",
      sortable: true,
      format: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === "email" ? "bg-blue-100 text-blue-800" :
          value === "sms" ? "bg-green-100 text-green-800" :
          value === "whatsapp" ? "bg-purple-100 text-purple-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: "targetAudience" as const,
      title: "Cible",
      sortable: true,
      format: (value: number) => value.toLocaleString('fr-FR'),
      align: "right" as const
    },
    {
      key: "sent" as const,
      title: "Envoyés",
      sortable: true,
      format: (value: number) => value.toLocaleString('fr-FR'),
      align: "right" as const
    },
    {
      key: "openRate" as const,
      title: "Taux Ouverture",
      sortable: true,
      format: (value: number) => `${value.toFixed(1)}%`,
      align: "right" as const
    },
    {
      key: "cost" as const,
      title: "Coût",
      sortable: true,
      format: (value: number) => formatCurrency(value),
      align: "right" as const
    },
    {
      key: "status" as const,
      title: "Statut",
      sortable: true,
      format: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === "completed" ? "bg-green-100 text-green-800" :
          value === "active" ? "bg-blue-100 text-blue-800" :
          value === "paused" ? "bg-amber-100 text-amber-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value === "completed" ? "Terminée" :
           value === "active" ? "Active" :
           value === "paused" ? "En pause" : "Brouillon"}
        </span>
      )
    }
  ];

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModernLayout 
      title="Communications" 
      subtitle="Gestion intelligente multi-canaux de vos communications"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous canaux</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Alertes */}
        {data?.alerts && data.alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {data.alerts.map((alert, index) => (
              <SmartAlert
                key={index}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                dismissible={true}
                autoClose={alert.type !== "critical"}
                duration={5000}
              />
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <DashboardCard
            title="Messages Envoyés"
            value={(data?.totalMessages || 0).toLocaleString('fr-FR')}
            icon={Send}
            trend={{ value: 15, isPositive: true }}
            description={`Période: ${selectedPeriod} jours`}
            color="blue"
            loading={loading}
            onClick={() => showInfo("Détails", "Répartition par canal et type")}
          />
          
          <DashboardCard
            title="Coût Total"
            value={formatCurrency(data?.totalCost || 0)}
            icon={Target}
            trend={{ value: -8, isPositive: true }}
            description="Optimisation des coûts"
            color="green"
            loading={loading}
          />
          
          <DashboardCard
            title="Taux de Livraison"
            value={`${(data?.successRate || 0).toFixed(1)}%`}
            icon={CheckCircle}
            trend={{ value: 2.5, isPositive: true }}
            description="Performance globale"
            color="purple"
            loading={loading}
          >
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data?.successRate || 0}%` }}
                ></div>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Temps de Livraison"
            value={`${data?.averageDeliveryTime || 0}s`}
            icon={Clock}
            trend={{ value: -12, isPositive: true }}
            description="Temps moyen de livraison"
            color="orange"
            loading={loading}
          />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SmartChart
            data={data?.performanceTrend.map(item => ({
              name: item.date,
              "Envoyés": item.sent,
              "Livrés": item.delivered,
              "Lus": item.read
            })) || []}
            type="area"
            title="Performance Quotidienne"
            subtitle="Évolution des messages"
            height={300}
            formatY={(value) => value.toLocaleString('fr-FR')}
            onDataPointClick={(data) => showInfo("Jour", `Performance détaillée pour ${data.name}`)}
          />
          
          <SmartChart
            data={data?.channelBreakdown.map(item => ({
              name: item.channel,
              "Messages": item.messages,
              "Taux Succès": item.successRate * 100
            })) || []}
            type="bar"
            title="Performance par Canal"
            subtitle="Messages et taux de succès"
            height={300}
            onDataPointClick={(data) => showInfo("Canal", `Analyse: ${data.name}`)}
          />
        </div>

        {/* Campaigns Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Campagnes Actives</h2>
              <button
                onClick={() => setShowCampaignBuilder(!showCampaignBuilder)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Campagne
              </button>
            </div>
            
            <SmartTable
              data={data?.campaigns || []}
              columns={campaignColumns}
              loading={loading}
              searchable={true}
              filterable={true}
              sortable={true}
              pagination={{ enabled: true, pageSize: 10 }}
              actions={{
                view: (row) => showInfo("Détails", `Campagne: ${row.name}`),
                edit: (row) => showInfo("Modifier", `Modification de ${row.name}`)
              }}
              onRowClick={(row) => showInfo("Analyse", `Performance: ${row.openRate.toFixed(1)}% ouverture`)}
              emptyState={{
                title: "Aucune campagne",
                description: "Créez votre première campagne pour commencer",
                icon: <MessageSquare className="w-8 h-8 text-gray-400" />
              }}
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => showInfo("Campagne IA", "Création de campagne avec IA")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Campagne IA</span>
            </button>
            
            <button
              onClick={() => showInfo("Templates", "Gestion des templates")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Templates</span>
            </button>
            
            <button
              onClick={() => showInfo("Automatisation", "Configuration des automatisations")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Automatisation</span>
            </button>
            
            <button
              onClick={() => showInfo("Analytics", "Analyse avancée des communications")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
