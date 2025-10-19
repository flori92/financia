"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notes de Frais</h1>
        <Button><Plus className="w-4 h-4 mr-2" />Nouvelle note</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Notes de frais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Aucune note de frais</p>
        </CardContent>
      </Card>
    </div>
  );
}
