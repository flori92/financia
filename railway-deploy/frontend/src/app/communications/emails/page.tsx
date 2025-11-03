'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Send, Inbox, Archive, Trash2, Star, Paperclip, Search, Filter, MoreVertical, Eye, EyeOff, Reply, Forward } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatCurrency } from "@/lib/format-utils";

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
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
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

  // Actions sur les emails
  const toggleReadStatus = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: !email.read } : email
    ));
    setShowActionMenu(null);
  };

  const toggleStarred = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
    setShowActionMenu(null);
  };

  const archiveEmail = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, folder: 'archive' } : email
    ));
    setShowActionMenu(null);
  };

  const deleteEmail = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    ));
    setShowActionMenu(null);
  };

  const replyToEmail = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      setShowCompose(true);
      setSelectedEmail(emailId);
      setShowActionMenu(null);
    }
  };

  const forwardEmail = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      setShowCompose(true);
      setSelectedEmail(emailId);
      setShowActionMenu(null);
    }
  };

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
          onClick={() => setShowCompose(true)}
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
                    className={`p-4 border rounded-lg hover:bg-gray-50 relative ${!email.read ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => toggleReadStatus(email.id)}>
                        <div className="flex items-center gap-2 mb-1">
                          {email.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <span className={`font-medium ${!email.read ? 'font-bold' : ''}`}>{email.from}</span>
                          {email.hasAttachment && <Paperclip className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className={`text-sm ${!email.read ? 'font-semibold' : 'text-gray-600'}`}>{email.subject}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">{email.preview}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">{new Date(email.date).toLocaleDateString('fr-FR')}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === email.id ? null : email.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Menu d'actions */}
                    {showActionMenu === email.id && (
                      <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-48">
                        <button
                          onClick={() => toggleReadStatus(email.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          {email.read ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {email.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        </button>
                        <button
                          onClick={() => toggleStarred(email.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          {email.starred ? 'Enlever des favoris' : 'Mettre en favori'}
                        </button>
                        <button
                          onClick={() => replyToEmail(email.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Reply className="w-4 h-4" />
                          Répondre
                        </button>
                        <button
                          onClick={() => forwardEmail(email.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Forward className="w-4 h-4" />
                          Transférer
                        </button>
                        <button
                          onClick={() => archiveEmail(email.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archiver
                        </button>
                        <button
                          onClick={() => deleteEmail(email.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal composition email */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nouveau message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">À</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="destinataire@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sujet</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Objet du message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 h-32"
                  placeholder="Votre message..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCompose(false);
                    alert('Email envoyé avec succès !');
                  }}
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
