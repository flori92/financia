"use client";
import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiPut, getCompanyId } from "@/lib/api";
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Warehouse,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  warehouse?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  minQuantity?: number;
  maxQuantity?: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const unitPriceRef = useRef<HTMLInputElement>(null);
  const warehouseRef = useRef<HTMLInputElement>(null);
  const minQuantityRef = useRef<HTMLInputElement>(null);
  const maxQuantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        return;
      }
      const result = await apiGet('/api/v1/inventory/items', { companyId });
      setProducts(Array.isArray(result) ? result : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }
      await apiPost(`/api/v1/inventory/items/${productId}/delete`, {}, { companyId });
      triggerToast("success", "Produit supprimé avec succès");
      await loadProducts();
    } catch (err: any) {
      triggerToast("error", err?.message || "Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }

      const formData = {
        name: nameRef.current?.value || "",
        sku: skuRef.current?.value || "",
        category: categoryRef.current?.value || "",
        quantity: parseFloat(quantityRef.current?.value || "0"),
        unitPrice: parseFloat(unitPriceRef.current?.value || "0"),
        warehouse: warehouseRef.current?.value || "",
        minQuantity: parseFloat(minQuantityRef.current?.value || "0"),
        maxQuantity: parseFloat(maxQuantityRef.current?.value || "0"),
      };

      if (!formData.name || !formData.sku) {
        triggerToast("error", "Nom et SKU sont requis");
        return;
      }

      if (editingProduct) {
        await apiPut(`/api/v1/inventory/items/${editingProduct.id}`, formData, { companyId });
        triggerToast("success", "Produit modifié avec succès");
      } else {
        await apiPost('/api/v1/inventory/items', formData, { companyId });
        triggerToast("success", "Produit créé avec succès");
      }

      await loadProducts();
      closeForm();
    } catch (err: any) {
      triggerToast("error", err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const alertProducts = filteredProducts.filter(p => (p.quantity || 0) < (p.minQuantity || 50));
  const totalValue = filteredProducts.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unitPrice || 0)), 0);
  const lowStockCount = filteredProducts.filter(p => p.status === 'low_stock' || (p.quantity || 0) < (p.minQuantity || 50)).length;
  const outOfStockCount = filteredProducts.filter(p => p.status === 'out_of_stock' || (p.quantity || 0) === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0D9488] mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Stocks</h1>
          <p className="text-slate-600 mt-1">Gérez vos produits et votre inventaire</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] shadow-lg hover:shadow-xl transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total produits</div>
              <Package className="w-6 h-6 text-blue-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {filteredProducts.length}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Valeur stock</div>
              <TrendingUp className="w-6 h-6 text-emerald-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {(totalValue / 1000000).toFixed(1)}M
            </div>
            <div className="mt-2 text-emerald-100 text-xs">FCFA</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-amber-100 text-sm font-medium uppercase tracking-wide">Stock faible</div>
              <AlertTriangle className="w-6 h-6 text-amber-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {lowStockCount}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-rose-100 text-sm font-medium uppercase tracking-wide">Rupture</div>
              <XCircle className="w-6 h-6 text-rose-200" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight tabular-nums">
              {outOfStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alertProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-semibold">{alertProducts.length} produit(s) en alerte de stock</span>
              <p className="text-sm text-amber-700 mt-1">Vérifiez les niveaux de stock et réapprovisionnez si nécessaire</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un produit (nom, SKU, catégorie)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingProduct ? "Modifier le produit" : "Nouveau produit"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Nom du produit *</label>
                  <input
                    ref={nameRef}
                    type="text"
                    defaultValue={editingProduct?.name || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">SKU *</label>
                  <input
                    ref={skuRef}
                    type="text"
                    defaultValue={editingProduct?.sku || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Catégorie</label>
                  <input
                    ref={categoryRef}
                    type="text"
                    defaultValue={editingProduct?.category || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Entrepôt</label>
                  <input
                    ref={warehouseRef}
                    type="text"
                    defaultValue={editingProduct?.warehouse || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Quantité *</label>
                  <input
                    ref={quantityRef}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.quantity || "0"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Prix unitaire (FCFA) *</label>
                  <input
                    ref={unitPriceRef}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.unitPrice || "0"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Stock minimum</label>
                  <input
                    ref={minQuantityRef}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.minQuantity || "0"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Stock maximum</label>
                  <input
                    ref={maxQuantityRef}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.maxQuantity || "0"}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] disabled:opacity-50 font-semibold"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Enregistrement..." : editingProduct ? "Modifier" : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                  disabled={saving}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Entrepôt</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Prix unitaire</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Valeur</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium">Aucun produit trouvé</p>
                    <p className="text-sm mt-1">Créez votre premier produit pour commencer</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const value = (product.quantity || 0) * (product.unitPrice || 0);
                  const isLowStock = (product.quantity || 0) < (product.minQuantity || 50);
                  const isOutOfStock = (product.quantity || 0) === 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-medium text-slate-900">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{product.category || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{product.warehouse || "—"}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-slate-900 tabular-nums">{product.quantity || 0}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-slate-700 tabular-nums">
                          {new Intl.NumberFormat('fr-FR').format(product.unitPrice || 0)} FCFA
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-slate-900 tabular-nums">
                          {new Intl.NumberFormat('fr-FR').format(value)} FCFA
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                            Rupture
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                            Faible
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-6 py-4 text-sm shadow-xl flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
              : "bg-gradient-to-r from-rose-500 to-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
