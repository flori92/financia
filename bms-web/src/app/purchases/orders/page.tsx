"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/purchases/orders")
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Commandes Fournisseurs</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Nouvelle commande</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bons de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.map((o: any) => (
              <div key={o.id} className="flex justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{o.orderNumber}</div>
                  <div className="text-sm text-slate-600">Fournisseur #{o.supplierId}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{o.amount.toLocaleString()} FCFA</div>
                  <div className="text-xs text-amber-600">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
