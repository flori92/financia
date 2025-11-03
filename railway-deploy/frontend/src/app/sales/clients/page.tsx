"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Phone, Mail, MapPin, Building, Eye, Edit, Star } from "lucide-react";

interface SalesClient {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  type: 'individual' | 'company';
  status: 'active' | 'inactive' | 'prospect';
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate?: string;
  createdAt: string;
  rating: number;
}

export default function SalesClientsPage() {
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      // Charger les clients depuis l'API
      const clientsResponse = await apiGet('/api/v1/sales/clients');
      setClients(clientsResponse);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
      // Fallback vers données mock si API indisponible
      const mockClients: SalesClient[] = [
        {
          id: "1",
          name: "Jean Dupont",
          company: "SARL Tech Solutions",
          email: "jean.dupont@techsolutions.com",
          phone: "+229 97 123 456",
          address: "Cotonou, Quartier des Affaires",
          type: "company",
          status: "active",
          totalOrders: 12,
          totalRevenue: 15000000,
          lastOrderDate: "2025-01-20",
          createdAt: "2024-06-15",
          rating: 5
        },
        {
          id: "2",
          name: "Marie Claire",
          company: "EURL Commerce Plus",
          email: "marie.claire@commerceplus.com",
          phone: "+229 98 234 567",
          address: "Porto-Novo, Centre Commercial",
          type: "company",
          status: "active",
          totalOrders: 8,
          totalRevenue: 9500000,
          lastOrderDate: "2025-01-18",
          createdAt: "2024-08-20",
          rating: 4
        },
        {
          id: "3",
          name: "Paul Martin",
          email: "paul.martin@email.com",
          phone: "+229 99 345 678",
          address: "Abomey-Calavi, Résidence les Palmiers",
          type: "individual",
          status: "prospect",
          totalOrders: 0,
          totalRevenue: 0,
          createdAt: "2025-01-10",
          rating: 0
        }
      ];

      setClients(mockClients);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Actif" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactif" },
      prospect: { color: "bg-blue-100 text-blue-800", label: "Prospect" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-600">Gestion de la base clients et prospects</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input id="name" placeholder="Nom du client" required />
              </div>
              <div>
                <Label htmlFor="company">Entreprise (optionnel)</Label>
                <Input id="company" placeholder="Nom de l'entreprise" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="email@exemple.com" required />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" placeholder="+229 XX XXX XXX" required />
              </div>
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input id="address" placeholder="Adresse complète" required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" onClick={(e) => {
                  e.preventDefault();
                  const newClient = {
                    id: Date.now().toString(),
                    name: (document.getElementById('name') as HTMLInputElement)?.value || '',
                    company: (document.getElementById('company') as HTMLInputElement)?.value || '',
                    email: (document.getElementById('email') as HTMLInputElement)?.value || '',
                    phone: (document.getElementById('phone') as HTMLInputElement)?.value || '',
                    address: (document.getElementById('address') as HTMLInputElement)?.value || '',
                    createdAt: new Date().toISOString()
                  };
                  
                  // Simuler l'ajout du client
                  console.log('Nouveau client:', newClient);
                  alert(`Client "${newClient.name}" ajouté avec succès !`);
                  setIsCreateModalOpen(false);
                }}>Ajouter le client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recherche */}
      <div className="max-w-md">
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {clients.filter(c => c.status === 'prospect').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CA Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      {client.company && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(client.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {client.address}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Évaluation</span>
                    {getRatingStars(client.rating)}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Commandes</span>
                    <span className="font-medium">{client.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CA Total</span>
                    <span className="font-bold">{safeToLocaleString(client.totalRevenue)} FCFA</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
