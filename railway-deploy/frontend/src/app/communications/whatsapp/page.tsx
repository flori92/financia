'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Check, CheckCheck, Clock, MoreVertical, RefreshCw, Download, Reply, Archive } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatCurrency } from "@/lib/format-utils";

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
  const [showCompose, setShowCompose] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Actions WhatsApp
  const resendMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      // Simuler renvoi
      alert(`Message renvoyé à ${message.contact}: ${message.message}`);
      setShowActionMenu(null);
    }
  };

  const viewDeliveryDetails = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      alert(`Détails de livraison pour ${message.contact}:\n\nStatut: ${message.status}\nEnvoyé le: ${new Date(message.sentAt).toLocaleString('fr-FR')}\nTéléphone: ${message.phone}\nType: ${message.type}`);
      setShowActionMenu(null);
    }
  };

  const exportConversation = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const content = `Conversation WhatsApp - ${message.contact}\n` +
        `Date: ${new Date(message.sentAt).toLocaleString('fr-FR')}\n` +
        `Téléphone: ${message.phone}\n` +
        `Message: ${message.message}\n` +
        `Statut: ${message.status}\n` +
        `Type: ${message.type}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsapp-${message.contact}-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowActionMenu(null);
    }
  };

  const replyToMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setShowCompose(true);
      setShowActionMenu(null);
    }
  };

  const archiveConversation = (messageId: string) => {
    setMessages(messages.filter(m => m.id !== messageId));
    setShowActionMenu(null);
  };

  useEffect(() => {
    apiGet('/api/v1/communications/whatsapp')
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
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowCompose(true)}
        >
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
                  <th className="text-left p-3"></th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className="border-b hover:bg-gray-50 relative"
                  >
                    <td className="p-3 font-medium">{msg.contact}</td>
                    <td className="p-3 text-sm">{msg.phone}</td>
                    <td className="p-3 text-sm text-gray-600 max-w-md truncate">{msg.message}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        msg.type === 'reminder' ? 'bg-orange-100 text-orange-800' :
                        msg.type === 'notification' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {msg.type === 'reminder' ? 'Rappel' :
                         msg.type === 'notification' ? 'Notification' : 'Info'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`flex items-center gap-1 text-xs ${
                        msg.status === 'delivered' ? 'text-green-600' :
                        msg.status === 'sent' ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {msg.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> :
                         msg.status === 'sent' ? <Check className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {msg.status === 'delivered' ? 'Livré' :
                         msg.status === 'sent' ? 'Envoyé' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(msg.sentAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(showActionMenu === msg.id ? null : msg.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Menu d'actions WhatsApp */}
                {showActionMenu && (
                  <tr>
                    <td colSpan={7} className="p-0 relative">
                      <div className="absolute right-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-56">
                        <button
                          onClick={() => resendMessage(showActionMenu)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Renvoyer le message
                        </button>
                        <button
                          onClick={() => viewDeliveryDetails(showActionMenu)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <CheckCheck className="w-4 h-4" />
                          Voir détails de livraison
                        </button>
                        <button
                          onClick={() => exportConversation(showActionMenu)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exporter la conversation
                        </button>
                        <button
                          onClick={() => replyToMessage(showActionMenu)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Reply className="w-4 h-4" />
                          Répondre directement
                        </button>
                        <button
                          onClick={() => archiveConversation(showActionMenu)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Archive className="w-4 h-4" />
                          Archiver la conversation
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal composition WhatsApp */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nouveau message WhatsApp</h3>
              <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <input type="tel" className="w-full border rounded-lg px-3 py-2" placeholder="+229 XX XX XX XX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea className="w-full border rounded-lg px-3 py-2 h-32" placeholder="Votre message..." />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" onClick={(e) => { e.preventDefault(); setShowCompose(false); alert('Message WhatsApp envoyé !'); }}>Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
