"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MRPPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planification MRP</h1>
        <Button>Calculer les besoins</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Calcul des besoins matières</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Lancez un calcul pour voir les besoins en matières</p>
        </CardContent>
      </Card>
    </div>
  );
}
