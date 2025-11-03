"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernLayout } from "@/components/modern/ModernLayout";
import { DashboardCard } from "@/components/modern/DashboardCard";
import { SmartChart } from "@/components/modern/SmartChart";
import { SmartTable } from "@/components/modern/SmartTable";
import { SmartAlert, useSmartAlert } from "@/components/modern/SmartAlert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Eye,
  Download,
  RefreshCw,
  Target,
  Activity,
  PieChart,
  BarChart3
} from "lucide-react";

interface AccountingMetrics {
  kpiMonth: {
    revenue: number;
    expenses: number;
    netIncome: number;
    margin: number;
  };
  evolutionChart: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  topClients: Array<{
    name: string;
    amount: number;
  }>;
  topSuppliers: Array<{
    name: string;
    amount: number;
  }>;
  financialRatios: {
    currentAssets: number;
    currentLiabilities: number;
    equity: number;
    totalLiabilities: number;
    liquidityRatio: number;
    solvencyRatio: number;
  };
  alerts: Array<{
    type: "danger" | "warning" | "info";
    title: string;
    message: string;
  }>;
  recentActivity: Array<{
    date: string;
    description: string;
    amount: number;
    type: string;
  }>;
}

export default function ModernAccountantDashboard() {
  const [data, setData] = useState<AccountingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useSmartAlert();

  // Simuler le chargement des données
  useEffect(() => {
    loadDashboard();
  }, [selectedPeriod]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données mockées intelligentes
      const mockData: AccountingMetrics = {
        kpiMonth: {
          revenue: 2500000,
          expenses: 1800000,
          netIncome: 700000,
          margin: 28
        },
        evolutionChart: [
          { month: "Jan", revenue: 1800000, expenses: 1500000 },
          { month: "Fév", revenue: 2000000, expenses: 1600000 },
          { month: "Mar", revenue: 2200000, expenses: 1700000 },
          { month: "Avr", revenue: 2100000, expenses: 1650000 },
          { month: "Mai", revenue: 2400000, expenses: 1750000 },
          { month: "Jun", revenue: 2500000, expenses: 1800000 }
        ],
        topClients: [
          { name: "Client A", amount: 450000 },
          { name: "Client B", amount: 380000 },
          { name: "Client C", amount: 320000 },
          { name: "Client D", amount: 280000 },
          { name: "Client E", amount: 220000 }
        ],
        topSuppliers: [
          { name: "Fournisseur X", amount: 320000 },
          { name: "Fournisseur Y", amount: 280000 },
          { name: "Fournisseur Z", amount: 240000 },
          { name: "Fournisseur W", amount: 180000 },
          { name: "Fournisseur V", amount: 150000 }
        ],
        financialRatios: {
          currentAssets: 3500000,
          currentLiabilities: 1200000,
          equity: 2800000,
          totalLiabilities: 1500000,
          liquidityRatio: 2.92,
          solvencyRatio: 1.87
        },
        alerts: [
          {
            type: "warning",
            title: "Factures en attente",
            message: "3 factures nécessitent une validation"
          },
          {
            type: "info",
            title: "Clôture de période",
            message: "La clôture du mois est disponible dans 5 jours"
          }
        ],
        recentActivity: [
          { date: "2024-11-03", description: "Facture FAC-2024-001", amount: 250000, type: "Vente" },
          { date: "2024-11-02", description: "Paiement Fournisseur A", amount: -180000, type: "Dépense" },
          { date: "2024-11-01", description: "Facture FAC-2024-002", amount: 320000, type: "Vente" }
        ]
      };

      setData(mockData);
      showInfo("Dashboard actualisé", "Les données ont été chargées avec succès");
    } catch (error) {
      showError("Erreur de chargement", "Impossible de charger les données du dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
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
      title="Dashboard Comptable" 
      subtitle="Vue d'ensemble en temps réel de votre performance financière"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Alerts */}
        {data?.alerts && data.alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {data.alerts.map((alert, index) => (
              <SmartAlert
                key={index}
                type={alert.type === "danger" ? "error" : alert.type}
                title={alert.title}
                message={alert.message}
                dismissible={true}
                autoClose={alert.type !== "danger"}
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
            title="Chiffre d'Affaires"
            value={formatCurrency(data?.kpiMonth.revenue || 0)}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            description="Produits classe 7"
            color="blue"
            loading={loading}
          />
          
          <DashboardCard
            title="Charges"
            value={formatCurrency(data?.kpiMonth.expenses || 0)}
            icon={TrendingDown}
            trend={{ value: 8, isPositive: false }}
            description="Charges classe 6"
            color="orange"
            loading={loading}
          />
          
          <DashboardCard
            title="Résultat Net"
            value={formatCurrency(data?.kpiMonth.netIncome || 0)}
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
            description={data?.kpiMonth.netIncome >= 0 ? "Bénéfice" : "Perte"}
            color={data?.kpiMonth.netIncome >= 0 ? "green" : "red"}
            loading={loading}
          />
          
          <DashboardCard
            title="Marge Brute"
            value={`${(data?.kpiMonth.margin || 0).toFixed(1)}%`}
            icon={Target}
            trend={{ value: 5, isPositive: true }}
            description={
              (data?.kpiMonth.margin || 0) >= 20 ? "Excellente" :
              (data?.kpiMonth.margin || 0) >= 10 ? "Bonne" : "Faible"
            }
            color="purple"
            loading={loading}
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SmartChart
            data={data?.evolutionChart || []}
            type="area"
            title="Évolution des Revenus et Charges"
            subtitle="6 derniers mois"
            height={300}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Détails", `Période: ${JSON.stringify(data)}`)}
          />
          
          <SmartChart
            data={data?.topClients.map((client, i) => ({
              name: client.name,
              value: client.amount
            })) || []}
            type="pie"
            title="Top 5 Clients"
            subtitle="Par chiffre d'affaires"
            height={300}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Client", `CA: ${formatCurrency(data.value)}`)}
          />
        </div>

        {/* Financial Ratios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <DashboardCard
            title="Ratio de Liquidité"
            value={(data?.financialRatios.liquidityRatio || 0).toFixed(2)}
            icon={Activity}
            description="Actif/Passif circulant"
            color="blue"
            size="lg"
          >
            <div className="flex items-center gap-2">
              {(data?.financialRatios.liquidityRatio || 0) >= 1.5 ? (
                <><CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Excellent</span></>
              ) : (data?.financialRatios.liquidityRatio || 0) >= 1 ? (
                <><AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-600">Acceptable</span></>
              ) : (
                <><AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Faible</span></>
              )}
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Ratio de Solvabilité"
            value={(data?.financialRatios.solvencyRatio || 0).toFixed(2)}
            icon={Target}
            description="Capitaux propres/Total passif"
            color="green"
            size="lg"
          >
            <div className="flex items-center gap-2">
              {(data?.financialRatios.solvencyRatio || 0) >= 0.5 ? (
                <><CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Solide</span></>
              ) : (data?.financialRatios.solvencyRatio || 0) >= 0.3 ? (
                <><AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-600">Modéré</span></>
              ) : (
                <><AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Fragile</span></>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Recent Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SmartChart
            data={data?.topSuppliers.map((supplier, i) => ({
              name: supplier.name,
              amount: supplier.amount
            })) || []}
            type="bar"
            title="Top Fournisseurs"
            subtitle="Par montant dû"
            height={250}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Fournisseur", `Montant: ${formatCurrency(data.value)}`)}
          />
        </motion.div>
      </div>
    </ModernLayout>
  );
}
