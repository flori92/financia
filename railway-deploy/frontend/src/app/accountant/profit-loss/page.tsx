"use client";

export default function ProfitLossPage() {
  const revenue = [
    { name: "Ventes de marchandises", amount: 150000 },
    { name: "Prestations de services", amount: 80000 }
  ];

  const expenses = [
    { name: "Achats", amount: 80000 },
    { name: "Charges de personnel", amount: 45000 },
    { name: "Charges externes", amount: 25000 }
  ];

  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netResult = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Compte de résultat</h1>
      
      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-green-600">PRODUITS</h2>
            {revenue.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <span className="font-medium text-green-600">{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA</span>
              </div>
            ))}
            <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
              <span>TOTAL PRODUITS</span>
              <span className="text-green-600">{new Intl.NumberFormat('fr-FR').format(totalRevenue)} FCFA</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-red-600">CHARGES</h2>
            {expenses.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <span className="font-medium text-red-600">{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA</span>
              </div>
            ))}
            <div className="flex justify-between py-3 font-semibold border-t-2 mt-2">
              <span>TOTAL CHARGES</span>
              <span className="text-red-600">{new Intl.NumberFormat('fr-FR').format(totalExpenses)} FCFA</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-2">
          <div className={`flex justify-between text-xl font-bold ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span>RÉSULTAT NET</span>
            <span>{netResult >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(netResult)} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}