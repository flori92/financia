"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplierName: "",
    totalAmount: "",
    expectedDeliveryDate: "",
    companyId: "1805bc61-7cfd-44e9-8a63-17187bf05dc7" // ID par défaut pour le demo
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiGet("/api/v1/purchases/orders");
      setOrders(data || []);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.supplierName || !newOrder.totalAmount) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setCreatingOrder(true);
    try {
      const orderData = {
        ...newOrder,
        totalAmount: parseFloat(newOrder.totalAmount),
        orderDate: new Date().toISOString().split('T')[0],
        supplierId: "temp-supplier-id"
      };

      const createdOrder = await apiPost("/api/v1/purchases/orders", orderData);
      setOrders([createdOrder, ...orders]);
      setIsCreateModalOpen(false);
      setNewOrder({
        supplierName: "",
        totalAmount: "",
        expectedDeliveryDate: "",
        companyId: "1805bc61-7cfd-44e9-8a63-17187bf05dc7"
      });
    } catch (error) {
      console.error("Erreur création commande:", error);
      alert("Erreur lors de la création de la commande");
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Commandes Fournisseurs</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nouvelle commande</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvelle commande fournisseur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Nom du fournisseur *</Label>
                <Input
                  id="supplierName"
                  value={newOrder.supplierName}
                  onChange={(e) => setNewOrder({...newOrder, supplierName: e.target.value})}
                  placeholder="Nom du fournisseur"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Montant total (FCFA) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={newOrder.totalAmount}
                  onChange={(e) => setNewOrder({...newOrder, totalAmount: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Date de livraison prévue</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={newOrder.expectedDeliveryDate}
                  onChange={(e) => setNewOrder({...newOrder, expectedDeliveryDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={creatingOrder}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={creatingOrder}>
                  {creatingOrder ? "Création..." : "Créer la commande"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bons de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucune commande trouvée. Cliquez sur "Nouvelle commande" pour en créer une.
              </div>
            ) : (
              orders.map((o: any) => (
                <div key={o.id} className="flex justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{o.orderNumber}</div>
                    <div className="text-sm text-slate-600">{o.supplierName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{Number(o.totalAmount || o.amount || 0).toLocaleString()} FCFA</div>
                    <div className="text-xs text-amber-600">{o.status || 'draft'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
