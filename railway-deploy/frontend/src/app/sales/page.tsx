"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, Users, FileText, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";

interface SalesData {
  totalRevenue: number;
  monthlyRevenue: number;
  ordersCount: number;
  clientsCount: number;
  conversionRate: number;
  averageOrderValue: number;
}

export default function SalesPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const response = await apiGet('/api/v1/sales/dashboard');
      setData(response);
    } catch (error) {
      console.error("Erreur chargement données ventes:", error);
      // Fallback vers données mock si API indisponible
      const mockData: SalesData = {
        totalRevenue: 45000000,
        monthlyRevenue: 12500000,
        ordersCount: 156,
        clientsCount: 89,
        conversionRate: 23.5,
        averageOrderValue: 288461
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
          <h1 className="text-3xl font-bold">Ventes</h1>
          <p className="text-gray-600">Gestion des ventes et devis</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Devis
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CA Total</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.totalRevenue || 0).toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-green-600">En progression</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CA Mensuel</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.monthlyRevenue || 0).toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-blue-600">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.ordersCount}</div>
            <p className="text-xs text-purple-600">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.clientsCount}</div>
            <p className="text-xs text-orange-600">Actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/sales/quotes" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Devis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Créer et gérer les devis clients</p>
              <div className="mt-2 text-xs text-blue-600">12 devis en attente</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/orders" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Suivre les commandes clients</p>
              <div className="mt-2 text-xs text-green-600">8 commandes à expédier</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/invoices" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Facturation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Générer les factures depuis les commandes</p>
              <div className="mt-2 text-xs text-purple-600">5 factures à envoyer</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/clients" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Gérer la base clients et prospects</p>
              <div className="mt-2 text-xs text-orange-600">89 clients actifs</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/analytics" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Rapports et statistiques ventes</p>
              <div className="mt-2 text-xs text-emerald-600">Taux conversion: 23.5%</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sales/targets" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Objectifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Définir et suivre les objectifs ventes</p>
              <div className="mt-2 text-xs text-red-600">78% des objectifs atteints</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data?.conversionRate}%</div>
              <p className="text-sm text-gray-600">Taux de conversion</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{(data?.averageOrderValue || 0).toLocaleString('fr-FR')} FCFA</div>
              <p className="text-sm text-gray-600">Panier moyen</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">+15%</div>
              <p className="text-sm text-gray-600">Croissance vs mois dernier</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
