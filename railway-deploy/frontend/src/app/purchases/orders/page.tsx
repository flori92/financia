"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";
import { Plus, Loader2, AlertCircle, Edit, Trash2, Calendar, DollarSign } from "lucide-react";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';
  totalAmount: number;
  receivedAmount: number;
  createdAt: string;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  received: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  approved: 'Approuvé',
  received: 'Reçu',
  cancelled: 'Annulé',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form refs
  const supplierRef = useRef<HTMLSelectElement>(null);
  const orderDateRef = useRef<HTMLInputElement>(null);
  const deliveryDateRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée");
        setLoading(false);
        return;
      }

      const [ordersData, suppliersData] = await Promise.all([
        apiGet("/api/v1/purchases/orders", { companyId }),
        apiGet("/api/v1/purchases/suppliers", { companyId }),
      ]);

      setOrders(ordersData);
      setSuppliers(suppliersData);
    } catch (err: any) {
      console.error("Erreur chargement:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
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

      const selectedSupplier = suppliers.find(s => s.id === supplierRef.current?.value);

      const formData = {
        companyId,
        supplierId: supplierRef.current?.value || "",
        supplierName: selectedSupplier?.name || "",
        orderDate: orderDateRef.current?.value || new Date().toISOString().split('T')[0],
        expectedDeliveryDate: deliveryDateRef.current?.value || null,
        totalAmount: parseFloat(amountRef.current?.value || "0"),
        receivedAmount: 0,
      };

      if (!formData.supplierId || formData.totalAmount <= 0) {
        triggerToast("error", "Fournisseur et montant requis");
        return;
      }

      if (editingOrder) {
        await apiPut(`/api/v1/purchases/orders/${editingOrder.id}`, formData);
        triggerToast("success", "Commande modifiée !");
      } else {
        await apiPost("/api/v1/purchases/orders", formData);
        triggerToast("success", "Commande créée !");
      }

      await loadData();
      closeForm();
    } catch (err: any) {
      triggerToast("error", err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      return;
    }

    try {
      await apiDelete(`/api/v1/purchases/orders/${orderId}`);
      triggerToast("success", "Commande annulée");
      await loadData();
    } catch (err: any) {
      triggerToast("error", "Erreur lors de l'annulation");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Erreur</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bons de Commande</h1>
          <p className="text-gray-600 mt-1">Gestion des commandes fournisseurs</p>
        </div>
        <button
          onClick={() => {
            setEditingOrder(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
        >
          <Plus className="w-4 h-4" />
          Nouvelle commande
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingOrder ? "Modifier la commande" : "Nouvelle commande"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fournisseur *</label>
              <select
                ref={supplierRef}
                defaultValue={editingOrder?.supplierId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                required
                disabled={saving}
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date commande *</label>
                <input
                  ref={orderDateRef}
                  type="date"
                  defaultValue={editingOrder?.orderDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  required
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date livraison prévue</label>
                <input
                  ref={deliveryDateRef}
                  type="date"
                  defaultValue={editingOrder?.expectedDeliveryDate?.split('T')[0] || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Montant total (FCFA) *</label>
              <input
                ref={amountRef}
                type="number"
                step="0.01"
                min="0"
                defaultValue={editingOrder?.totalAmount || ""}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488]"
                required
                disabled={saving}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:opacity-50"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Enregistrement..." : editingOrder ? "Modifier" : "Créer"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande trouvée. Créez votre première commande.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-medium">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.supplierName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {new Intl.NumberFormat('fr-FR').format(order.totalAmount)} FCFA
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEdit(order)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleCancel(order.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
