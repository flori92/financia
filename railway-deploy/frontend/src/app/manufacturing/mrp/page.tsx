"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MRPPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planification MRP</h1>
        <Button onClick={() => {
          // Simulation de calcul MRP
          const mockData = {
            calculationDate: new Date().toLocaleString('fr-FR'),
            materialsNeeded: Math.floor(Math.random() * 50) + 10,
            productionOrders: Math.floor(Math.random() * 20) + 5,
            totalCost: Math.floor(Math.random() * 1000000) + 500000,
            deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
          };

          const content = `Rapport de Calcul des Besoins MRP
=====================================

Date de calcul: ${mockData.calculationDate}
Matériaux nécessaires: ${mockData.materialsNeeded}
Ordres de production: ${mockData.productionOrders}
Coût total estimé: ${mockData.totalCost.toLocaleString('fr-FR')} FCFA
Date livraison prévue: ${mockData.deliveryDate}

Calcul MRP effectué avec succès !
Besoins optimisés et plan générés

Matériaux critiques:
- Acier laminé: 500 tonnes
- Composants électroniques: 2,000 unités
- Peinture industrielle: 1,500 litres
- Emballages: 10,000 unités

Plan de production:
- Ligne 1: 1,000 unités/jour
- Ligne 2: 750 unités/jour  
- Ligne 3: 500 unités/jour

Généré le: ${new Date().toLocaleString('fr-FR')}`;

          // Télécharger le rapport
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mrp-besoin-${new Date().toISOString().split('T')[0]}.txt`;
          a.click();
          URL.revokeObjectURL(url);

          alert(`Calcul MRP effectué !\n${mockData.materialsNeeded} matériaux nécessaires\n${mockData.productionOrders} ordres de production\nCoût: ${mockData.totalCost.toLocaleString('fr-FR')} FCFA`);
        }}>Calculer les besoins</Button>
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
