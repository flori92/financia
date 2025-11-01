"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/purchases/suppliers")
      .then(setSuppliers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNewSupplier = () => {
    // TODO: Implémenter la création de fournisseur
    // Options: ouvrir un modal ou naviguer vers une page de création
    console.log("Nouveau fournisseur - à implémenter");
    alert("Fonctionnalité de création de fournisseur à implémenter");
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fournisseurs</h1>
        <Button onClick={handleNewSupplier}>
          <Plus className="w-4 h-4 mr-2" />Nouveau fournisseur
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suppliers.map((s: any) => (
              <div key={s.id} className="flex justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-slate-600">{s.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">{s.phone}</div>
                  <div className="text-xs text-emerald-600">{s.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
