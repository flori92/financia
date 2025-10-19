"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RFQPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appels d'Offres</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Nouvel appel d'offres</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Demandes de devis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Aucun appel d'offres en cours</p>
        </CardContent>
      </Card>
    </div>
  );
}
