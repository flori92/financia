"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useCompanyId } from '@/hooks/useCompanyId';
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SupplierModal from "@/components/purchases/supplier-modal";

export default function SuppliersPage() {
  const companyId = useCompanyId();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, [companyId]);

  const loadSuppliers = () => {
    apiGet("/purchases/suppliers", { companyId })
      .then(setSuppliers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Handler pour créer un fournisseur
  const handleCreateSupplier = async (supplierData: any) => {
    try {
      const newSupplier = await apiPost("/purchases/suppliers", { ...supplierData, companyId });
      await loadSuppliers();
      return newSupplier;
    } catch (error: any) {
      console.error("Erreur création fournisseur:", error);
      throw error;
    }
  };

  // Handler pour supprimer un fournisseur
  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      return;
    }
    
    try {
      await apiDelete(`/purchases/suppliers/${supplierId}`, { companyId });
      await loadSuppliers();
      console.log("Fournisseur supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur suppression fournisseur:", error);
      alert(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleSupplierCreated = (newSupplier: any) => {
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fournisseurs</h1>
        <SupplierModal onSupplierCreated={handleSupplierCreated}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau fournisseur
          </Button>
        </SupplierModal>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs ({suppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="mb-4">
                <Plus className="w-12 h-12 mx-auto text-slate-300" />
              </div>
              <p>Aucun fournisseur enregistré</p>
              <p className="text-sm">Cliquez sur "Nouveau fournisseur" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suppliers.map((s: any) => (
                <div key={s.id} className="flex justify-between p-3 border rounded hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="font-medium">{s.name}</div>
                    {s.email && <div className="text-sm text-slate-600">{s.email}</div>}
                    {s.address && <div className="text-sm text-slate-600">{s.address}</div>}
                    {s.description && <div className="text-xs text-slate-500 mt-1">{s.description}</div>}
                  </div>
                  <div className="text-right">
                    {s.phone && <div className="text-sm text-slate-600">{s.phone}</div>}
                    {s.taxId && <div className="text-xs text-slate-500">{s.taxId}</div>}
                    <div className="text-xs text-emerald-600 font-medium">
                      {s.status === 'active' ? 'Actif' : s.status}
                    </div>
                    {s.createdAt && (
                      <div className="text-xs text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
