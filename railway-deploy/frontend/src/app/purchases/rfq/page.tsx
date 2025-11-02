"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, FileText, Clock } from "lucide-react";
import { CreateRFQModal } from "@/components/purchases/create-rfq-modal";

interface RFQ {
  id: string;
  title: string;
  description: string;
  deadline: string;
  budget: string;
  requirements: string;
  status: "draft" | "published" | "closed";
  referenceNumber: string;
  createdAt: string;
  responses?: any[];
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les RFQ depuis le backend
  const loadRFQs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/purchases/rfq', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRfqs(data);
      } else {
        console.error('Erreur lors du chargement des RFQ');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRFQs();
  }, []);

  const handleCreateRFQ = (newRFQ: RFQ) => {
    setRfqs(prev => [newRFQ, ...prev]);
  };

  const handlePublishRFQ = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/purchases/rfq/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadRFQs(); // Recharger la liste
        alert('Appel d\'offres publié avec succès !');
      } else {
        alert('Erreur lors de la publication');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication');
    }
  };

  const getStatusBadge = (status: RFQ["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "published":
        return <Badge variant="default">Publié</Badge>;
      case "closed":
        return <Badge variant="outline">Clôturé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expiré";
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    return `${diffDays} jours`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Appels d'Offres</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Chargement...
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-slate-600">
              Chargement des appels d'offres...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appels d'Offres</h1>
        <CreateRFQModal onSubmit={handleCreateRFQ}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel appel d'offres
          </Button>
        </CreateRFQModal>
      </div>

      {rfqs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Demandes de devis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Aucun appel d'offres en cours</p>
              <CreateRFQModal onSubmit={handleCreateRFQ}>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier appel d'offres
                </Button>
              </CreateRFQModal>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{rfq.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Limite: {new Date(rfq.deadline).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {rfq.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{rfq.budget}</span>
                        </div>
                      )}
                      <span className="text-xs text-slate-500">
                        Réf: {rfq.referenceNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(rfq.status)}
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{getDaysUntilDeadline(rfq.deadline)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rfq.description && (
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-1">Description</h4>
                      <p className="text-sm text-slate-600">{rfq.description}</p>
                    </div>
                  )}
                  {rfq.requirements && (
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-1">Spécifications</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{rfq.requirements}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-xs text-slate-500">
                      Créé le {new Date(rfq.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="flex gap-2">
                      {rfq.status === "draft" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePublishRFQ(rfq.id)}
                        >
                          Publier
                        </Button>
                      )}
                      {rfq.status === "published" && (
                        <Button size="sm" variant="outline">
                          Voir les réponses ({rfq.responses?.length || 0})
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
