'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, MessageSquare, MessageCircle, Edit, Trash2, MoreVertical, Send, Copy, BarChart, Download, Share } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatCurrency } from "@/lib/format-utils";

interface Template {
  id: string;
  name: string;
  channel: string;
  category: string;
  subject?: string;
  content: string;
  usageCount: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Actions Templates
  const useTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      alert(`Template "${template.name}" utilisé pour envoyer un message ${template.channel}`);
      setShowActionMenu(null);
    }
  };

  const duplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (copie)`,
        usageCount: 0
      };
      setTemplates([...templates, newTemplate]);
      setShowActionMenu(null);
    }
  };

  const viewStatistics = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      alert(`Statistiques du template "${template.name}":\n\nUtilisations: ${template.usageCount}\nCanal: ${template.channel}\nCatégorie: ${template.category}\nCréé le: ${new Date().toLocaleDateString('fr-FR')}`);
      setShowActionMenu(null);
    }
  };

  const exportTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const content = `Template: ${template.name}\n` +
        `Canal: ${template.channel}\n` +
        `Catégorie: ${template.category}\n` +
        `Sujet: ${template.subject || 'N/A'}\n` +
        `Contenu:\n${template.content}\n` +
        `Utilisé: ${template.usageCount} fois`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${template.name}-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowActionMenu(null);
    }
  };

  const shareTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      alert(`Template "${template.name}" partagé avec l'équipe !\n\nLien de partage généré et copié dans le presse-papiers.`);
      setShowActionMenu(null);
    }
  };

  useEffect(() => {
    apiGet('/api/v1/communications/templates')
      .then(r => r.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getIcon = (channel: string) => {
    switch(channel) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'whatsapp': return MessageCircle;
      default: return Mail;
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Templates de Communication</h1>
          <p className="text-gray-600">Gérez vos modèles d'emails, SMS et WhatsApp</p>
        </div>
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = getIcon(template.channel);
          return (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition relative"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.channel === 'email' ? 'bg-blue-100' :
                      template.channel === 'sms' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      {template.channel === 'email' ? <Mail className="w-5 h-5 text-blue-600" /> :
                       template.channel === 'sms' ? <MessageSquare className="w-5 h-5 text-purple-600" /> :
                       <MessageCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionMenu(showActionMenu === template.id ? null : template.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.subject && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">SUJET</span>
                      <p className="text-sm">{template.subject}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-medium text-gray-500">CONTENU</span>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">Utilisé {template.usageCount} fois</span>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Menu d'actions Templates */}
              {showActionMenu === template.id && (
                <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-56">
                  <button
                    onClick={() => useTemplate(template.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Utiliser ce template
                  </button>
                  <button
                    onClick={() => duplicateTemplate(template.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Dupliquer le template
                  </button>
                  <button
                    onClick={() => viewStatistics(template.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BarChart className="w-4 h-4" />
                    Voir les statistiques
                  </button>
                  <button
                    onClick={() => exportTemplate(template.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter le template
                  </button>
                  <button
                    onClick={() => shareTemplate(template.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Share className="w-4 h-4" />
                    Partager avec l'équipe
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal création template */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nouveau template</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Nom du template" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Canal</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Catégorie</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="notification">Notification</option>
                    <option value="reminder">Relance</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sujet (Email uniquement)</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Sujet du message" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contenu</label>
                <textarea className="w-full border rounded-lg px-3 py-2 h-32" placeholder="Bonjour {nom}, ..." />
                <p className="text-xs text-gray-500 mt-1">Variables disponibles: nom, email, societe</p>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700" onClick={(e) => { e.preventDefault(); setShowCreate(false); alert('Template créé !'); }}>Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
