"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Eye, 
  Target,
  ArrowRight,
  DollarSign,
  Layers,
  Users,
  MapPin,
  Clock,
  Activity,
  CheckCircle
} from "lucide-react";

export default function RevenueDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const revenueSections = [
    {
      id: "recognition",
      title: "Reconnaissance du CA",
      description: "Suivi et validation des revenus selon IFRS 15",
      icon: Eye,
      color: "emerald",
      stats: { total: "45.2M", trend: "+12%", contracts: 24 },
      href: "/accountant/revenue-recognition"
    },
    {
      id: "analysis",
      title: "Analyse Multidimensionnelle",
      description: "Analyse détaillée par segment, région, produit",
      icon: BarChart3,
      color: "blue",
      stats: { total: "156.8M", dimensions: 5, insights: 12 },
      href: "/accountant/multi-dimensional-analysis"
    },
    {
      id: "forecast",
      title: "Prévisions Financières",
      description: "Prévisions IA avec indicateurs de confiance",
      icon: Target,
      color: "purple",
      stats: { accuracy: "87%", periods: 4, confidence: "Élevée" },
      href: "/accountant/revenue-forecast"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const kpiData = [
    {
      title: "CA Total Annuel",
      value: "156.8M",
      trend: "+15.2%",
      icon: DollarSign,
      color: "emerald",
      description: "vs année précédente"
    },
    {
      title: "CA Reconnu",
      value: "142.3M",
      trend: "+12.8%",
      icon: Eye,
      color: "blue",
      description: "Revenus validés"
    },
    {
      title: "CA Différé",
      value: "14.5M",
      trend: "+8.3%",
      icon: Clock,
      color: "amber",
      description: "À reconnaître"
    },
    {
      title: "Taux de Reconnaissance",
      value: "90.7%",
      trend: "+2.1%",
      icon: Target,
      color: "purple",
      description: "Moyenne annuelle"
    }
  ];

  // Actions rapides
  const quickActions = [
    {
      title: "Tableau de Bord",
      description: "Vue d'ensemble complète du CA",
      link: "/accountant/revenue/dashboard",
      icon: Activity,
      color: "blue"
    },
    {
      title: "Reconnaissance du CA",
      description: "Gérer la reconnaissance des revenus",
      link: "/accountant/revenue-recognition-new",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Analyse Multidimensionnelle",
      description: "Analyser les revenus par dimensions",
      link: "/accountant/multi-dimensional-analysis-new",
      icon: BarChart3,
      color: "purple"
    },
    {
      title: "Prévisions Financières",
      description: "Consulter les prévisions IA",
      link: "/accountant/revenue-forecast-new",
      icon: Target,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chiffre d'Affaires</h1>
          <p className="text-slate-600">Gestion et analyse complète du chiffre d'affaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Période: 2025
          </Button>
          <Button>
            <TrendingUp className="w-4 h-4 mr-2" />
            Générer Rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorClasses = {
            emerald: "text-emerald-600 bg-emerald-50",
            blue: "text-blue-600 bg-blue-50",
            amber: "text-amber-600 bg-amber-50",
            purple: "text-purple-600 bg-purple-50"
          }[kpi.color];

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                  <span className="text-sm text-emerald-600 font-medium">{kpi.trend}</span>
                  <span className="text-xs text-slate-500 ml-2">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {revenueSections.map((section) => {
          const Icon = section.icon;
          const colorClasses = {
            emerald: "border-emerald-200 hover:border-emerald-300 bg-emerald-50",
            blue: "border-blue-200 hover:border-blue-300 bg-blue-50",
            purple: "border-purple-200 hover:border-purple-300 bg-purple-50"
          }[section.color];

          return (
            <Card 
              key={section.id} 
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${colorClasses}`}
              onClick={() => router.push(section.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                    <Icon className={`w-6 h-6 text-${section.color}-600`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
                <CardTitle className="text-lg mt-4">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-4">{section.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">
                    {section.stats.total || section.stats.accuracy}
                  </div>
                  <Badge variant="secondary" className="bg-white">
                    {section.color === 'emerald' && `${section.stats.contracts} contrats`}
                    {section.color === 'blue' && `${section.stats.dimensions} dimensions`}
                    {section.color === 'purple' && section.stats.confidence}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Répartition par Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Services</span>
                <span className="font-medium">68.5M (43.7%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Produits</span>
                <span className="font-medium">52.3M (33.4%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Licences</span>
                <span className="font-medium">36.0M (22.9%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Performance par Région
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Abidjan</span>
                <span className="font-medium text-emerald-600">+18.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Bouaké</span>
                <span className="font-medium text-emerald-600">+12.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">San Pedro</span>
                <span className="font-medium text-rose-600">-2.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Top Clients par CA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">SOCIETE A</span>
                <span className="font-medium">24.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">ENTREPRISE B</span>
                <span className="font-medium">18.5M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">GROUP C</span>
                <span className="font-medium">15.2M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}