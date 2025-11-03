"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BOMPage() {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/manufacturing/bom")
      .then(setBoms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nomenclatures (BOM)</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Nouvelle nomenclature</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des nomenclatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {boms.map((b: any) => (
              <div key={b.id} className="p-3 border rounded">
                <div className="font-medium mb-2">{b.productName}</div>
                <div className="text-sm text-slate-600">
                  {b.components.map((c: any, i: number) => (
                    <div key={i}>• {c.name} x{c.quantity}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
