'use client';
import { getBaseUrl } from "@/lib/api";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getBaseUrl()}/api/v1/support/tickets`)
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Client</h1>
          <p className="text-gray-600">Gérez les tickets de support</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fermés</CardTitle>
            <XCircle className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">N°</th>
                  <th className="text-left p-3">Sujet</th>
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Priorité</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Assigné à</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{ticket.number}</td>
                    <td className="p-3 font-medium">{ticket.subject}</td>
                    <td className="p-3">{ticket.customer}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ticket.priority === 'high' ? 'Haute' : 
                         ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                        ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status === 'open' ? 'Ouvert' :
                         ticket.status === 'in_progress' ? 'En cours' :
                         ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                      </span>
                    </td>
                    <td className="p-3">{ticket.assignedTo || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">Voir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
