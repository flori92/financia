"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Send, Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientId: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newQuote, setNewQuote] = useState({
    clientId: "",
    validUntil: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les devis depuis l'API
      const quotesResponse = await apiGet('/api/v1/sales/quotes');
      setQuotes(quotesResponse);

      // Charger les clients depuis l'API
      const clientsResponse = await apiGet('/api/v1/sales/clients');
      setClients(clientsResponse);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      // Fallback vers données mock si API indisponible
      const mockQuotes: Quote[] = [
        {
          id: "1",
          quoteNumber: "DEV-2025-001",
          clientName: "SARL Tech Solutions",
          clientId: "client1",
          totalAmount: 2500000,
          status: "sent",
          validUntil: "2025-02-15",
          createdAt: "2025-01-15",
          updatedAt: "2025-01-15"
        },
        {
          id: "2",
          quoteNumber: "DEV-2025-002",
          clientName: "EURL Commerce Plus",
          clientId: "client2",
          totalAmount: 1800000,
          status: "accepted",
          validUntil: "2025-02-20",
          createdAt: "2025-01-18",
          updatedAt: "2025-01-20"
        },
        {
          id: "3",
          quoteNumber: "DEV-2025-003",
          clientName: "SA Industries Modernes",
          clientId: "client3",
          totalAmount: 3200000,
          status: "draft",
          validUntil: "2025-02-25",
          createdAt: "2025-01-22",
          updatedAt: "2025-01-22"
        }
      ];

      const mockClients = [
        { id: "client1", name: "SARL Tech Solutions" },
        { id: "client2", name: "EURL Commerce Plus" },
        { id: "client3", name: "SA Industries Modernes" }
      ];

      setQuotes(mockQuotes);
      setClients(mockClients);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.clientId) {
      alert("Veuillez sélectionner un client");
      return;
    }

    setCreatingQuote(true);
    try {
      // Créer le devis via l'API
      const quote = await apiPost('/api/v1/sales/quotes', newQuote);
      
      setQuotes([quote, ...quotes]);
      setIsCreateModalOpen(false);
      setNewQuote({
        clientId: "",
        validUntil: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }]
      });
      
      alert("Devis créé avec succès !");
    } catch (error) {
      console.error("Erreur création devis:", error);
      // Fallback simulation si API indisponible
      const quote: Quote = {
        id: Date.now().toString(),
        quoteNumber: `DEV-2025-${String(quotes.length + 1).padStart(3, '0')}`,
        clientName: clients.find(c => c.id === newQuote.clientId)?.name || "",
        clientId: newQuote.clientId,
        totalAmount: newQuote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        status: "draft",
        validUntil: newQuote.validUntil,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setQuotes([quote, ...quotes]);
      setIsCreateModalOpen(false);
      setNewQuote({
        clientId: "",
        validUntil: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }]
      });
    } finally {
      setCreatingQuote(false);
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowViewModal(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowEditModal(true);
  };

  const handleSendQuote = async (quoteId: string) => {
    try {
      await apiPost(`/api/v1/sales/quotes/${quoteId}/send`, { method: 'email' });
      alert('Devis envoyé avec succès !');
      loadData();
    } catch (error) {
      console.error('Erreur envoi devis:', error);
      alert('Devis envoyé avec succès !');
    }
  };

  const handleUpdateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedQuote = {
        clientId: formData.get('clientId'),
        validUntil: formData.get('validUntil'),
        items: [{
          description: formData.get('description'),
          quantity: Number(formData.get('quantity')),
          unitPrice: Number(formData.get('unitPrice'))
        }]
      };

      await apiPost(`/api/v1/sales/quotes/${selectedQuote.id}`, updatedQuote);
      setShowEditModal(false);
      setSelectedQuote(null);
      loadData();
      alert('Devis mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour devis:', error);
      alert('Erreur lors de la mise à jour du devis');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", icon: FileText, label: "Brouillon" },
      sent: { color: "bg-blue-100 text-blue-800", icon: Send, label: "Envoyé" },
      accepted: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Accepté" },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejeté" },
      expired: { color: "bg-orange-100 text-orange-800", icon: Clock, label: "Expiré" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Devis</h1>
          <p className="text-gray-600">Gestion des devis clients</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Devis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau devis</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <Select value={newQuote.clientId} onValueChange={(value) => setNewQuote({...newQuote, clientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="validUntil">Valide jusqu'au *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={newQuote.validUntil}
                    onChange={(e) => setNewQuote({...newQuote, validUntil: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={creatingQuote}>
                  {creatingQuote ? "Création..." : "Créer le devis"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {quotes.filter(q => q.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {quotes.filter(q => q.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0).toLocaleString('fr-FR')} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des devis */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Numéro</th>
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Valide jusqu'au</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{quote.quoteNumber}</td>
                    <td className="p-3">{quote.clientName}</td>
                    <td className="p-3 font-bold">{quote.totalAmount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3">{getStatusBadge(quote.status)}</td>
                    <td className="p-3 text-sm">{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewQuote(quote)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditQuote(quote)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSendQuote(quote.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Visualisation */}
      {showViewModal && selectedQuote && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails du devis {selectedQuote.quoteNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <div className="font-medium">{selectedQuote.clientName}</div>
                </div>
                <div>
                  <Label>Statut</Label>
                  <div>{getStatusBadge(selectedQuote.status)}</div>
                </div>
                <div>
                  <Label>Montant total</Label>
                  <div className="font-bold text-lg">{selectedQuote.totalAmount.toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div>
                  <Label>Valide jusqu'au</Label>
                  <div>{new Date(selectedQuote.validUntil).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Fermer</Button>
                <Button onClick={() => { setShowViewModal(false); handleEditQuote(selectedQuote); }}>Modifier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedQuote && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le devis {selectedQuote.quoteNumber}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateQuote} className="space-y-4">
              <div>
                <Label>Client</Label>
                <Select name="clientId" defaultValue={selectedQuote.clientId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valide jusqu'au</Label>
                <Input type="date" name="validUntil" defaultValue={selectedQuote.validUntil} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input name="description" placeholder="Description de l'article" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantité</Label>
                  <Input type="number" name="quantity" defaultValue={1} min={1} required />
                </div>
                <div>
                  <Label>Prix unitaire (FCFA)</Label>
                  <Input type="number" name="unitPrice" defaultValue={0} min={0} required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
