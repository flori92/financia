"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";

interface RFQData {
  title: string;
  description: string;
  deadline: string;
  budget: string;
  requirements: string;
}

interface CreateRFQModalProps {
  children: React.ReactNode;
  onSubmit?: (data: RFQData) => void;
}

export function CreateRFQModal({ children, onSubmit }: CreateRFQModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RFQData>({
    title: "",
    description: "",
    deadline: "",
    budget: "",
    requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation basique
      if (!formData.title || !formData.deadline) {
        alert("Veuillez remplir les champs obligatoires");
        return;
      }

      // Préparer les données pour l'API
      const rfqData = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        budget: formData.budget,
        requirements: formData.requirements,
      };

      console.log("Création RFQ:", rfqData);

      // Appel API backend
      const response = await fetch('/api/v1/purchases/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(rfqData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'appel d\'offres');
      }

      const createdRFQ = await response.json();
      console.log("RFQ créé:", createdRFQ);

      // Appeler la fonction de callback si fournie
      if (onSubmit) {
        onSubmit(createdRFQ);
      }

      // Fermer le modal et réinitialiser le formulaire
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        deadline: "",
        budget: "",
        requirements: "",
      });

      alert("Appel d'offres créé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création de l'appel d'offres");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RFQData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="create-rfq-description">
        <DialogHeader>
          <DialogTitle>Nouvel Appel d'Offres</DialogTitle>
          <p id="create-rfq-description" className="text-sm text-slate-600">
            Créez une nouvelle demande de devis pour vos fournisseurs
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'appel d'offres *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Fourniture de matériel informatique"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite de réponse *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget estimatif</Label>
            <Input
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              placeholder="Ex: 5000000 FCFA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description détaillée de votre besoin..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Spécifications techniques</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              placeholder="Listez les exigences techniques, certifications, etc."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'appel d'offres"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
