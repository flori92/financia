"use client";

import { useMemo, useState, useEffect } from "react";
import { useDashboardData, DashboardMetrics, DashboardData, BankTransaction } from "@/hooks/useDashboardData";
import { DashboardCustomizer } from "@/components/dashboard/DashboardCustomizer";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Building,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Globe,
  Percent,
  Smartphone,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap
} from "lucide-react";

type AlertLevel = "danger" | "warning" | "info";

type DashboardAlert = {
  level: AlertLevel;
  title: string;
  message: string;
};

type QuickStat = {
  label: string;
  value: string;
};

type AccountingAlert = DashboardMetrics["alerts"][number];
type TreasuryAlert = {
  level: string;
  title: string;
  message: string;
};

type TaskItem = {
  title: string;
  message: string;
  level: AlertLevel;
  badge?: string;
  deadline?: string;
};

type ChartDatum = {
  label: string;
  revenue: number;
  expenses: number;
  balance: number;
};

type DashboardEntry = DashboardMetrics["recentActivity"]["entries"][number];

type QuickModule = {
  title: string;
  subtitle: string;
  icon: JSX.Element;
  stats: { label: string; value: string }[];
  badges: string[];
};

function formatCurrency(value?: number) {
  const v = typeof value === "number" ? value : 0;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v)} FCFA`;
}

function formatPercent(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
}

function variation(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

type WidgetConfig = {
  id: string;
  title: string;
  visible: boolean;
  category: string;
};

const defaultWidgets: WidgetConfig[] = [
  { id: "kpis", title: "KPIs principaux", visible: true, category: "Indicateurs" },
  { id: "ratios", title: "Ratios financiers", visible: true, category: "Indicateurs" },
  { id: "chart", title: "Évolution trésorerie & CA", visible: true, category: "Graphiques" },
  { id: "alerts", title: "Alertes", visible: true, category: "Notifications" },
  { id: "stats", title: "Statistiques rapides", visible: true, category: "Indicateurs" },
  { id: "modules", title: "Modules rapides", visible: true, category: "Modules" },
  { id: "transactions", title: "Transactions récentes", visible: true, category: "Activité" },
  { id: "tasks", title: "Tâches en attente", visible: true, category: "Activité" },
  { id: "features", title: "Fonctionnalités ERP", visible: true, category: "Informations" },
];

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboardData();
  const metrics: DashboardMetrics | undefined = data?.metrics;
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [chartPeriod, setChartPeriod] = useState<'12months' | 'year' | 'multi'>('12months');

  useEffect(() => {
    const saved = localStorage.getItem("dashboardWidgets");
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  const handleWidgetsUpdate = (updated: WidgetConfig[]) => {
    setWidgets(updated);
    localStorage.setItem("dashboardWidgets", JSON.stringify(updated));
  };

  const isVisible = (id: string) => widgets.find(w => w.id === id)?.visible ?? true;

  const evolution = metrics?.evolutionChart ?? [];
  const treasurySeries = data?.forecast?.series ?? [];
  const treasuryLast = treasurySeries.length ? treasurySeries[treasurySeries.length - 1] : undefined;
  const treasuryPrev = treasurySeries.length > 1 ? treasurySeries[treasurySeries.length - 2] : undefined;
  const treasuryBalance = treasuryLast?.balance ?? data?.forecast?.summary?.currentBalance ?? 0;
  const prevTreasuryBalance = treasuryPrev?.balance ?? 0;
  const treasuryVar = variation(treasuryBalance, prevTreasuryBalance);

  const netIncome = metrics?.kpiMonth.netIncome ?? 0;
  const prevIncome = evolution.length > 1
    ? (evolution[evolution.length - 2]?.revenue ?? 0) - (evolution[evolution.length - 2]?.expenses ?? 0)
    : 0;
  const netIncomeVar = variation(netIncome, prevIncome);

  const monthRevenue = metrics?.kpiMonth.revenue ?? 0;
  const prevRevenue = evolution.length > 1 ? evolution[evolution.length - 2]?.revenue ?? 0 : 0;
  const revenueVar = variation(monthRevenue, prevRevenue);

  const ytdRevenue = evolution.reduce<number>((sum: number, month: DashboardMetrics["evolutionChart"][number]) => sum + (month.revenue || 0), 0);
  const financialRatios = metrics?.financialRatios;
  const bfr = (financialRatios?.currentAssets ?? 0) - (financialRatios?.currentLiabilities ?? 0);
  const liquidity = financialRatios?.liquidityRatio ?? 0;
  const equity = financialRatios?.equity ?? 0;
  const roe = equity ? (netIncome * 12) / equity : 0;
  const liabilities = financialRatios?.totalLiabilities ?? 0;
  const debtRatio = liabilities ? (1 - (equity / liabilities)) * 100 : 0;

  const agedReceivables = data?.agedReceivables?.totals?.total ?? 0;
  const agedPayables = data?.agedPayables?.totals?.total ?? 0;
  const yearlyRevenue = evolution.reduce<number>((sum: number, item: DashboardMetrics["evolutionChart"][number]) => sum + (item.revenue || 0), 0);
  const yearlyExpenses = evolution.reduce<number>((sum: number, item: DashboardMetrics["evolutionChart"][number]) => sum + (item.expenses || 0), 0);
  const dso = yearlyRevenue ? (agedReceivables / (yearlyRevenue / 365)) : 0;
  const dpo = yearlyExpenses ? (agedPayables / (yearlyExpenses / 365)) : 0;

  const vatNet = data?.vat?.netVat ?? 0;
  const nextVatDue = new Date();
  nextVatDue.setMonth(nextVatDue.getMonth() + 1, 15);

  const bankingTx: BankTransaction[] = data?.bankingTransactions ?? [];
  const pendingBanking = bankingTx.filter((tx) => tx.status === "pending").length;
  const reconciledBanking = bankingTx.filter((tx) => tx.status === "reconciled").length;
  const reconciliationRate = bankingTx.length ? (reconciledBanking / bankingTx.length) * 100 : 0;

  const alerts: DashboardAlert[] = useMemo(() => {
    const acc = (metrics?.alerts ?? []).map((alert: AccountingAlert): DashboardAlert => ({
      level: alert.type as AlertLevel,
      title: alert.title,
      message: alert.message
    }));
    const treasuryAlerts = (data?.treasuryAlerts?.alerts ?? []) as TreasuryAlert[];
    const tre = treasuryAlerts.map((alert): DashboardAlert => ({
      level: alert.level === "critical" ? "danger" : alert.level === "warning" ? "warning" : "info",
      title: alert.title,
      message: alert.message
    }));
    const order: Record<AlertLevel, number> = { danger: 0, warning: 1, info: 2 };
    return [...acc, ...tre].sort((a, b) => order[a.level] - order[b.level]);
  }, [metrics?.alerts, data?.treasuryAlerts?.alerts]);

  const tasks = useMemo(() => {
    const items: TaskItem[] = [];
    if (pendingBanking) {
      items.push({
        title: "Valider rapprochement bancaire",
        message: `${pendingBanking} opérations à rapprocher`,
        level: "danger",
        badge: "Urgent",
        deadline: "Aujourd'hui"
      });
    }
    if (vatNet > 0) {
      items.push({
        title: "Télétransmettre déclaration CA3",
        message: `${formatCurrency(vatNet)} à reverser`,
        level: "warning",
        badge: "Important",
        deadline: `Échéance: ${formatDate(nextVatDue.toISOString())}`
      });
    }
    const over90Receivables = data?.agedReceivables?.totals?.over90 ?? 0;
    if (over90Receivables > 0) {
      items.push({
        title: "Relancer clients en retard",
        message: `${formatCurrency(over90Receivables)} > 90 jours`,
        level: "warning",
        badge: "Relance"
      });
    }
    const over90Payables = data?.agedPayables?.totals?.over90 ?? 0;
    if (over90Payables > 0) {
      items.push({
        title: "Planifier règlements fournisseurs",
        message: `${formatCurrency(over90Payables)} à régler (>90j)`,
        level: "warning"
      });
    }
    if (items.length) {
      return items;
    }
    if (alerts.length) {
      const first = alerts[0];
      return [{ title: first.title, message: first.message, level: first.level }];
    }
    return [] as TaskItem[];
  }, [pendingBanking, vatNet, data?.agedReceivables?.totals?.over90, data?.agedPayables?.totals?.over90, alerts, nextVatDue]);

  const recentEntries: DashboardEntry[] = metrics?.recentActivity.entries ?? [];

  const chartData = useMemo<ChartDatum[]>(() => {
    if (!evolution.length) return [];
    let dataToShow = evolution;
    if (chartPeriod === '12months') {
      dataToShow = evolution.slice(-12);
    } else if (chartPeriod === 'year') {
      const currentYear = new Date().getFullYear();
      dataToShow = evolution.filter((_, i) => i >= 0 && i < 12);
    }
    const treasurySlice = treasurySeries.slice(-dataToShow.length);
    return dataToShow.map((item: DashboardMetrics["evolutionChart"][number], index: number): ChartDatum => ({
      label: item.month,
      revenue: item.revenue,
      expenses: item.expenses,
      balance: treasurySlice[index]?.balance ?? treasuryBalance
    }));
  }, [evolution, treasurySeries, treasuryBalance, chartPeriod]);

  const quickStats: QuickStat[] = [
    {
      label: "Écritures ce mois",
      value: `${recentEntries.length}`
    },
    {
      label: "Lettrage auto",
      value: bankingTx.length ? `${Math.round(reconciliationRate)}%` : "0%"
    },
    { label: "OCR factures", value: "—" },
    {
      label: "Rappr. bancaire",
      value: bankingTx.length ? `${reconciledBanking}/${bankingTx.length}` : "0/0"
    }
  ];

  const modules: QuickModule[] = [
    {
      title: "Comptabilité générale",
      subtitle: "Multi-référentiels & axes",
      icon: <Building className="text-[#0D9488] w-[22px] h-[22px]" strokeWidth={1.5} />,
      stats: [
        { label: "Résultat net", value: formatCurrency(netIncome) },
        { label: "Marge brute", value: `${(metrics?.kpiMonth.margin ?? 0).toFixed(1)}%` },
        { label: "Alertes", value: `${alerts.length}` }
      ],
      badges: ["OCR IA", "Auto-lettrage"]
    },
    {
      title: "Trésorerie",
      subtitle: "Multi-banques & prévisionnel",
      icon: <Wallet className="text-blue-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
      stats: [
        { label: "Solde", value: formatCurrency(treasuryBalance) },
        { label: "Runway", value: data?.treasuryAlerts?.metrics?.runwayDays ? `${Math.round(data.treasuryAlerts.metrics.runwayDays)} j` : "—" },
        { label: "Rappro.", value: `${reconciledBanking}/${bankingTx.length}` }
      ],
      badges: ["API Bancaire", "SEPA"]
    },
    {
      title: "Facturation",
      subtitle: "Électronique & relances",
      icon: <Percent className="text-orange-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
      stats: [
        { label: "TVA due", value: formatCurrency(vatNet) },
        { label: "Clients >90j", value: formatCurrency(data?.agedReceivables?.totals?.over90) },
        { label: "Fournisseurs >90j", value: formatCurrency(data?.agedPayables?.totals?.over90) }
      ],
      badges: ["Factur-X", "Relances"]
    },
    {
      title: "Fiscalité",
      subtitle: "TVA, IS, déclarations",
      icon: <CalendarClock className="text-yellow-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
      stats: [
        { label: "Échéance", value: formatDate(nextVatDue.toISOString()) },
        { label: "Statut", value: data?.lastClosure?.status ?? "—" },
        { label: "Net TVA", value: formatCurrency(vatNet) }
      ],
      badges: ["Auto-calcul", "DGI"]
    },
    {
      title: "Budget & Contrôle",
      subtitle: "Analytique multi-axes",
      icon: <Target className="text-purple-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
      stats: [
        { label: "BFR", value: formatCurrency(bfr) },
        { label: "DSO", value: dso ? `${Math.round(dso)} j` : "—" },
        { label: "DPO", value: dpo ? `${Math.round(dpo)} j` : "—" }
      ],
      badges: ["10 axes", "Alertes"]
    },
    {
      title: "Reporting & BI",
      subtitle: "Dashboards & OLAP",
      icon: <TrendingUp className="text-indigo-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
      stats: [
        { label: "CA YTD", value: formatCurrency(ytdRevenue) },
        { label: "ROE", value: roe ? `${roe.toFixed(1)}%` : "—" },
        { label: "Endettement", value: debtRatio ? `${debtRatio.toFixed(1)}%` : "—" }
      ],
      badges: ["Power BI", "API"]
    }
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500">Chargement du tableau de bord…</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-rose-600 text-lg font-semibold">{error}</div>
        <button onClick={reload} className="px-4 py-2 rounded-md bg-[#0D9488] text-white text-sm hover:bg-[#0B7C74]">Réessayer</button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-600">
        <div>Aucune donnée disponible pour cette société.</div>
        <button onClick={reload} className="px-4 py-2 rounded-md bg-[#0D9488] text-white text-sm hover:bg-[#0B7C74]">Actualiser</button>
      </div>
    );
  }

  const isSynced = !alerts.some((alert: DashboardAlert) => alert.level === "danger");
  const lastClosure = data?.lastClosure?.endDate ? formatDate(data.lastClosure.endDate) : "—";
  const lastClosureStatus = data?.lastClosure?.status ?? "";
  const currentYear = new Date().getFullYear();
  const chartMax = chartData.reduce((max, item) => Math.max(max, item.revenue, item.expenses, Math.abs(item.balance)), 0);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-[#0F3D3A] to-[#0D9488] rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord ERP</h1>
              <button onClick={reload} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium">
                Actualiser
              </button>
              <DashboardCustomizer widgets={widgets} onUpdate={handleWidgetsUpdate} />
            </div>
            <p className="text-white/80 text-lg mt-2 mb-6">
              Vue consolidée de votre activité comptable, trésorerie et fiscale
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Exercice {currentYear}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Building className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Toutes les entités</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isSynced ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isSynced ? "bg-green-400" : "bg-amber-400"}`} />
                <span className="text-sm font-medium">
                  {isSynced ? "Données synchronisées" : "Vérifications recommandées"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60 mb-1">Dernière clôture</div>
            <div className="text-2xl font-semibold">{lastClosure}</div>
            <div className="text-xs text-white/60 mt-1">{lastClosureStatus}</div>
          </div>
        </div>
      </section>

      {isVisible("kpis") && <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Wallet className="text-[#0D9488] w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: formatPercent(treasuryVar),
            variationTone: treasuryVar >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50",
            title: "Trésorerie nette",
            value: formatCurrency(treasuryBalance),
            footer: data?.treasuryAlerts?.metrics?.runwayDays
              ? `${Math.round(data.treasuryAlerts.metrics.runwayDays)} jours de couverture`
              : "Runway à surveiller"
          },
          {
            icon: <TrendingUp className="text-blue-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: formatPercent(revenueVar),
            variationTone: revenueVar >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50",
            title: `CA ${currentYear} (YTD)`,
            value: formatCurrency(ytdRevenue),
            footer: "Objectif en cours"
          },
          {
            icon: <Activity className="text-green-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: formatPercent(netIncomeVar),
            variationTone: netIncomeVar >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50",
            title: "Résultat net (mois)",
            value: formatCurrency(netIncome),
            footer: `Marge: ${(metrics?.kpiMonth.margin ?? 0).toFixed(1)}%`
          },
          {
            icon: <Percent className="text-orange-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: "À payer",
            variationTone: "text-orange-600 bg-orange-50",
            title: "TVA due (CA3)",
            value: formatCurrency(vatNet),
            footer: `Échéance: ${formatDate(nextVatDue.toISOString())}`
          }
        ].map((kpi, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                {kpi.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${kpi.variationTone}`}>{kpi.variation}</span>
            </div>
            <div className="text-sm text-gray-500 mb-1 font-medium">{kpi.title}</div>
            <div className="text-3xl font-semibold tracking-tight mb-2">{kpi.value}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              <span>{kpi.footer}</span>
            </div>
          </div>
        ))}
      </section>}

      {isVisible("ratios") && <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "BFR", value: formatCurrency(bfr), hint: "Variation vs N-1 indisponible", tone: "text-gray-500" },
          { label: "DSO", value: dso ? `${Math.round(dso)} jours` : "—", hint: "Optimiser le recouvrement", tone: "text-green-600" },
          { label: "DPO", value: dpo ? `${Math.round(dpo)} jours` : "—", hint: "Suivi fournisseurs", tone: "text-gray-500" },
          { label: "ROE", value: roe ? `${roe.toFixed(1)}%` : "—", hint: "Performance des capitaux", tone: "text-green-600" },
          { label: "Ratio liquidité", value: liquidity.toFixed(2), hint: liquidity >= 1.5 ? "Excellent" : liquidity >= 1 ? "Acceptable" : "Faible", tone: liquidity >= 1.5 ? "text-green-600" : "text-amber-600" },
          { label: "Taux endettement", value: debtRatio ? `${debtRatio.toFixed(1)}%` : "—", hint: "Structure financière", tone: "text-gray-500" }
        ].map((metric, idx: number) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1 font-medium">{metric.label}</div>
            <div className="text-xl font-semibold mb-1">{metric.value}</div>
            <div className={`text-xs ${metric.tone}`}>{metric.hint}</div>
          </div>
        ))}
      </section>}

      {isVisible("chart") && <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Évolution trésorerie & CA</h2>
              <p className="text-sm text-gray-500 mt-1">Analyse croisée sur 12 mois avec prévisionnel</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setChartPeriod('12months')}
                className={`px-3 py-1.5 rounded-lg transition ${chartPeriod === '12months' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                12 mois
              </button>
              <button
                onClick={() => setChartPeriod('year')}
                className={`px-3 py-1.5 rounded-lg transition ${chartPeriod === 'year' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Année
              </button>
              <button
                onClick={() => setChartPeriod('multi')}
                className={`px-3 py-1.5 rounded-lg transition ${chartPeriod === 'multi' ? 'bg-[#0D9488] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Multi-années
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#0D9488]" />Trésorerie</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" />CA</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500" />Charges</span>
          </div>

          <div className="h-72 flex items-end justify-between gap-2">
            {chartData.map((item: ChartDatum, idx: number) => {
              const max = chartMax || 1;
              const revenueHeight = (item.revenue / max) * 140;
              const expenseHeight = (item.expenses / max) * 140;
              const balanceHeight = (Math.abs(item.balance) / max) * 140;
              const balanceClass = item.balance >= 0 ? "bg-[#0D9488]" : "bg-rose-500";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${revenueHeight}px` }} title={`CA: ${formatCurrency(item.revenue)}`} />
                    <div className="w-full bg-orange-500 rounded" style={{ height: `${expenseHeight}px` }} title={`Charges: ${formatCurrency(item.expenses)}`} />
                    <div className={`w-full rounded-b ${balanceClass}`} style={{ height: `${balanceHeight}px` }} title={`Trésorerie: ${formatCurrency(item.balance)}`} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Alertes</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded ${alerts.some((a: DashboardAlert) => a.level === "danger") ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50"}`}>
                {alerts.filter((a: DashboardAlert) => a.level === "danger").length} urgent
              </span>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert: DashboardAlert, idx: number) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.level === "danger" ? "bg-red-50 border-red-100" : alert.level === "warning" ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.level === "danger" ? <AlertCircle className="w-4 h-4 text-red-600" strokeWidth={1.5} /> : alert.level === "warning" ? <CalendarClock className="w-4 h-4 text-orange-600" strokeWidth={1.5} /> : <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{alert.message}</div>
                  </div>
                </div>
              ))}
              {!alerts.length && <div className="text-sm text-gray-500">Aucune alerte en cours</div>}
            </div>
            <button className="w-full mt-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Voir toutes les alertes →</button>
          </div>

          <div className="bg-gradient-to-br from-[#0F3D3A] to-[#0D9488] rounded-xl p-6 text-white">
            <h3 className="text-base font-semibold mb-4">Statistiques rapides</h3>
            <div className="space-y-3">
              {quickStats.map((stat: QuickStat, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{stat.label}</span>
                  <span className="text-lg font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>}

      {isVisible("modules") && <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module: QuickModule, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">{module.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <p className="text-xs text-gray-500">{module.subtitle}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {module.stats.map((stat, statIdx: number) => (
                <div key={statIdx} className="flex items-center justify-between">
                  <span>{stat.label}</span>
                  <span className="font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              {module.badges.map((badge, badgeIdx: number) => (
                <span key={badgeIdx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{badge}</span>
              ))}
            </div>
          </div>
        ))}
      </section>}

      {(isVisible("transactions") || isVisible("tasks")) && <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isVisible("transactions") && <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Transactions récentes</h2>
            <button className="text-sm font-medium text-[#0D9488] hover:text-[#0B7C74] flex items-center gap-1">
              Voir tout
              <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
          <div className="space-y-3">
            {recentEntries.slice(0, 5).map((entry: DashboardEntry, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.amount >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                  {entry.amount >= 0 ? <ArrowDownLeft className="text-green-600 w-[18px] h-[18px]" /> : <ArrowUpRight className="text-red-600 w-[18px] h-[18px]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{entry.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{entry.type}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${entry.amount >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(entry.amount)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatDate(entry.date)}</div>
                </div>
              </div>
            ))}
            {!recentEntries.length && <div className="text-sm text-gray-500">Aucune transaction récente</div>}
          </div>
        </div>}

        {isVisible("tasks") && <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Tâches en attente</h2>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">{tasks.length} actions</span>
          </div>
          <div className="space-y-3">
            {tasks.map((task: TaskItem, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.level === "danger" ? "bg-red-50" : task.level === "warning" ? "bg-orange-50" : "bg-blue-50"}`}>
                  {task.level === "danger" ? <AlertCircle className="text-red-600 w-[18px] h-[18px]" /> : task.level === "warning" ? <AlertTriangle className="text-orange-500 w-[18px] h-[18px]" /> : <CheckCircle2 className="text-blue-500 w-[18px] h-[18px]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{task.message}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {task.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded ${task.level === "danger" ? "bg-red-50 text-red-600" : task.level === "warning" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>{task.badge}</span>
                    )}
                    {task.deadline && <span className="text-xs text-gray-400">{task.deadline}</span>}
                  </div>
                </div>
              </div>
            ))}
            {!tasks.length && <div className="text-sm text-gray-500">Aucune tâche prioritaire</div>}
          </div>
        </div>}
      </section>}

      {isVisible("features") && <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Solution ERP complète et intégrée</h2>
          <p className="text-gray-300">Tous les modules pour gérer votre comptabilité, trésorerie, facturation et fiscalité</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="space-y-2">
            {["Conformité RGPD", "ISO 27001", "SOC 2 Type II"].map((label, idx: number) => (
              <div key={`compliance-${idx}`} className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-blue-400">
            {["API Banking", "OCR + IA", "Lettrage auto"].map((label, idx: number) => (
              <div key={`tech-${idx}`} className="flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-purple-400">
            {["Multi-devises", "Multi-entités", "Multi-normes"].map((label, idx: number) => (
              <div key={`global-${idx}`} className="flex items-center gap-2">
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-orange-400">
            {["Apps mobiles", "Mode offline", "Scan factures"].map((label, idx: number) => (
              <div key={`mobile-${idx}`} className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>}
    </div>
  );
}
