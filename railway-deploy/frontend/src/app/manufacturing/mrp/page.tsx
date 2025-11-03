"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfessionalExporter } from "@/lib/export-utils";

interface MRPResult {
  calculationDate: string;
  materialsNeeded: number;
  productionOrders: number;
  totalCost: number;
  deliveryDate: string;
}

export default function MRPPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MRPResult | null>(null);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    console.log(`Toast ${type}: ${message}`); // Debug log
    if (type === "error") {
      alert(`❌ Erreur: ${message}`);
    } else if (type === "success") {
      alert(`✅ Succès: ${message}`);
    } else {
      alert(`ℹ️ Info: ${message}`);
    }
  };

  const handleCalculateMRP = async () => {
    console.log('handleCalculateMRP called'); // Debug log
    setLoading(true);
    
    try {
      // Simulation d'un calcul MRP avec délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: MRPResult = {
        calculationDate: new Date().toLocaleString('fr-FR'),
        materialsNeeded: Math.floor(Math.random() * 50) + 10,
        productionOrders: Math.floor(Math.random() * 20) + 5,
        totalCost: Math.floor(Math.random() * 1000000) + 500000,
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      };

      setResult(mockData);
      
      // Export professionnel Excel formaté
      ProfessionalExporter.exportExcel({
        title: 'Rapport de Calcul des Besoins MRP',
        headers: ['Matériau', 'Quantité requise', 'Unité', 'Coût unitaire', 'Coût total', 'Date livraison'],
        rows: [
          ['Acier laminé', '500', 'tonnes', '250,000', '125,000,000', mockData.deliveryDate],
          ['Composants électroniques', '2,000', 'unités', '25,000', '50,000,000', mockData.deliveryDate],
          ['Peinture industrielle', '1,500', 'litres', '5,000', '7,500,000', mockData.deliveryDate],
          ['Emballages', '10,000', 'unités', '500', '5,000,000', mockData.deliveryDate],
          ['', '', '', 'Total', mockData.totalCost.toLocaleString('fr-FR'), ''],
          ['', 'Résumé opérationnel', '', '', '', ''],
          ['Total matériaux', mockData.materialsNeeded, 'références', '', '', ''],
          ['Ordres production', mockData.productionOrders, 'ordres', '', '', ''],
          ['Date calcul', mockData.calculationDate, '', '', '', '']
        ],
        metadata: {
          date: mockData.calculationDate,
          company: 'BMS Business Management System',
          period: `Livraison prévue: ${mockData.deliveryDate}`,
          author: 'Service Production'
        }
      }, 'mrp-besoins');

      triggerToast("success", `Calcul MRP effectué ! ${mockData.materialsNeeded} matériaux nécessaires, ${mockData.productionOrders} ordres de production, Coût: ${mockData.totalCost.toLocaleString('fr-FR')} FCFA`);
    } catch (error) {
      console.error("Erreur calcul MRP:", error);
      triggerToast("error", "Erreur lors du calcul MRP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planification MRP</h1>
        <Button 
          onClick={handleCalculateMRP}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Calcul en cours..." : "Calculer les besoins"}
        </Button>
      </div>

      {/* Résultats du calcul */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Matériaux nécessaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{result.materialsNeeded}</div>
              <p className="text-xs text-blue-600">Références</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ordres de production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{result.productionOrders}</div>
              <p className="text-xs text-green-600">Ordres générés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Coût total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{result.totalCost.toLocaleString('fr-FR')} FCFA</div>
              <p className="text-xs text-purple-600">Estimé</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Date livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{result.deliveryDate}</div>
              <p className="text-xs text-orange-600">Prévue</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Calcul des besoins matières</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            {loading 
              ? "Calcul des besoins MRP en cours, veuillez patienter..." 
              : result 
                ? `Dernier calcul: ${result.calculationDate}` 
                : "Lancez un calcul pour voir les besoins en matières"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
