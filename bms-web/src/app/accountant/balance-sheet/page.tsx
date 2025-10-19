"use client";

export default function BalanceSheetPage() {
  const assets = [
    { name: "Immobilisations", amount: 500000 },
    { name: "Stocks", amount: 150000 },
    { name: "Créances clients", amount: 85000 },
    { name: "Trésorerie", amount: 110000 }
  ];

  const liabilities = [
    { name: "Capital", amount: 100000 },
    { name: "Résultat", amount: 70000 },
    { name: "Dettes fournisseurs", amount: 25000 },
    { name: "Emprunts", amount: 650000 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Bilan comptable</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">ACTIF</h2>
          {assets.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b">
              <span>{item.name}</span>
              <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA</span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
            <span>TOTAL ACTIF</span>
            <span>{new Intl.NumberFormat('fr-FR').format(assets.reduce((sum, item) => sum + item.amount, 0))} FCFA</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">PASSIF</h2>
          {liabilities.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b">
              <span>{item.name}</span>
              <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA</span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
            <span>TOTAL PASSIF</span>
            <span>{new Intl.NumberFormat('fr-FR').format(liabilities.reduce((sum, item) => sum + item.amount, 0))} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}