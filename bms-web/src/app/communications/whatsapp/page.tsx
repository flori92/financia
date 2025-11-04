'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Check, CheckCheck, Clock } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  contact: string;
  phone: string;
  message: string;
  type: string;
  status: string;
  sentAt: string;
}

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://bms-production-d9e9.up.railway.app/api/v1/communications/whatsapp')
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
    read: messages.filter(m => m.status === 'read').length,
    failed: messages.filter(m => m.status === 'failed').length,
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <p className="text-gray-600">Communiquez avec vos clients via WhatsApp</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
            <Check className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Délivrés</CardTitle>
            <CheckCheck className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lus</CardTitle>
            <CheckCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Échecs</CardTitle>
            <Clock className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Contact</th>
                  <th className="text-left p-3">Téléphone</th>
                  <th className="text-left p-3">Message</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{msg.contact}</td>
                    <td className="p-3 text-sm">{msg.phone}</td>
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
                      <div className="flex items-center gap-2">
                        {msg.status === 'read' && <CheckCheck className="w-4 h-4 text-green-600" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-4 h-4 text-blue-600" />}
                        {msg.status === 'sent' && <Check className="w-4 h-4 text-gray-600" />}
                        {msg.status === 'failed' && <Clock className="w-4 h-4 text-red-600" />}
                        <span className="text-sm">
                          {msg.status === 'read' ? 'Lu' :
                           msg.status === 'delivered' ? 'Délivré' :
                           msg.status === 'sent' ? 'Envoyé' : 'Échec'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{new Date(msg.sentAt).toLocaleString('fr-FR')}</td>
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
