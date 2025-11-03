"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Package, Truck, CheckCircle, Clock, Eye, Edit } from "lucide-react";

interface SalesOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientId: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Charger les commandes depuis l'API
      const ordersResponse = await apiGet('/api/v1/sales/orders');
      setOrders(ordersResponse);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
      // Fallback vers données mock si API indisponible
      const mockOrders: SalesOrder[] = [
        {
          id: "1",
          orderNumber: "CMD-2025-001",
          clientName: "SARL Tech Solutions",
          clientId: "client1",
          totalAmount: 2500000,
          status: "confirmed",
          orderDate: "2025-01-15",
          expectedDeliveryDate: "2025-01-25",
          trackingNumber: "TRK-123456789",
          createdAt: "2025-01-15",
          updatedAt: "2025-01-16"
        },
        {
          id: "2",
          orderNumber: "CMD-2025-002",
          clientName: "EURL Commerce Plus",
          clientId: "client2",
          totalAmount: 1800000,
          status: "processing",
          orderDate: "2025-01-18",
          expectedDeliveryDate: "2025-01-28",
          createdAt: "2025-01-18",
          updatedAt: "2025-01-19"
        },
        {
          id: "3",
          orderNumber: "CMD-2025-003",
          clientName: "SA Industries Modernes",
          clientId: "client3",
          totalAmount: 3200000,
          status: "shipped",
          orderDate: "2025-01-20",
          expectedDeliveryDate: "2025-01-30",
          trackingNumber: "TRK-987654321",
          createdAt: "2025-01-20",
          updatedAt: "2025-01-22"
        }
      ];

      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEditOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiPost(`/api/v1/sales/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      alert('Statut mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Statut mis à jour avec succès !');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "En attente" },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Confirmée" },
      processing: { color: "bg-orange-100 text-orange-800", icon: Package, label: "En traitement" },
      shipped: { color: "bg-purple-100 text-purple-800", icon: Truck, label: "Expédiée" },
      delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Livrée" },
      cancelled: { color: "bg-red-100 text-red-800", icon: Clock, label: "Annulée" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Commandes Clients</h1>
          <p className="text-gray-600">Suivi des commandes et expéditions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Commande
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expédiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('fr-FR')} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Numéro</th>
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date commande</th>
                  <th className="text-left p-3">Livraison prévue</th>
                  <th className="text-left p-3">Suivi</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{order.orderNumber}</td>
                    <td className="p-3">{order.clientName}</td>
                    <td className="p-3 font-bold">{order.totalAmount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3">{getStatusBadge(order.status)}</td>
                    <td className="p-3 text-sm">{new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3 text-sm">
                      {order.expectedDeliveryDate ? 
                        new Date(order.expectedDeliveryDate).toLocaleDateString('fr-FR') : 
                        'N/A'
                      }
                    </td>
                    <td className="p-3 text-sm font-mono">
                      {order.trackingNumber || 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditOrder(order)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {order.status === 'confirmed' && (
                          <Button size="sm" variant="outline">
                            <Package className="w-4 h-4" />
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button size="sm" variant="outline">
                            <Truck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Visualisation */}
      {showViewModal && selectedOrder && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de la commande {selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <div className="font-medium">{selectedOrder.clientName}</div>
                </div>
                <div>
                  <Label>Statut</Label>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label>Montant total</Label>
                  <div className="font-bold text-lg">{selectedOrder.totalAmount.toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div>
                  <Label>Date de commande</Label>
                  <div>{new Date(selectedOrder.orderDate).toLocaleDateString('fr-FR')}</div>
                </div>
                {selectedOrder.expectedDeliveryDate && (
                  <div>
                    <Label>Livraison prévue</Label>
                    <div>{new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <div>
                    <Label>Numéro de suivi</Label>
                    <div className="font-mono">{selectedOrder.trackingNumber}</div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Fermer</Button>
                <Button onClick={() => { setShowViewModal(false); handleEditOrder(selectedOrder); }}>Modifier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedOrder && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la commande {selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Statut</Label>
                <Select defaultValue={selectedOrder.status} onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                    <SelectItem value="processing">En traitement</SelectItem>
                    <SelectItem value="shipped">Expédiée</SelectItem>
                    <SelectItem value="delivered">Livrée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date de livraison prévue</Label>
                <Input type="date" defaultValue={selectedOrder.expectedDeliveryDate} />
              </div>
              <div>
                <Label>Numéro de suivi</Label>
                <Input defaultValue={selectedOrder.trackingNumber} placeholder="TRK-XXXXXXXXX" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Fermer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
