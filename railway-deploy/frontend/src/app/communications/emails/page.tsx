'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Send, Inbox, Archive, Trash2, Star, Paperclip } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: string;
  hasAttachment: boolean;
}

interface Template {
  id: string;
  name: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('inbox');

  useEffect(() => {
    Promise.all([
      apiGet('/api/v1/communications/emails').then(r => r.json()),
      apiGet('/api/v1/communications/templates').then(r => r.json())
    ]).then(([emailsData, templatesData]) => {
      setEmails(emailsData);
      setTemplates(templatesData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const folders = [
    { id: 'inbox', name: 'Boîte de réception', icon: Inbox, count: emails.filter(e => e.folder === 'inbox').length },
    { id: 'sent', name: 'Envoyés', icon: Send, count: emails.filter(e => e.folder === 'sent').length },
    { id: 'starred', name: 'Favoris', icon: Star, count: emails.filter(e => e.starred).length },
    { id: 'archive', name: 'Archives', icon: Archive, count: emails.filter(e => e.folder === 'archive').length },
    { id: 'trash', name: 'Corbeille', icon: Trash2, count: emails.filter(e => e.folder === 'trash').length },
  ];

  const filteredEmails = emails.filter(e => 
    selectedFolder === 'starred' ? e.starred : e.folder === selectedFolder
  );

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Emails</h1>
          <p className="text-gray-600">Gérez vos communications par email</p>
        </div>
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => {
            // Ouvrir modal nouveau message
            alert('Fonctionnalité Nouveau Message - En développement !\n\nCette fonctionnalité permettra :\n• Composer un nouvel email\n• Choisir des destinataires\n• Utiliser des templates\n• Ajouter des pièces jointes\n• Programmer l\'envoi');
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Message
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              {folders.map((folder) => {
                const Icon = folder.icon;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                      selectedFolder === folder.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {folder.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template) => (
                <button 
                  key={template.id} 
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                  onClick={() => {
                    alert(`Template: ${template.name}\n\nUtiliser ce template pour composer un nouveau message.\n\nFonctionnalités :\n• Pré-remplir le sujet et contenu\n• Personnaliser avec variables\n• Envoyer immédiatement ou programmer`);
                  }}
                >
                  {template.name}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>{folders.find(f => f.id === selectedFolder)?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <div 
                    key={email.id} 
                    className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${!email.read ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => {
                      alert(`Email: ${email.subject}\n\nDe: ${email.from}\nDate: ${new Date(email.date).toLocaleDateString('fr-FR')}\n\nFonctionnalités disponibles :\n• Marquer comme lu/non lu\n• Mettre en favori\n• Archiver\n• Supprimer\n• Répondre / Transférer`);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {email.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <span className={`font-medium ${!email.read ? 'font-bold' : ''}`}>{email.from}</span>
                          {email.hasAttachment && <Paperclip className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className={`text-sm ${!email.read ? 'font-semibold' : 'text-gray-600'}`}>{email.subject}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">{email.preview}</div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">{new Date(email.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
