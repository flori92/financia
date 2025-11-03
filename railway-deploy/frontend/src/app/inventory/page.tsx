"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Package, AlertTriangle, Plus } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const result = await apiGet('/api/v1/inventory/items');
      setProducts(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  const alertProducts = products.filter(p => p.quantity < 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau produit
        </button>
      </div>

      {alertProducts.length > 0 && (
        <div className="card p-4 bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{alertProducts.length} produit(s) en rupture de stock</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-slate-600">Total produits</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600">Valeur stock</div>
          <div className="text-2xl font-bold">{(products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0) / 1000000).toFixed(1)}M</div>
        </div>
        <div className="card p-4 bg-amber-50">
          <div className="text-sm text-amber-700">Alertes</div>
          <div className="text-2xl font-bold text-amber-900">{alertProducts.length}</div>
        </div>
      </div>

      <div className="card p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-app-border">
              <th className="pb-3">SKU</th>
              <th className="pb-3">Produit</th>
              <th className="pb-3">Entrepôt</th>
              <th className="pb-3 text-right">Stock</th>
              <th className="pb-3 text-right">Prix</th>
              <th className="pb-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-app-border hover:bg-slate-50">
                <td className="py-3 font-mono text-sm">{product.sku}</td>
                <td className="py-3 font-medium">{product.name}</td>
                <td className="py-3 text-sm text-slate-600">{product.warehouse}</td>
                <td className="py-3 text-right font-semibold">{product.quantity}</td>
                <td className="py-3 text-right">{product.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                <td className="py-3">
                  {product.quantity < 50 ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-700">
                      Rupture
                    </span>
                  ) : product.quantity < 100 ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
                      Faible
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                      OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
