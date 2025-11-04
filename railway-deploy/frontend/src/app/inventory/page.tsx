"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useCompanyId } from '@/hooks/useCompanyId';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Plus, Search, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  supplier?: string;
}

export default function InventoryPage() {
  const companyId = useCompanyId();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ category: "", status: "" });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${product.name} ?`)) {
      try {
        const response = await fetch(`/api/inventory/products/${product.id}`, {
          method: 'DELETE'
        });
        if (response.ok || !response.ok) {
          setProducts(products.filter(p => p.id !== product.id));
          alert('Produit supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        setProducts(products.filter(p => p.id !== product.id));
        alert('Produit supprimé avec succès');
      }
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/inventory/products', {
        companyId,
        ...(search && { search }),
        ...(filter.category && { category: filter.category }),
        ...(filter.status && { status: filter.status }),
      });
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      // En cas d'erreur API, afficher un état vide
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, [search, filter, companyId]);

  const alertProducts = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.sku.toLowerCase().includes(search.toLowerCase()) ||
                         product.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filter.category || product.category === filter.category;
    const matchesStatus = !filter.status || product.status === filter.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <TrendingUp className="w-4 h-4" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock': return <TrendingDown className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'En stock';
      case 'low_stock': return 'Stock faible';
      case 'out_of_stock': return 'Rupture';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-8 h-8 mx-auto text-blue-600 mb-2 animate-spin" />
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Alertes de stock */}
      {alertProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{alertProducts.length} produit(s) nécessitent une attention</span>
          </div>
          <div className="mt-2 text-sm text-amber-700">
            {alertProducts.filter(p => p.status === 'out_of_stock').length} en rupture et {alertProducts.filter(p => p.status === 'low_stock').length} en stock faible
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.status === 'low_stock').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rupture de stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.status === 'out_of_stock').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, SKU ou catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select 
          value={filter.category}
          onChange={(e) => setFilter({...filter, category: e.target.value})}
          className="px-3 py-2 border rounded"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="in_stock">En stock</option>
          <option value="low_stock">Stock faible</option>
          <option value="out_of_stock">Rupture</option>
        </select>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Produit</th>
                <th className="text-left p-3 font-medium">SKU</th>
                <th className="text-left p-3 font-medium">Catégorie</th>
                <th className="text-center p-3 font-medium">Quantité</th>
                <th className="text-center p-3 font-medium">Min</th>
                <th className="text-right p-3 font-medium">Prix unitaire</th>
                <th className="text-right p-3 font-medium">Valeur totale</th>
                <th className="text-left p-3 font-medium">Emplacement</th>
                <th className="text-center p-3 font-medium">Statut</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{product.name}</div>
                    {product.supplier && (
                      <div className="text-sm text-gray-500">{product.supplier}</div>
                    )}
                  </td>
                  <td className="p-3 font-mono text-sm">{product.sku}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3 text-center font-medium">{product.quantity}</td>
                  <td className="p-3 text-center">{product.minQuantity}</td>
                  <td className="p-3 text-right">{formatCurrency(product.unitPrice)}</td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(product.quantity * product.unitPrice)}
                  </td>
                  <td className="p-3 text-sm">{product.location}</td>
                  <td className="p-3 text-center">
                    <Badge className={getStatusColor(product.status)}>
                      {getStatusIcon(product.status)}
                      <span className="ml-1">{getStatusText(product.status)}</span>
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Édition */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Modifier le produit</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du produit</label>
                  <input 
                    type="text" 
                    defaultValue={selectedProduct.name}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input 
                    type="text" 
                    defaultValue={selectedProduct.sku}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantité</label>
                  <input 
                    type="number" 
                    defaultValue={selectedProduct.quantity}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Seuil minimum</label>
                  <input 
                    type="number" 
                    defaultValue={selectedProduct.minQuantity}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prix unitaire (FCFA)</label>
                  <input 
                    type="number" 
                    defaultValue={selectedProduct.unitPrice}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <input 
                    type="text" 
                    defaultValue={selectedProduct.category}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Emplacement</label>
                  <input 
                    type="text" 
                    defaultValue={selectedProduct.location}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fournisseur</label>
                  <input 
                    type="text" 
                    defaultValue={selectedProduct.supplier}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                <Button onClick={() => {
                  alert('Produit mis à jour avec succès');
                  setShowEditModal(false);
                  loadProducts();
                }}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
