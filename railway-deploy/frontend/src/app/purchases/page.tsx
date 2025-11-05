"use client";
import { ShoppingCart, Users, Package, FileText } from "lucide-react";
import Link from "next/link";

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Achats</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/purchases/suppliers" className="card p-6 hover:shadow-lg transition-shadow">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold mb-2">Fournisseurs</h3>
          <p className="text-sm text-slate-600">Gestion des fournisseurs et contrats</p>
        </Link>
        <Link href="/purchases/orders" className="card p-6 hover:shadow-lg transition-shadow">
          <ShoppingCart className="w-8 h-8 text-emerald-600 mb-2" />
          <h3 className="font-semibold mb-2">Commandes</h3>
          <p className="text-sm text-slate-600">Bons de commande fournisseurs</p>
        </Link>
        <Link href="/purchases/receipts" className="card p-6 hover:shadow-lg transition-shadow">
          <Package className="w-8 h-8 text-amber-600 mb-2" />
          <h3 className="font-semibold mb-2">Réceptions</h3>
          <p className="text-sm text-slate-600">Réception et contrôle marchandises</p>
        </Link>
        <Link href="/purchases/rfq" className="card p-6 hover:shadow-lg transition-shadow">
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold mb-2">Appels d'Offres</h3>
          <p className="text-sm text-slate-600">Demandes de devis fournisseurs</p>
        </Link>
      </div>
    </div>
  );
}
