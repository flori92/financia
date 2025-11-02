"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface SupplierModalProps {
  onSupplierCreated: (supplier: any) => void;
  children: React.ReactNode;
}

export default function SupplierModal({ onSupplierCreated, children }: SupplierModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSupplier = await apiPost("/api/v1/purchases/suppliers", formData);
      onSupplierCreated(newSupplier);
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        taxId: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating supplier:", error);
      alert("Erreur lors de la création du fournisseur");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Fournisseur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nom du fournisseur"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@fournisseur.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+225 00 00 00 00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Identifiant Fiscal</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleInputChange("taxId", e.target.value)}
                placeholder="Numéro TVA/IFU"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Adresse complète"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Notes ou informations supplémentaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le fournisseur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
