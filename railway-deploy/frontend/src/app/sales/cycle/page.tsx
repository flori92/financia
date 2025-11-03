"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  FileText, 
  Package, 
  Truck, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SalesMetrics {
  quotes: {
    total: number;
    sent: number;
    accepted: number;
    totalAmount: number;
  };
  orders: {
    total: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    totalAmount: number;
  };
  recentActivity: {
    quotes: any[];
    orders: any[];
  };
}

const mockMetrics: SalesMetrics = {
  quotes: {
    total: 12,
    sent: 8,
    accepted: 4,
    totalAmount: 8500000
  },
  orders: {
    total: 15,
    confirmed: 5,
    processing: 3,
    shipped: 4,
    delivered: 3,
    totalAmount: 12500000
  },
  recentActivity: {
    quotes: [],
    orders: []
  }
};

export default function SalesCyclePage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<SalesMetrics>(mockMetrics);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const handleViewAllQuotes = () => {
    router.push('/sales/quotes');
  };

  const handleViewAllOrders = () => {
    router.push('/sales/orders');
  };

  useEffect(() => {
    loadSalesCycleMetrics();
  }, [selectedPeriod]);

  const loadSalesCycleMetrics = async () => {
    setLoading(true);
    try {
      // Utiliser la vraie API avec le companyId
      const companyId = localStorage.getItem('companyId') || 'demo-company';
      const response = await fetch(`/api/sales/cycle/metrics?companyId=${companyId}&period=${selectedPeriod}`);
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data || mockMetrics);
      } else {
        // Fallback vers données mock si API non disponible
        console.warn('API non disponible, utilisation des données mock');
        await new Promise(resolve => setTimeout(resolve, 400));
        setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des métriques:", error);
      // Fallback vers données mock
      await new Promise(resolve => setTimeout(resolve, 400));
      setMetrics(mockMetrics);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (stage: string, value: number) => {
    switch (stage) {
      case 'Devis':
        return value > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200';
      case 'Commandes':
        return value > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200';
      case 'Livraisons':
        return value > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-500 border-gray-200';
      case 'Factures':
        return value > 0 ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Devis': return <FileText className="w-6 h-6" />;
      case 'Commandes': return <ShoppingCart className="w-6 h-6" />;
      case 'Livraisons': return <Truck className="w-6 h-6" />;
      case 'Factures': return <Receipt className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getStageValue = (stage: string) => {
    switch (stage) {
      case 'Devis': return metrics.quotes.sent;
      case 'Commandes': return metrics.orders.confirmed;
      case 'Livraisons': return metrics.orders.shipped;
      case 'Factures': return metrics.orders.delivered;
      default: return 0;
    }
  };

  const getStageAmount = (stage: string) => {
    switch (stage) {
      case 'Devis': return metrics.quotes.totalAmount;
      case 'Commandes': return metrics.orders.totalAmount;
      case 'Livraisons': return metrics.orders.totalAmount * 0.8; // Estimation
      case 'Factures': return metrics.orders.totalAmount * 0.9; // Estimation
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
      case 'processing':
      case 'shipped':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Rejeté';
      case 'expired': return 'Expiré';
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédié';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShoppingCart className="w-8 h-8 mx-auto text-blue-600 mb-2 animate-spin" />
          <p>Chargement du cycle de vente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cycle de vente</h1>
          <p className="text-gray-600 mt-1">Devis → Commandes → Livraisons → Factures</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button onClick={loadSalesCycleMetrics}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPIs du Cycle de Vente */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["Devis", "Commandes", "Livraisons", "Factures"].map((stage, idx) => {
          const value = getStageValue(stage);
          const amount = getStageAmount(stage);
          const colorClass = getStageColor(stage, value);
          
          return (
            <Card key={idx} className={`border-2 ${colorClass}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                  {getStageIcon(stage)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(amount)}
                  </div>
                  {value > 0 && (
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Actif
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistiques Complémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.quotes.sent > 0 ? 
                ((metrics.quotes.accepted / metrics.quotes.sent) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">
              {metrics.quotes.accepted} / {metrics.quotes.sent} devis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.quotes.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">
              {metrics.quotes.total} devis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics.orders.totalAmount)}
            </div>
            <div className="text-sm text-gray-600">
              {metrics.orders.total} commandes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité Récente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Devis Récents */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Devis récents</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllQuotes}>
                <Eye className="w-4 h-4 mr-1" />
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.quotes?.slice(0, 5).map((quote: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{quote.quoteNumber}</div>
                    <div className="text-sm text-gray-600">{quote.clientName}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(quote.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(quote.totalAmount)}</div>
                    <Badge className={getStatusColor(quote.status)}>
                      {getStatusIcon(quote.status)}
                      <span className="ml-1">{getStatusLabel(quote.status)}</span>
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  Aucun devis récent
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commandes Récentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Commandes récentes</CardTitle>
              <Button variant="outline" size="sm" onClick={handleViewAllOrders}>
                <Eye className="w-4 h-4 mr-1" />
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.orders?.slice(0, 5).map((order: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">{order.clientName}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  Aucune commande récente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center">
              <Plus className="w-6 h-6 mb-2" />
              Nouveau devis
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Plus className="w-6 h-6 mb-2" />
              Nouvelle commande
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Download className="w-6 h-6 mb-2" />
              Exporter devis
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Download className="w-6 h-6 mb-2" />
              Exporter commandes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
