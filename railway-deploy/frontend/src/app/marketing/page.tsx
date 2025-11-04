"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, TrendingUp, DollarSign, Target, Calendar, Mail, BarChart3, Plus } from "lucide-react";
import Link from "next/link";

interface MarketingData {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  conversionRate: number;
  monthlyBudget: number;
  roi: number;
  emailSubscribers: number;
  socialMediaFollowers: number;
}

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    try {
      // Charger les données marketing depuis l'API
      const response = await apiGet('/api/v1/marketing/dashboard');
      setData(response);
    } catch (error) {
      console.error("Erreur chargement données marketing:", error);
      // Fallback vers données mock si API indisponible
      const mockData: MarketingData = {
        totalCampaigns: 24,
        activeCampaigns: 6,
        totalLeads: 1850,
        conversionRate: 12.5,
        monthlyBudget: 5000000,
        roi: 245,
        emailSubscribers: 3200,
        socialMediaFollowers: 12500
      };
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-gray-600">Gestion des campagnes et acquisition clients</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campagnes Actives</CardTitle>
            <Megaphone className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeCampaigns}</div>
            <p className="text-xs text-blue-600">sur {data?.totalCampaigns} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads Générés</CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalLeads}</div>
            <p className="text-xs text-green-600">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
            <Target className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.conversionRate}%</div>
            <p className="text-xs text-purple-600">Leads → Clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.roi}%</div>
            <p className="text-xs text-orange-600">Retour sur investissement</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/marketing/campaigns" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                Campagnes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Créer et gérer les campagnes marketing</p>
              <div className="mt-2 text-xs text-blue-600">{data?.activeCampaigns} campagnes actives</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/leads" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Gestion des prospects et pipeline</p>
              <div className="mt-2 text-xs text-green-600">{data?.totalLeads} leads générés</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/email" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-600" />
                Email Marketing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Newsletters et campagnes email</p>
              <div className="mt-2 text-xs text-orange-600">{data?.emailSubscribers} abonnés</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/social" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Réseaux Sociaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Gestion des réseaux sociaux</p>
              <div className="mt-2 text-xs text-purple-600">{data?.socialMediaFollowers} followers</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/analytics" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Rapports et statistiques marketing</p>
              <div className="mt-2 text-xs text-emerald-600">ROI: {data?.roi}%</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/marketing/budget" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Suivi budgétaire marketing</p>
              <div className="mt-2 text-xs text-red-600">{(data?.monthlyBudget || 0).toLocaleString('fr-FR')} FCFA/mois</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Acquisition Clients</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Leads qualifiés</span>
                  <span className="font-bold">450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux conversion</span>
                  <span className="font-bold text-green-600">{data?.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coût par acquisition</span>
                  <span className="font-bold">2,500 FCFA</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Engagement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email ouverts</span>
                  <span className="font-bold">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clics emails</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement social</span>
                  <span className="font-bold">4.2%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campagnes récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Campagnes en Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Lancement Produit Q1 2025</p>
                  <p className="text-sm text-gray-600">Email + Social Media</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">68%</p>
                <p className="text-xs text-gray-600">Objectif atteint</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Promotion Soldes Hiver</p>
                  <p className="text-sm text-gray-600">Multi-canal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">45%</p>
                <p className="text-xs text-gray-600">En cours</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Newsletter Mensuelle</p>
                  <p className="text-sm text-gray-600">Email marketing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">92%</p>
                <p className="text-xs text-gray-600">Excellent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
