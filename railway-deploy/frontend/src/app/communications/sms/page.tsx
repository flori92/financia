'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Send, Users, TrendingUp } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface SMSMessage {
  id: string;
  recipient: string;
  message: string;
  type: string;
  status: string;
  sentAt: string;
  cost: number;
}

export default function SMSPage() {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/v1/communications/sms')
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    sent: messages.filter(m => m.status === 'sent').length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    failed: messages.filter(m => m.status === 'failed').length,
    pending: messages.filter(m => m.status === 'pending').length,
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SMS</h1>
          <p className="text-gray-600">Envoyez des SMS à vos clients</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau SMS
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
            <Send className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Délivrés</CardTitle>
            <MessageSquare className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Users className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Échecs</CardTitle>
            <TrendingUp className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des SMS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Destinataire</th>
                  <th className="text-left p-3">Message</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Coût</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{msg.recipient}</td>
                    <td className="p-3 text-sm text-gray-600 max-w-md truncate">{msg.message}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        msg.type === 'reminder' ? 'bg-orange-100 text-orange-800' :
                        msg.type === 'notification' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {msg.type === 'reminder' ? 'Relance' : 
                         msg.type === 'notification' ? 'Notification' : 'Marketing'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        msg.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        msg.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        msg.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {msg.status === 'delivered' ? 'Délivré' :
                         msg.status === 'sent' ? 'Envoyé' :
                         msg.status === 'pending' ? 'En attente' : 'Échec'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{new Date(msg.sentAt).toLocaleString('fr-FR')}</td>
                    <td className="p-3 text-sm">{msg.cost} FCFA</td>
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
