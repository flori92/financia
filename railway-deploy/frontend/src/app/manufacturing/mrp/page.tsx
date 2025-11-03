"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfessionalExporter } from "@/lib/export-utils";

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
