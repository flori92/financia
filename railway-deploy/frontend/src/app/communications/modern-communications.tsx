"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernLayout } from "@/components/modern/ModernLayout";
import { DashboardCard } from "@/components/modern/DashboardCard";
import { SmartChart } from "@/components/modern/SmartChart";
import { SmartTable } from "@/components/modern/SmartTable";
import { SmartAlert, useSmartAlert } from "@/components/modern/SmartAlert";
import { CommunicationsService, type CommunicationMetrics } from "@/services/communications-service";
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
      // Utiliser le vrai service API
      const metrics = await CommunicationsService.getCommunicationsMetrics(undefined, selectedPeriod, selectedChannel);
      
      // Valider les données
      const validation = CommunicationsService.validateMetrics(metrics);
      if (!validation.isValid) {
        console.warn('Validation des métriques de communications:', validation.errors);
        showWarning("Données incomplètes", "Certaines métriques peuvent être incorrectes");
      }

      setData(metrics);
      
      // Alertes intelligentes basées sur les métriques
      if (metrics.successRate < 90) {
        showCritical(
          "Taux de livraison critique",
          `Le taux de livraison est de ${metrics.successRate}% seulement`,
          [
            {
              label: "Analyser les échecs",
              onClick: () => showInfo("Analyse", "Diagnostic des problèmes de livraison")
            },
            {
              label: "Optimiser les contacts",
              onClick: () => showInfo("Optimisation", "Nettoyage de la base de contacts")
            }
          ]
        );
      } else if (metrics.successRate < 95) {
        showWarning(
          "Taux de livraison faible",
          `Le taux de livraison est de ${metrics.successRate}% - optimisation recommandée`
        );
      } else {
        showSuccess("Performance Excellente", `Taux de livraison de ${metrics.successRate}%`);
      }
    } catch (error) {
      showError("Erreur", "Impossible de charger les données de communication");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCommunicationsData();
      showSuccess("Actualisé", "Les données de communication ont été rafraîchies");
    } catch (error) {
      showError("Erreur", "Impossible de rafraîchir les données");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      showInfo("Nouvelle Campagne", "Formulaire de création de campagne multi-canaux");
      setShowCampaignBuilder(!showCampaignBuilder);
    } catch (error) {
      showError("Erreur", "Impossible d'ouvrir le formulaire de campagne");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await CommunicationsService.exportCommunicationsData(undefined, selectedPeriod, selectedChannel);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `communications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess("Export réussi", "Les données de communication ont été exportées");
    } catch (error) {
      showError("Erreur d'export", "Impossible d'exporter les données");
    }
  };

  const handleAIGeneration = async () => {
    try {
      showInfo("Génération IA", "Création de campagne avec intelligence artificielle");
      const aiCampaign = await CommunicationsService.generateAICampaign(
        "Campagne marketing promotionnelle pour les clients fidèles",
        1000
      );
      showSuccess("IA générée", "Campagne créée avec succès par l'IA");
    } catch (error) {
      showError("Erreur IA", "Impossible de générer la campagne avec l'IA");
    }
  };

  const handleTemplates = async () => {
    try {
      showInfo("Templates", "Bibliothèque de modèles de communication");
      // TODO: Ouvrir la bibliothèque de templates
    } catch (error) {
      showError("Erreur", "Impossible d'accéder aux templates");
    }
  };

  const handleAutomation = async () => {
    try {
      showInfo("Automatisation", "Configuration des scénarios de communication automatique");
      // TODO: Ouvrir les paramètres d'automatisation
    } catch (error) {
      showError("Erreur", "Impossible d'accéder à l'automatisation");
    }
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
              onClick={handleAIGeneration}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Campagne IA</span>
            </button>
            
            <button
              onClick={handleTemplates}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Templates</span>
            </button>
            
            <button
              onClick={handleAutomation}
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
