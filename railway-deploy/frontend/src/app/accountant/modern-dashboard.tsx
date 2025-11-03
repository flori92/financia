"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernLayout } from "@/components/modern/ModernLayout";
import { DashboardCard } from "@/components/modern/DashboardCard";
import { SmartChart } from "@/components/modern/SmartChart";
import { SmartTable } from "@/components/modern/SmartTable";
import { SmartAlert, useSmartAlert } from "@/components/modern/SmartAlert";
import { AccountingService, type AccountingMetrics } from "@/services/accounting-service";
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
      // Utiliser le vrai service API
      const metrics = await AccountingService.getDashboardMetrics();
      
      // Valider les données
      const validation = AccountingService.validateMetrics(metrics);
      if (!validation.isValid) {
        console.warn('Validation des métriques:', validation.errors);
        showWarning("Données incomplètes", "Certaines métriques peuvent être incorrectes");
      }

      setData(metrics);
      showInfo("Dashboard actualisé", "Les données ont été chargées avec succès");
    } catch (error) {
      showError("Erreur de chargement", "Impossible de charger les données du dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await AccountingService.refreshMetrics();
      await loadDashboard();
      showSuccess("Actualisé", "Les métriques ont été rafraîchies");
    } catch (error) {
      showError("Erreur", "Impossible de rafraîchir les métriques");
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await AccountingService.exportDashboardData(undefined, selectedPeriod);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-comptable-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess("Export réussi", "Les données ont été exportées en CSV");
    } catch (error) {
      showError("Erreur d'export", "Impossible d'exporter les données");
    }
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
            {data.alerts.map((alert: any, index: number) => (
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
            description={(data?.kpiMonth?.netIncome ?? 0) >= 0 ? "Bénéfice" : "Perte"}
            color={(data?.kpiMonth?.netIncome ?? 0) >= 0 ? "green" : "red"}
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
            data={data?.topClients.map((client: any, i: number) => ({
              name: client.name,
              value: client.amount
            })) || []}
            type="pie"
            title="Top 5 Clients"
            subtitle="Par chiffre d'affaires"
            height={300}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Client", `CA: ${formatCurrency(data?.value || 0)}`)}
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
            data={data?.topSuppliers.map((supplier: any, i: number) => ({
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

        {/* Actions Rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => showInfo("Nouvelle écriture", "Formulaire de saisie comptable")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Nouvelle Écriture</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Exporter</span>
            </button>
            
            <button
              onClick={() => showInfo("Rapports", "Génération des rapports comptables")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Rapports</span>
            </button>
            
            <button
              onClick={() => showInfo("Paramètres", "Configuration du module comptable")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Target className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Paramètres</span>
            </button>
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
