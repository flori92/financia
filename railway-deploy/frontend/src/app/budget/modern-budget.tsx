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
  Target, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Edit,
  Eye,
  Zap
} from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  type: "revenue" | "expense";
  department?: string;
  responsible?: string;
  status: "on-track" | "warning" | "critical" | "completed";
  lastUpdated: string;
}

interface BudgetMetrics {
  totalBudgeted: number;
  totalActual: number;
  overallVariance: number;
  overallVariancePercent: number;
  period: string;
  budgetItems: BudgetItem[];
  departmentBreakdown: Array<{
    name: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
  alerts: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    itemId?: string;
  }>;
}

export default function ModernBudgetPage() {
  const [data, setData] = useState<BudgetMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("2024-11");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showVarianceAnalysis, setShowVarianceAnalysis] = useState(false);
  const { showSuccess, showError, showWarning, showInfo, showCritical } = useSmartAlert();

  useEffect(() => {
    loadBudgetData();
  }, [selectedPeriod, selectedDepartment]);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: BudgetMetrics = {
        totalBudgeted: 5000000,
        totalActual: 4800000,
        overallVariance: 200000,
        overallVariancePercent: 4.0,
        period: selectedPeriod,
        budgetItems: [
          {
            id: "1",
            category: "Ventes",
            budgeted: 2000000,
            actual: 2200000,
            variance: 200000,
            variancePercent: 10.0,
            type: "revenue",
            department: "Commercial",
            responsible: "Directeur Commercial",
            status: "on-track",
            lastUpdated: "2024-11-03T10:30:00Z"
          },
          {
            id: "2",
            category: "Marketing",
            budgeted: 800000,
            actual: 950000,
            variance: -150000,
            variancePercent: -18.75,
            type: "expense",
            department: "Marketing",
            responsible: "Directeur Marketing",
            status: "warning",
            lastUpdated: "2024-11-03T09:15:00Z"
          },
          {
            id: "3",
            category: "Salaires",
            budgeted: 1500000,
            actual: 1450000,
            variance: 50000,
            variancePercent: 3.33,
            type: "expense",
            department: "RH",
            responsible: "Directeur RH",
            status: "on-track",
            lastUpdated: "2024-11-02T16:45:00Z"
          },
          {
            id: "4",
            category: "Frais Généraux",
            budgeted: 700000,
            actual: 200000,
            variance: 500000,
            variancePercent: 71.43,
            type: "expense",
            department: "Admin",
            responsible: "Directeur Admin",
            status: "completed",
            lastUpdated: "2024-11-01T14:20:00Z"
          }
        ],
        departmentBreakdown: [
          { name: "Commercial", budgeted: 2000000, actual: 2200000, variance: 200000 },
          { name: "Marketing", budgeted: 800000, actual: 950000, variance: -150000 },
          { name: "RH", budgeted: 1500000, actual: 1450000, variance: 50000 },
          { name: "Admin", budgeted: 700000, actual: 200000, variance: 500000 }
        ],
        monthlyTrend: [
          { month: "Août", budgeted: 4800000, actual: 4900000, variance: -100000 },
          { month: "Sept", budgeted: 4900000, actual: 4850000, variance: 50000 },
          { month: "Oct", budgeted: 4950000, actual: 4750000, variance: 200000 },
          { month: "Nov", budgeted: 5000000, actual: 4800000, variance: 200000 }
        ],
        alerts: [
          {
            type: "warning",
            title: "Dépassement Budget Marketing",
            message: "Le budget marketing est dépassé de 18.75%",
            itemId: "2"
          },
          {
            type: "info",
            title: "Performance Commerciale Excellente",
            message: "Les ventes dépassent le budget de 10%"
          }
        ]
      };

      setData(mockData);
      
      // Alertes intelligentes basées sur les métriques
      const criticalItems = mockData.budgetItems.filter(item => item.status === "critical");
      const warningItems = mockData.budgetItems.filter(item => item.status === "warning");
      
      if (criticalItems.length > 0) {
        showCritical(
          "Budget Critique",
          `${criticalItems.length} catégorie(s) en dépassement critique`,
          [
            {
              label: "Voir les détails",
              onClick: () => setShowVarianceAnalysis(true)
            }
          ]
        );
      } else if (warningItems.length > 0) {
        showWarning(
          "Attention Budget",
          `${warningItems.length} catégorie(s) nécessitent une attention`
        );
      } else {
        showSuccess("Budget Sous Contrôle", "Toutes les catégories sont dans les limites");
      }
    } catch (error) {
      showError("Erreur", "Impossible de charger les données budgétaires");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "green";
      case "warning": return "amber";
      case "critical": return "red";
      case "completed": return "blue";
      default: return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on-track": return "Dans la cible";
      case "warning": return "Attention";
      case "critical": return "Critique";
      case "completed": return "Terminé";
      default: return "Inconnu";
    }
  };

  const budgetColumns = [
    {
      key: "category" as const,
      title: "Catégorie",
      sortable: true,
      filterable: true
    },
    {
      key: "budgeted" as const,
      title: "Budget",
      sortable: true,
      format: (value: number) => formatCurrency(value),
      align: "right" as const
    },
    {
      key: "actual" as const,
      title: "Réalisé",
      sortable: true,
      format: (value: number) => formatCurrency(value),
      align: "right" as const
    },
    {
      key: "variance" as const,
      title: "Écart",
      sortable: true,
      format: (value: number, row: BudgetItem) => (
        <span className={value < 0 ? "text-red-600" : value > 0 ? "text-green-600" : "text-gray-600"}>
          {value > 0 ? "+" : ""}{formatCurrency(value)}
        </span>
      ),
      align: "right" as const
    },
    {
      key: "variancePercent" as const,
      title: "% Écart",
      sortable: true,
      format: (value: number) => (
        <span className={value < -10 ? "text-red-600" : value < 0 ? "text-amber-600" : value > 0 ? "text-green-600" : "text-gray-600"}>
          {value > 0 ? "+" : ""}{value.toFixed(1)}%
        </span>
      ),
      align: "right" as const
    },
    {
      key: "status" as const,
      title: "Statut",
      sortable: true,
      format: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === "on-track" ? "bg-green-100 text-green-800" :
          value === "warning" ? "bg-amber-100 text-amber-800" :
          value === "critical" ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {getStatusLabel(value)}
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
      title="Budget" 
      subtitle="Suivi intelligent et analyse prédictive des budgets"
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous départements</option>
              <option value="commercial">Commercial</option>
              <option value="marketing">Marketing</option>
              <option value="rh">RH</option>
              <option value="admin">Admin</option>
            </select>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
            title="Budget Total"
            value={formatCurrency(data?.totalBudgeted || 0)}
            icon={Target}
            description="Période sélectionnée"
            color="blue"
            loading={loading}
            onClick={() => showInfo("Détails", "Répartition par catégorie")}
          />
          
          <DashboardCard
            title="Dépenses Réelles"
            value={formatCurrency(data?.totalActual || 0)}
            icon={DollarSign}
            description="À ce jour"
            color="orange"
            loading={loading}
          />
          
          <DashboardCard
            title="Écart Total"
            value={formatCurrency(Math.abs(data?.overallVariance || 0))}
            icon={Activity}
            trend={{ value: Math.abs(data?.overallVariancePercent || 0), isPositive: (data?.overallVariance || 0) >= 0 }}
            description={(data?.overallVariance || 0) >= 0 ? "Économie" : "Dépassement"}
            color={(data?.overallVariance || 0) >= 0 ? "green" : "red"}
            loading={loading}
          />
          
          <DashboardCard
            title="Performance"
            value={`${(100 - Math.abs(data?.overallVariancePercent || 0)).toFixed(1)}%`}
            icon={BarChart3}
            description="Respect du budget"
            color="purple"
            loading={loading}
          >
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${100 - Math.abs(data?.overallVariancePercent || 0)}%` }}
                ></div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SmartChart
            data={data?.monthlyTrend.map(item => ({
              name: item.month,
              "Budget": item.budgeted,
              "Réalisé": item.actual,
              "Écart": item.variance
            })) || []}
            type="line"
            title="Tendance Mensuelle"
            subtitle="Budget vs Réalisé"
            height={300}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Mois", `Analyse détaillée pour ${data.name}`)}
          />
          
          <SmartChart
            data={data?.departmentBreakdown.map(item => ({
              name: item.name,
              "Budget": item.budgeted,
              "Réalisé": item.actual,
              "Écart": item.variance
            })) || []}
            type="bar"
            title="Performance par Département"
            subtitle="Analyse comparative"
            height={300}
            formatY={formatCurrency}
            onDataPointClick={(data) => showInfo("Département", `Performance: ${data.name}`)}
          />
        </div>

        {/* Budget Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <SmartTable
            data={data?.budgetItems || []}
            columns={budgetColumns}
            loading={loading}
            searchable={true}
            filterable={true}
            sortable={true}
            pagination={{ enabled: true, pageSize: 10 }}
            actions={{
              view: (row) => showInfo("Détails", `Catégorie: ${row.category}`),
              edit: (row) => showInfo("Modifier", `Modification du budget pour ${row.category}`)
            }}
            onRowClick={(row) => showInfo("Analyse", `Variance: ${row.variancePercent.toFixed(1)}%`)}
            emptyState={{
              title: "Aucune donnée budgétaire",
              description: "Commencez par créer des catégories budgétaires",
              icon: <Target className="w-8 h-8 text-gray-400" />
            }}
          />
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
              onClick={() => showInfo("Nouveau Budget", "Création d'une nouvelle catégorie budgétaire")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Nouveau Budget</span>
            </button>
            
            <button
              onClick={() => setShowVarianceAnalysis(!showVarianceAnalysis)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Analyse des Écarts</span>
            </button>
            
            <button
              onClick={() => showInfo("Export", "Export du rapport budgétaire")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Exporter</span>
            </button>
            
            <button
              onClick={() => showInfo("Prévisions", "Modèle prédictif des dépenses")}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Prévisions IA</span>
            </button>
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
