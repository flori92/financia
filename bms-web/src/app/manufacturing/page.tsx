"use client";
import { Factory, Package, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ManufacturingPage() {
  const stats = {
    ordersInProgress: 12,
    ordersCompleted: 45,
    efficiency: 87,
    alerts: 3
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Production & Manufacturing</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-blue-50">
          <Factory className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-2xl font-bold">{stats.ordersInProgress}</div>
          <div className="text-sm text-slate-600">OF en cours</div>
        </div>
        <div className="card p-4 bg-emerald-50">
          <Package className="w-8 h-8 text-emerald-600 mb-2" />
          <div className="text-2xl font-bold">{stats.ordersCompleted}</div>
          <div className="text-sm text-slate-600">OF terminés</div>
        </div>
        <div className="card p-4 bg-amber-50">
          <TrendingUp className="w-8 h-8 text-amber-600 mb-2" />
          <div className="text-2xl font-bold">{stats.efficiency}%</div>
          <div className="text-sm text-slate-600">Efficacité</div>
        </div>
        <div className="card p-4 bg-rose-50">
          <AlertCircle className="w-8 h-8 text-rose-600 mb-2" />
          <div className="text-2xl font-bold">{stats.alerts}</div>
          <div className="text-sm text-slate-600">Alertes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/manufacturing/production-orders" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Ordres de Fabrication</h3>
          <p className="text-sm text-slate-600">Gérer les OF et suivre la production</p>
        </Link>
        <Link href="/manufacturing/bom" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Nomenclatures (BOM)</h3>
          <p className="text-sm text-slate-600">Définir les composants produits</p>
        </Link>
        <Link href="/manufacturing/mrp" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">Planification MRP</h3>
          <p className="text-sm text-slate-600">Calcul des besoins matières</p>
        </Link>
      </div>
    </div>
  );
}
