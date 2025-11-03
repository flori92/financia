"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernLayout } from "@/components/modern/ModernLayout";
import { DashboardCard } from "@/components/modern/DashboardCard";
import { SmartChart } from "@/components/modern/SmartChart";
import { SmartAlert, useSmartAlert } from "@/components/modern/SmartAlert";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  Eye,
  Plus,
  Download,
  RefreshCw,
  Target,
  Zap,
  Clock,
  TrendingUp as TrendIcon
} from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  currency: string;
  status: "Connecté" | "Manuel";
  lastUpdated: string;
  trend?: number;
}

interface TreasuryForecast {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  confidence?: number;
}

interface TreasuryMetrics {
  totalBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  runway: number;
  criticalThreshold: number;
  warningThreshold: number;
  accounts: BankAccount[];
  forecast: TreasuryForecast[];
  alerts: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
}

export default function ModernTreasuryPage() {
  const [data, setData] = useState<TreasuryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [refreshing, setRefreshing] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const { showSuccess, showError, showWarning, showInfo, showCritical } = useSmartAlert();

  useEffect(() => {
    loadTreasuryData();
  }, [selectedPeriod]);

  const loadTreasuryData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: TreasuryMetrics = {
        totalBalance: 2500000,
        totalInflow: 1800000,
        totalOutflow: 1200000,
        netCashFlow: 600000,
        runway: 45,
        criticalThreshold: 1000000,
        warningThreshold: 2000000,
        accounts: [
          {
            id: "1",
            name: "Compte Principal",
            bank: "ECOBANK",
            balance: 1500000,
            currency: "FCFA",
            status: "Connecté",
            lastUpdated: "2024-11-03T10:30:00Z",
            trend: 5.2
          },
          {
            id: "2", 
            name: "Compte Secondaire",
            bank: "UBA",
            balance: 1000000,
            currency: "FCFA",
            status: "Manuel",
            lastUpdated: "2024-11-03T09:15:00Z",
            trend: -2.1
          }
        ],
        forecast: [
          { date: "Sem 1", inflow: 450000, outflow: 300000, balance: 2650000, confidence: 95 },
          { date: "Sem 2", inflow: 380000, outflow: 350000, balance: 2680000, confidence: 90 },
          { date: "Sem 3", inflow: 520000, outflow: 400000, balance: 2800000, confidence: 85 },
          { date: "Sem 4", inflow: 450000, outflow: 380000, balance: 2870000, confidence: 80 }
        ],
        alerts: [
          {
            type: "warning",
            title: "Runway faible",
            message: "Votre trésorerie couvre seulement 45 jours d'exploitation",
            action: {
              label: "Voir les solutions",
              onClick: () => showInfo("Solutions", "Optimisez vos encaissements et réduisez les dépenses")
            }
          }
        ]
      };

      setData(mockData);
      
      // Alertes intelligentes basées sur les métriques
      if (mockData.runway < 15) {
        showCritical(
          "Trésorerie Critique",
          `Runway de ${mockData.runway} jours seulement. Action immédiate requise.`,
          [
            {
              label: "Plan d'urgence",
              onClick: () => showInfo("Plan", "Mise en place du plan de trésorerie d'urgence")
            },
            {
              label: "Contacter banque",
              onClick: () => showInfo("Contact", "Préparation dossier financement")
            }
          ]
        );
      } else if (mockData.runway < 30) {
        showWarning(
          "Trésorerie Faible",
          `Runway de ${mockData.runway} jours. Surveillez attentivement.`
        );
      } else {
        showSuccess("Trésorerie Saine", `Runway confortable de ${mockData.runway} jours`);
      }
    } catch (error) {
      showError("Erreur", "Impossible de charger les données de trésorerie");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTreasuryData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  const getRunwayColor = (runway: number) => {
    if (runway < 15) return "red";
    if (runway < 30) return "amber";
    return "green";
  };

  const getRunwayStatus = (runway: number) => {
    if (runway < 15) return "Critique";
    if (runway < 30) return "Faible";
    return "Sain";
  };

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
      title="Trésorerie" 
      subtitle="Gestion intelligente de vos flux de trésorerie"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showForecast 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <TrendingIcon className="w-4 h-4 inline mr-2" />
            Prévisions
          </button>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
                actions={alert.action ? [alert.action] : []}
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
            title="Solde Total"
            value={formatCurrency(data?.totalBalance || 0)}
            icon={Wallet}
            trend={{ value: 8.5, isPositive: true }}
            description="Tous comptes confondus"
            color="blue"
            loading={loading}
            onClick={() => showInfo("Détails", "Répartition par compte bancaire")}
          />
          
          <DashboardCard
            title="Encaissements"
            value={formatCurrency(data?.totalInflow || 0)}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            description={`Période: ${selectedPeriod} jours`}
            color="green"
            loading={loading}
          />
          
          <DashboardCard
            title="Décaissements"
            value={formatCurrency(data?.totalOutflow || 0)}
            icon={TrendingDown}
            trend={{ value: -5, isPositive: false }}
            description={`Période: ${selectedPeriod} jours`}
            color="red"
            loading={loading}
          />
          
          <DashboardCard
            title="Runway"
            value={`${data?.runway || 0} jours`}
            icon={Clock}
            description={getRunwayStatus(data?.runway || 0)}
            color={getRunwayColor(data?.runway || 0) as any}
            loading={loading}
          >
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (data?.runway || 0) >= 60 ? "bg-green-500" :
                    (data?.runway || 0) >= 30 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min((data?.runway || 0) / 90 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

        {/* Bank Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comptes Bancaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.accounts.map((account, index) => (
              <DashboardCard
                key={account.id}
                title={account.name}
                value={formatCurrency(account.balance)}
                icon={Wallet}
                trend={account.trend ? { value: Math.abs(account.trend), isPositive: account.trend > 0 } : undefined}
                description={`${account.bank} • ${account.status}`}
                color="blue"
                size="sm"
                loading={loading}
                onClick={() => showInfo("Compte", `Dernière mise à jour: ${new Date(account.lastUpdated).toLocaleString('fr-FR')}`)}
              />
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {showForecast && (
            <SmartChart
              data={data?.forecast.map(item => ({
                name: item.date,
                "Encaissements": item.inflow,
                "Décaissements": item.outflow,
                "Solde Prévu": item.balance
              })) || []}
              type="line"
              title="Prévisions de Trésorerie"
              subtitle="Prochaines 4 semaines"
              height={300}
              formatY={formatCurrency}
              onDataPointClick={(data) => showInfo("Prévision", `Confiance: ${data.confidence}%`)}
            />
          )}
          
          <SmartChart
            data={data?.forecast.map(item => ({
              name: item.date,
              "Flux Net": item.inflow - item.outflow,
              "Confiance": item.confidence || 0
            })) || []}
            type="bar"
            title="Analyse des Flux"
            subtitle="Net et niveau de confiance"
            height={300}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Analyse", `Flux net: ${formatCurrency(data["Flux Net"])}`)}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => showInfo("Nouveau virement", "Formulaire de virement bancaire")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Nouveau Virement</span>
            </button>
            
            <button
              onClick={() => showInfo("Export", "Export des données de trésorerie")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Exporter</span>
            </button>
            
            <button
              onClick={() => showInfo("Rapprochement", "Rapprochement bancaire automatique")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Rapprocher</span>
            </button>
            
            <button
              onClick={() => showInfo("Alertes", "Configuration des alertes de trésorerie")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Alertes</span>
            </button>
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
